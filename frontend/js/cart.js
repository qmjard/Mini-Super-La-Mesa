
const CART_KEY = 'minisuper_carrito';

function leerCarrito() {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function guardarCarrito(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
}

export function obtenerItems() {
  return leerCarrito();
}

export function obtenerCantidadTotal() {
  return leerCarrito().reduce((total, item) => total + item.cantidad, 0);
}

export function obtenerTotalPagar() {
  return leerCarrito().reduce((total, item) => total + item.precio * item.cantidad, 0);
}

export function agregarAlCarrito(producto, cantidad = 1) {
  const items = leerCarrito();
  const existente = items.find((item) => item.productoId === producto._id);

  if (existente) {
    existente.cantidad = Math.min(existente.cantidad + cantidad, producto.stock);
  } else {
    items.push({
      productoId: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagenUrl: producto.imagenUrl,
      stockDisponible: producto.stock,
      cantidad: Math.min(cantidad, producto.stock),
    });
  }

  guardarCarrito(items);
  return items;
}

export function actualizarCantidad(productoId, cantidad) {
  let items = leerCarrito();
  if (cantidad <= 0) {
    items = items.filter((item) => item.productoId !== productoId);
  } else {
    items = items.map((item) =>
      item.productoId === productoId ? { ...item, cantidad } : item
    );
  }
  guardarCarrito(items);
  return items;
}

export function eliminarDelCarrito(productoId) {
  const items = leerCarrito().filter((item) => item.productoId !== productoId);
  guardarCarrito(items);
  return items;
}

export function vaciarCarrito() {
  guardarCarrito([]);
}
