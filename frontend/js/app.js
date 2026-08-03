
import { initNavbar } from '../components/Navbar.js';
import { initFooter } from '../components/Footer.js';
import { createProductCard } from '../components/ProductCard.js';
import { initLocationSection } from '../components/LocationSection.js';
import { obtenerProductos, comprarProductos } from './api.js';
import { obtenerItems, obtenerTotalPagar, actualizarCantidad, vaciarCarrito } from './cart.js';
import { estaAutenticado } from './session.js';
import { abrirModal, mostrarToast } from './ui.js';

const FORMATO_MONEDA = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

document.addEventListener('DOMContentLoaded', () => {
  initNavbar('#navbar', { onCartClick: abrirCarrito, onLoginClick: irALogin });
  initFooter('#footer');
  initLocationSection('#ubicacion');
  configurarBusqueda();
  cargarProductos();
});

function irALogin() {
  window.location.href = 'login.html';
}

/* ---------- Búsqueda / filtro por categoría ---------- */
function configurarBusqueda() {
  const inputBuscar = document.querySelector('#input-buscar');
  const selectCategoria = document.querySelector('#select-categoria');
  if (!inputBuscar && !selectCategoria) return;

  let temporizador;
  const aplicarFiltros = () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      cargarProductos({
        buscar: inputBuscar?.value.trim() || undefined,
        categoria: selectCategoria?.value || undefined,
      });
    }, 350);
  };

  inputBuscar?.addEventListener('input', aplicarFiltros);
  selectCategoria?.addEventListener('change', aplicarFiltros);
}

