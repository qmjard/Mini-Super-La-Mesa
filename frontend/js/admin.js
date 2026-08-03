/* ==========================================================================
   admin.js — panel de gestión de inventario
   ========================================================================== */

import { initNavbar } from '../components/Navbar.js';
import { initFooter } from '../components/Footer.js';
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from './api.js';
import { estaAutenticado, esAdmin } from './session.js';
import { mostrarToast, abrirModal } from './ui.js';

const CATEGORIAS = [
  'Frutas y Verduras',
  'Lácteos',
  'Carnes',
  'Panadería',
  'Abarrotes',
  'Bebidas',
  'Limpieza',
  'Otros',
];

const FORMATO_MONEDA = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

let cacheProductos = [];

document.addEventListener('DOMContentLoaded', () => {
  initNavbar('#navbar', { onLoginClick: () => (window.location.href = 'login.html') });
  initFooter('#footer');

  // protección de ruta: requiere sesión activa + rol admin
  if (!estaAutenticado()) {
    mostrarToast('Debes iniciar sesión para acceder al panel', 'warning');
    window.location.href = 'login.html';
    return;
  }

  if (!esAdmin()) {
    mostrarAccesoDenegado();
    return;
  }

  document.querySelector('#admin-content').hidden = false;
  poblarSelectCategorias();
  configurarFormularioNuevoProducto();
  cargarInventario();
});

function mostrarAccesoDenegado() {
  const contenedor = document.querySelector('#admin-root');
  contenedor.innerHTML = `
    <div class="container admin-access-denied">
      <div class="empty-state__icon"></div>
      <h2 class="section-title">Acceso restringido</h2>
      <p class="section-subtitle">Esta sección es exclusiva para administradores.</p>
      <a href="index.html" class="btn btn-primary">Volver al catálogo</a>
    </div>
  `;
}

function poblarSelectCategorias() {
  const select = document.querySelector('#nuevo-categoria');
  if (!select) return;
  select.innerHTML = CATEGORIAS.map((cat) => `<option value="${cat}">${cat}</option>`).join('');
}

/* ---------- Cargar inventario ---------- */
async function cargarInventario() {
  const cuerpoTabla = document.querySelector('#tabla-inventario-body');
  cuerpoTabla.innerHTML = `<tr><td colspan="6"><div class="loading-state"><div class="loading-state__spinner"></div>Cargando inventario...</div></td></tr>`;

  try {
    const { productos, total } = await obtenerProductos({ limite: 100 });
    cacheProductos = productos;
    renderizarTabla(productos);
    actualizarEstadisticas(productos, total);
  } catch (error) {
    cuerpoTabla.innerHTML = `<tr><td colspan="6"><div class="empty-state">${error.message}</div></td></tr>`;
  }
}

function actualizarEstadisticas(productos, total) {
  const stockTotal = productos.reduce((acc, p) => acc + p.stock, 0);
  const valorInventario = productos.reduce((acc, p) => acc + p.stock * p.precio, 0);
  const sinStock = productos.filter((p) => p.stock === 0).length;

  document.querySelector('#stat-total-productos').textContent = total;
  document.querySelector('#stat-stock-total').textContent = stockTotal;
  document.querySelector('#stat-valor-inventario').textContent = FORMATO_MONEDA.format(valorInventario);
  document.querySelector('#stat-sin-stock').textContent = sinStock;
}

