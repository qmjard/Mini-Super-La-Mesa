/* ==========================================================================
   config.js — configuración global del frontend
   se carga como script clásico antes que cualquier módulo es6
   para exponer window.MINISUPER_API_URL a js/api.js en todas las páginas.
   ========================================================================== */

(function () {
  // detecta automáticamente si se está corriendo en localhost (desarrollo)
  // o en producción (vercel), y apunta al backend correspondiente en render.
  const esLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  window.MINISUPER_API_URL = esLocal
    ? 'http://localhost:5000/api'
    : 'https://mini-super-la-mesa.onrender.com/api'; // URL del backend en render.com arregladooooooooooo
})();  