/* ---------- Catálogo de productos ---------- */
async function cargarProductos(filtros = {}) {
  const grid = document.querySelector('#productos-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="loading-state" style="grid-column: 1/-1;">
      <div class="loading-state__spinner"></div>
      <p>Cargando productos frescos...</p>
    </div>
  `;

  try {
    const { productos } = await obtenerProductos(filtros);
    grid.innerHTML = '';

    if (!productos.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state__icon"><img src="assets/icon-cart.svg" alt="" aria-hidden="true" /></div>
          <p>No encontramos productos con esos filtros.</p>
        </div>
      `;
      return;
    }

    productos.forEach((producto) => {
      grid.appendChild(
        createProductCard(producto, {
          onAdded: () => mostrarToast(`${producto.nombre} agregado al carrito`, 'success'),
        })
      );
    });
  } catch (error) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <p>No se pudieron cargar los productos. intenta de nuevo más tarde.</p>
      </div>
    `;
    mostrarToast(error.message, 'error');
  }
}

/* ---------- Modal del carrito ---------- */
function abrirCarrito() {
  const items = obtenerItems();
  const total = obtenerTotalPagar();

  const filasHtml = items.length
    ? items
        .map(
          (item) => `
        <div class="location-card__item" data-item-id="${item.productoId}">
          <img src="${item.imagenUrl}" alt="${item.nombre}" style="width:56px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0;" />
          <div style="flex:1;">
            <p style="font-weight:600;font-size:0.9rem;">${item.nombre}</p>
            <p style="font-size:0.8rem;color:var(--color-text-muted);">${FORMATO_MONEDA.format(item.precio)} c/u</p>
            <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.3rem;">
              <button class="btn-icon carrito-restar" data-id="${item.productoId}" aria-label="Restar unidad">−</button>
              <span>${item.cantidad}</span>
              <button class="btn-icon carrito-sumar" data-id="${item.productoId}" data-max="${item.stockDisponible}" aria-label="Sumar unidad">+</button>
              <button class="btn-icon carrito-eliminar" data-id="${item.productoId}" aria-label="Eliminar producto" style="margin-left:auto;"></button>
            </div>
          </div>
        </div>`
        )
        .join('')
    : `<div class="empty-state"><div class="empty-state__icon"><img src="assets/icon-cart.svg" alt="" aria-hidden="true" /></div><p>Tu carrito está vacío.</p></div>`;

  const { overlay, cerrar } = abrirModal(`
    <div class="modal__header">
      <h2 class="section-title" style="margin:0;">Tu carrito</h2>
      <button class="modal__close" data-modal-close aria-label="Cerrar">x</button>
    </div>
    <div class="carrito-lista" style="display:flex;flex-direction:column;gap:1rem;">${filasHtml}</div>
    ${
      items.length
        ? `<div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid var(--color-border);padding-top:1rem;">
            <span>Total</span><span>${FORMATO_MONEDA.format(total)}</span>
          </div>
          <button class="btn btn-primary btn-block" id="btn-ir-checkout">Finalizar compra</button>`
        : ''
    }
  `);

  overlay.querySelectorAll('.carrito-sumar').forEach((btn) =>
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = obtenerItems().find((i) => i.productoId === id);
      if (item && item.cantidad < item.stockDisponible) {
        actualizarCantidad(id, item.cantidad + 1);
        cerrar();
        abrirCarrito();
      } else {
        mostrarToast('No hay más stock disponible', 'warning');
      }
    })
  );

  overlay.querySelectorAll('.carrito-restar').forEach((btn) =>
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = obtenerItems().find((i) => i.productoId === id);
      if (item) {
        actualizarCantidad(id, item.cantidad - 1);
        cerrar();
        abrirCarrito();
      }
    })
  );

  overlay.querySelectorAll('.carrito-eliminar').forEach((btn) =>
    btn.addEventListener('click', () => {
      actualizarCantidad(btn.dataset.id, 0);
      cerrar();
      abrirCarrito();
    })
  );

  const btnCheckout = overlay.querySelector('#btn-ir-checkout');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      cerrar();
      abrirCheckout();
    });
  }
}

/* ---------- Modal de Checkout ---------- */
function abrirCheckout() {
  if (!estaAutenticado()) {
    mostrarToast('Inicia sesión para completar tu compra', 'warning');
    return irALogin();
  }

  const items = obtenerItems();
  if (!items.length) {
    mostrarToast('Tu carrito está vacío', 'warning');
    return;
  }

  const total = obtenerTotalPagar();
  const filasHtml = items
    .map(
      (item) => `
      <div style="display:flex;justify-content:space-between;font-size:0.88rem;">
        <span>${item.cantidad} × ${item.nombre}</span>
        <span>${FORMATO_MONEDA.format(item.precio * item.cantidad)}</span>
      </div>`
    )
    .join('');

  const { overlay, cerrar } = abrirModal(`
    <div class="modal__header">
      <h2 class="section-title" style="margin:0;">Confirmar pedido</h2>
      <button class="modal__close" data-modal-close aria-label="Cerrar">x</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.6rem;">${filasHtml}</div>
    <div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid var(--color-border);padding-top:1rem;">
      <span>Total a pagar</span><span>${FORMATO_MONEDA.format(total)}</span>
    </div>
    <div class="alert alert-info">
      <span aria-hidden="true"></span>
      <span>Pago simulado: al confirmar, el stock se descuenta automáticamente en el inventario.</span>
    </div>
    <button class="btn btn-primary btn-block" id="btn-confirmar-pedido">Confirmar pedido</button>
  `);

  overlay.querySelector('#btn-confirmar-pedido').addEventListener('click', async (evento) => {
    const boton = evento.currentTarget;
    boton.disabled = true;
    boton.textContent = 'Procesando...';

    try {
      const itemsCompra = items.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
      }));

      const resultado = await comprarProductos(itemsCompra);
      vaciarCarrito();
      cerrar();
      mostrarToast(
        `¡Pedido confirmado! Total: ${FORMATO_MONEDA.format(resultado.totalCompra)}`,
        'success'
      );
      cargarProductos(); // refresca el catálogo con el stock actualizado al instante
    } catch (error) {
      boton.disabled = false;
      boton.textContent = 'Confirmar pedido';
      mostrarToast(error.message, 'error');
    }
  });
}
