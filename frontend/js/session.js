
const TOKEN_KEY = 'minisuper_token';
const USER_KEY = 'minisuper_usuario';

export function guardarSesion(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  window.dispatchEvent(new CustomEvent('auth:cambio', { detail: { usuario } }));
}

export function obtenerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function obtenerUsuario() {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function estaAutenticado() {
  return Boolean(obtenerToken());
}

export function esAdmin() {
  const usuario = obtenerUsuario();
  return Boolean(usuario && usuario.rol === 'admin');
}

export function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new CustomEvent('auth:cambio', { detail: { usuario: null } }));
}
