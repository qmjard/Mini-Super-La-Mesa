/* ==========================================================================
   ui.js — utilidades de modales y notificaciones
   ========================================================================== */

let overlayActivo = null;

/**
 * Abre un modal genérico con el contenido HTML indicado.
 * @param {string} htmlContenido
 * @returns {{ overlay: HTMLElement, cerrar: Function }}
 */
export function abrirModal(htmlContenido) {
  cerrarModalActivo();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${htmlContenido}</div>`;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add('is-open'));

  const cerrar = () => {
    overlay.classList.remove('is-open');
    setTimeout(() => overlay.remove(), 220);
    if (overlayActivo === overlay) overlayActivo = null;
  };

  overlay.addEventListener('click', (evento) => {
    if (evento.target === overlay) cerrar();
  });

  const btnCerrar = overlay.querySelector('[data-modal-close]');
  if (btnCerrar) btnCerrar.addEventListener('click', cerrar);

  document.addEventListener(
    'keydown',
    function escListener(evento) {
      if (evento.key === 'Escape') {
        cerrar();
        document.removeEventListener('keydown', escListener);
      }
    }
  );

  overlayActivo = overlay;
  return { overlay, cerrar };
}

function cerrarModalActivo() {
  if (overlayActivo) {
    overlayActivo.remove();
    overlayActivo = null;
  }
}

/**
 * Muestra una notificación temporal tipo toast.
 * @param {string} mensaje
 * @param {'success'|'error'|'warning'|'info'} tipo
 */
export function mostrarToast(mensaje, tipo = 'info') {
  let contenedor = document.querySelector('.toast-container');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.className = 'toast-container';
    document.body.appendChild(contenedor);
  }

  const iconos = { success: '', error: '', warning: '', info: '' };

  const alerta = document.createElement('div');
  alerta.className = `alert alert-${tipo}`;
  alerta.setAttribute('role', 'status');
  alerta.innerHTML = `<span aria-hidden="true"></span><span>${mensaje}</span>`;

  contenedor.appendChild(alerta);

  setTimeout(() => {
    alerta.style.opacity = '0';
    alerta.style.transition = 'opacity 0.25s ease';
    setTimeout(() => alerta.remove(), 250);
  }, 3200);
}
