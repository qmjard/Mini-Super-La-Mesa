/* ==========================================================================
   navbar.js — componente reutilizable de navegación
   ========================================================================== */

import { obtenerCantidadTotal } from '../js/cart.js';
import { estaAutenticado, obtenerUsuario, cerrarSesion, esAdmin } from '../js/session.js';

const ENLACES = [
  { texto: 'Inicio', href: '#inicio' },
  { texto: 'Productos', href: '#productos' },
  { texto: 'Ubicación', href: '#ubicacion' },
  { texto: 'Contacto', href: '#contacto' },
];

/**
 * Renderiza el navbar dentro del contenedor indicado.
 * @param {string} selector - Selector del contenedor destino.
 * @param {{ onCartClick?: Function, onLoginClick?: Function }} opciones
 */
export function initNavbar(selector = '#navbar', opciones = {}) {
  const contenedor = document.querySelector(selector);
  if (!contenedor) return;

  contenedor.innerHTML = renderMarkup();
  contenedor.classList.add('navbar');

  const toggleBtn = contenedor.querySelector('.navbar__toggle');
  const menu = contenedor.querySelector('.navbar__menu');
  const overlay = contenedor.querySelector('.navbar__overlay');
  const cartBtn = contenedor.querySelector('.navbar__cart');
  const cartBadge = contenedor.querySelector('.navbar__cart-badge');
  const authBtns = contenedor.querySelectorAll('.navbar__auth-btn');
  const links = contenedor.querySelectorAll('.navbar__link');

  const cerrarMenu = () => {
    toggleBtn.classList.remove('is-active');
    menu.classList.remove('is-open');
    overlay.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  };

  const abrirMenu = () => {
    toggleBtn.classList.add('is-active');
    menu.classList.add('is-open');
    overlay.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  };

  toggleBtn.addEventListener('click', () => {
    const abierto = menu.classList.contains('is-open');
    abierto ? cerrarMenu() : abrirMenu();
  });

  overlay.addEventListener('click', cerrarMenu);
  links.forEach((link) => link.addEventListener('click', cerrarMenu));

  cartBtn.addEventListener('click', () => {
    if (typeof opciones.onCartClick === 'function') opciones.onCartClick();
  });

  const actualizarBadge = () => {
    const total = obtenerCantidadTotal();
    cartBadge.textContent = total > 99 ? '99+' : String(total);
    cartBadge.hidden = total === 0;
  };

  const linkAdmin = contenedor.querySelector('.navbar__link--admin');

  const actualizarSesion = () => {
    authBtns.forEach((authBtn) => {
      const isIconOnly = authBtn.classList.contains('btn-icon');
      if (estaAutenticado()) {
        const usuario = obtenerUsuario();
        authBtn.innerHTML = isIconOnly
          ? `<img src="assets/icon-user.svg" alt="" aria-hidden="true" />`
          : `<img src="assets/icon-user.svg" alt="" aria-hidden="true" class="navbar__icon" /> ${usuario?.nombre?.split(' ')[0] || 'Mi cuenta'}`;
        authBtn.dataset.modo = 'logout';
      } else {
        authBtn.innerHTML = isIconOnly
          ? `<img src="assets/icon-user.svg" alt="" aria-hidden="true" />`
          : `<img src="assets/icon-user.svg" alt="" aria-hidden="true" class="navbar__icon" /> Iniciar sesión`;
        authBtn.dataset.modo = 'login';
      }
    });
    if (linkAdmin) linkAdmin.hidden = !esAdmin();
  };

  authBtns.forEach((authBtn) => {
    authBtn.addEventListener('click', () => {
      if (authBtn.dataset.modo === 'logout') {
        cerrarSesion();
      } else if (typeof opciones.onLoginClick === 'function') {
        opciones.onLoginClick();
      }
      cerrarMenu();
    });
  });

  window.addEventListener('cart:updated', actualizarBadge);
  window.addEventListener('auth:cambio', actualizarSesion);

  actualizarBadge();
  actualizarSesion();
}

function renderMarkup() {
  const enlacesHtml = ENLACES.map(
    (enlace) => `<li><a href="${enlace.href}" class="navbar__link">${enlace.texto}</a></li>`
  ).join('');

  return `
    <div class="container navbar__inner">
      <a href="index.html#inicio" class="navbar__brand" aria-label="Minisuper La Mesa - Inicio">
        <img
          src="assets/logosuper.png"
          alt="Logo Minisuper La Mesa"
          class="navbar__logo"
          onerror="this.onerror=null;this.src='https://via.placeholder.com/80x80.png?text=LM';"
        />
        <span class="navbar__brand-text">
          <span class="navbar__name">Minisuper La Mesa</span>
          <span class="navbar__slogan">Calidad y frescura al alcance de tu mesa</span>
        </span>
      </a>

      <nav class="navbar__menu" aria-label="Navegación principal">
        <ul class="navbar__links">
          ${enlacesHtml}
          <li><a href="admin.html" class="navbar__link navbar__link--admin" hidden> Panel Admin</a></li>
        </ul>
        <div class="navbar__actions navbar__actions--mobile">
          <button type="button" class="btn btn-outline btn-block navbar__auth-btn"></button>
        </div>
      </nav>

      <div class="navbar__actions">
        <button type="button" class="btn-icon navbar__auth-btn" aria-label="Cuenta"></button>
        <button type="button" class="btn-icon navbar__cart" aria-label="Ver carrito de compras">
          <img src="assets/icon-cart.svg" alt="" aria-hidden="true" />
          <span class="navbar__cart-badge" hidden>0</span>
        </button>
        <button
          type="button"
          class="navbar__toggle"
          aria-label="Abrir menú de navegación"
          aria-expanded="false"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <div class="navbar__overlay"></div>
  `;
}
