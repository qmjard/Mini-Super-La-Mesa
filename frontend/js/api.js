/* ==========================================================================
   api.js — cliente fetch api hacia el backend minisuper la mesa
   ========================================================================== */

import { obtenerToken } from './auth.js';

const API_BASE_URL = window.MINISUPER_API_URL || 'http://localhost:5000/api';

async function solicitar(endpoint, opciones = {}) {
  const token = obtenerToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opciones.headers || {}),
  };

  const respuesta = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...opciones,
    headers,
  });

  const data = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(data.mensaje || `Error en la solicitud (${respuesta.status})`);
  }

  return data;
}

/* ---------- Productos ---------- */
export function obtenerProductos({ categoria, buscar, pagina = 1, limite = 20 } = {}) {
  const params = new URLSearchParams();
  if (categoria) params.set('categoria', categoria);
  if (buscar) params.set('buscar', buscar);
  params.set('pagina', pagina);
  params.set('limite', limite);

  return solicitar(`/products?${params.toString()}`);
}

export function comprarProductos(items) {
  return solicitar('/products/comprar', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export function obtenerProductoPorId(id) {
  return solicitar(`/products/${id}`);
}

export function crearProducto(producto) {
  return solicitar('/products', {
    method: 'POST',
    body: JSON.stringify(producto),
  });
}

export function actualizarProducto(id, cambios) {
  return solicitar(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cambios),
  });
}

export function eliminarProducto(id) {
  return solicitar(`/products/${id}`, {
    method: 'DELETE',
  });
}

/* ---------- Autenticación ---------- */
export function registrarUsuario({ nombre, email, password }) {
  return solicitar('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nombre, email, password }),
  });
}

export function iniciarSesion({ email, password }) {
  return solicitar('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function obtenerPerfil() {
  return solicitar('/auth/perfil');
}
