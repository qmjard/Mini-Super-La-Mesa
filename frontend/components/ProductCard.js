

import { agregarAlCarrito, obtenerItems } from '../js/cart.js';

const FORMATO_MONEDA = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

/**
 * Crea el nodo DOM de una tarjeta de producto.
 * @param {{_id:string, nombre:string, categoria:string, precio:number, stock:number, imagenUrl:string}} producto
 * @param {{ onAdded?: Function }} opciones
 * @returns {HTMLElement}
 */
export function createProductCard(producto, opciones = {}) {
  const article = document.createElement('article');
  article.className = 'product-card';
  article.dataset.productoId = producto._id;

  const stockActual = calcularStockDisponible(producto);
  const sinStock = stockActual <= 0;

  article.innerHTML = `
    ${badgeStock(producto, stockActual)}
    <div class="product-card__image-wrap">
      <img
        class="product-card__image"
        src="${producto.imagenUrl || 'https://via.placeholder.com/300x300.png?text=Minisuper+La+Mesa'}"
        alt="${producto.nombre}"
        loading="lazy"
      />
    </div>
    <div class="product-card__body">
      <span class="product-card__category">${producto.categoria}</span>
      <h3 class="product-card__name">${producto.nombre}</h3>
      <div class="product-card__footer">
        <span class="product-card__price">${FORMATO_MONEDA.format(producto.precio)}</span>
        <span class="product-card__stock ${claseStock(stockActual)}">
          ${textoStock(stockActual)}
        </span>
      </div>
      <button
        type="button"
        class="btn btn-secondary product-card__add"
        ${sinStock ? 'disabled aria-disabled="true"' : ''}
      >
        ${sinStock ? 'Sin stock' : 'Agregar al carrito'}
      </button>
    </div>
  `;

  const botonAgregar = article.querySelector('.product-card__add');

  if (!sinStock) {
    botonAgregar.addEventListener('click', () => {
      agregarAlCarrito(producto, 1);
      animarConfirmacion(botonAgregar);
      if (typeof opciones.onAdded === 'function') opciones.onAdded(producto);
    });
  }

  // mantiene el stock visible sincronizado si otro componente actualiza el carrito
  window.addEventListener('cart:updated', () => actualizarVistaStock(article, producto));

  return article;
}

function calcularStockDisponible(producto) {
  const enCarrito = obtenerItems().find((item) => item.productoId === producto._id);
  const cantidadReservada = enCarrito ? enCarrito.cantidad : 0;
  return Math.max(producto.stock - cantidadReservada, 0);
}

function claseStock(stock) {
  if (stock <= 0) return 'product-card__stock--out';
  if (stock <= 5) return 'product-card__stock--low';
  return '';
}

function textoStock(stock) {
  if (stock <= 0) return 'Agotado';
  if (stock <= 5) return `¡Últimas ${stock} unidades!`;
  return `Stock: ${stock}`;
}

function badgeStock(producto, stockActual) {
  if (stockActual <= 0) {
    return '<span class="product-card__badge product-card__badge--out">Agotado</span>';
  }
  if (stockActual <= 5) {
    return '<span class="product-card__badge">Pocas unidades</span>';
  }
  return '';
}

function actualizarVistaStock(article, producto) {
  const stockActual = calcularStockDisponible(producto);
  const sinStock = stockActual <= 0;

  const stockEl = article.querySelector('.product-card__stock');
  const boton = article.querySelector('.product-card__add');

  stockEl.className = `product-card__stock ${claseStock(stockActual)}`;
  stockEl.textContent = textoStock(stockActual);

  boton.disabled = sinStock;
  boton.textContent = sinStock ? 'Sin stock' : 'Agregar al carrito';
}

function animarConfirmacion(boton) {
  const textoOriginal = boton.textContent;
  boton.textContent = 'Agregado';
  boton.classList.add('btn-primary');
  boton.classList.remove('btn-secondary');
  setTimeout(() => {
    boton.textContent = textoOriginal;
    boton.classList.remove('btn-primary');
    boton.classList.add('btn-secondary');
  }, 1000);
}
