

(function () {
  // detecta automáticamente si se está corriendo en localhostr
  const esLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  window.MINISUPER_API_URL = esLocal
    ? 'http://localhost:5000/api'
    : 'https://mini-super-la-mesa.onrender.com/api'; 
})();  