function renderizarTabla(productos) {
  const cuerpoTabla = document.querySelector('#tabla-inventario-body');

  if (!productos.length) {
    cuerpoTabla.innerHTML = `<tr><td colspan="6"><div class="empty-state">No hay productos registrados aún.</div></td></tr>`;
    return;
  }

  cuerpoTabla.innerHTML = productos
    .map(
      (producto) => `
    <tr data-fila-id="${producto._id}">
      <td>
        <div style="display:flex;align-items:center;gap:0.6rem;">
          <img class="admin-table__img" src="${producto.imagenUrl}" alt="${producto.nombre}" />
          <div>
            <strong>${producto.nombre}</strong><br />
            <span class="admin-badge">${producto.categoria}</span>
          </div>
        </div>
      </td>
      <td>
        <input type="number" class="admin-table__input" data-campo="precio" value="${producto.precio}" min="0" step="1" />
      </td>
      <td>
        <input type="number" class="admin-table__input" data-campo="stock" value="${producto.stock}" min="0" step="1" />
      </td>
      <td>${badgeEstado(producto.stock)}</td>
      <td>${FORMATO_MONEDA.format(producto.precio * producto.stock)}</td>
      <td>
        <div class="admin-table__actions">
          <button class="btn btn-primary btn-guardar-fila" data-id="${producto._id}" style="padding:0.45rem 0.9rem;font-size:0.8rem;">Guardar</button>
          <button class="btn-icon btn-eliminar-fila" data-id="${producto._id}" aria-label="Eliminar producto"></button>
        </div>
      </td>
    </tr>`
    )
    .join('');

  cuerpoTabla.querySelectorAll('.btn-guardar-fila').forEach((btn) =>
    btn.addEventListener('click', () => guardarCambiosFila(btn.dataset.id))
  );

  cuerpoTabla.querySelectorAll('.btn-eliminar-fila').forEach((btn) =>
    btn.addEventListener('click', () => confirmarEliminacion(btn.dataset.id))
  );
}

function badgeEstado(stock) {
  if (stock === 0) return '<span class="admin-badge admin-badge--error">Agotado</span>';
  if (stock <= 5) return '<span class="admin-badge admin-badge--warning">Stock bajo</span>';
  return '<span class="admin-badge">Disponible</span>';
}

/* ---------- Guardar cambios de precio/stock por fila ---------- */
async function guardarCambiosFila(id) {
  const fila = document.querySelector(`tr[data-fila-id="${id}"]`);
  const precio = Number(fila.querySelector('[data-campo="precio"]').value);
  const stock = Number(fila.querySelector('[data-campo="stock"]').value);

  if (precio < 0 || stock < 0 || Number.isNaN(precio) || Number.isNaN(stock)) {
    mostrarToast('Precio y stock deben ser valores válidos', 'error');
    return;
  }

  try {
    await actualizarProducto(id, { precio, stock });
    mostrarToast('Producto actualizado correctamente', 'success');
    cargarInventario();
  } catch (error) {
    mostrarToast(error.message, 'error');
  }
}

/* ---------- Eliminar producto ---------- */
function confirmarEliminacion(id) {
  const producto = cacheProductos.find((p) => p._id === id);
  const { overlay, cerrar } = abrirModal(`
    <div class="modal__header">
      <h2 class="section-title" style="margin:0;">Eliminar producto</h2>
      <button class="modal__close" data-modal-close aria-label="Cerrar">x</button>
    </div>
    <p>¿Seguro que deseas eliminar <strong>${producto?.nombre || 'este producto'}</strong> del inventario?</p>
    <div style="display:flex;gap:0.6rem;">
      <button class="btn btn-outline btn-block" data-modal-close>Cancelar</button>
      <button class="btn btn-secondary btn-block" id="btn-confirmar-eliminar">Eliminar</button>
    </div>
  `);

  overlay.querySelector('#btn-confirmar-eliminar').addEventListener('click', async () => {
    try {
      await eliminarProducto(id);
      mostrarToast('Producto eliminado', 'success');
      cerrar();
      cargarInventario();
    } catch (error) {
      mostrarToast(error.message, 'error');
    }
  });
}

/* ---------- Formulario: agregar nuevo producto ---------- */
function configurarFormularioNuevoProducto() {
  const form = document.querySelector('#form-nuevo-producto');
  if (!form) return;

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const datos = Object.fromEntries(new FormData(form));

    const producto = {
      nombre: datos.nombre.trim(),
      categoria: datos.categoria,
      precio: Number(datos.precio),
      stock: Number(datos.stock),
      imagenUrl: datos.imagenUrl.trim() || undefined,
      descripcion: datos.descripcion.trim(),
    };

    if (!producto.nombre || producto.precio < 0 || producto.stock < 0) {
      mostrarToast('Revisa los datos del producto', 'error');
      return;
    }

    const boton = form.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.classList.add('btn-loading');

    try {
      await crearProducto(producto);
      mostrarToast(`"${producto.nombre}" agregado al inventario`, 'success');
      form.reset();
      cargarInventario();
    } catch (error) {
      mostrarToast(error.message, 'error');
    } finally {
      boton.disabled = false;
      boton.classList.remove('btn-loading');
    }
  });
}
