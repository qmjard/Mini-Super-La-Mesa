

/**
 * Renderiza 
 * @param {string} selector 
 */
export function initFooter(selector = '#footer') {
  const contenedor = document.querySelector(selector);
  if (!contenedor) return;

  const anioActual = new Date().getFullYear();

  contenedor.classList.add('footer');
  contenedor.innerHTML = `
    <div class="container">
      <div class="footer__grid">
        <div>
          <div class="footer__brand">
            <img
              src="assets/logosuper.png"
              alt="Logo Minisuper La Mesa"
              class="footer__logo"
              onerror="this.onerror=null;this.src='https://via.placeholder.com/80x80.png?text=LM';"
            />
            <span class="footer__title">Minisuper La Mesa</span>
          </div>
          <p class="footer__slogan">"Calidad y frescura al alcance de tu mesa"</p>
          <p class="footer__text">
            Productos frescos y de primera calidad, seleccionados cada día para
            tu hogar.
          </p>
          <div class="footer__social">
<div class="social-links">
  <!-- Facebook -->
  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
    <i class="fab fa-facebook-f" aria-hidden="true"></i>
  </a>

  <!-- Instagram -->
  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
    <i class="fab fa-instagram" aria-hidden="true"></i>
  </a>

  <!-- WhatsApp -->
  <a href="https://wa.me/50687254749" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
    <i class="fab fa-whatsapp" aria-hidden="true"></i>
  </a>
</div>
            </a>
          </div>
        </div>

        <div>
          <h3 class="footer__heading">Contacto</h3>
          <span class="footer__text">Cangrejal, Acosta, San José</span>
          <span class="footer__text">+506 8725-4749</span>
          <span class="footer__text">contacto@minisuperlamesa.com</span>
          <span class="footer__text">lun - dom: 6:00 a.m. - 9:00 p.m.</span>
        </div>

        <div>
          <h3 class="footer__heading">Enlaces</h3>
          <a href="#inicio" class="footer__link">Inicio</a>
          <a href="#productos" class="footer__link">Productos</a>
          <a href="#ubicacion" class="footer__link">Ubicación</a>
          <a href="#contacto" class="footer__link">Contacto</a>
        </div>
      </div>

      <div class="footer__bottom">
        <span>© ${anioActual} Minisuper La Mesa. Todos los derechos reservados.</span>
        <span>Sitio desarrollado para la comunidad local.</span>
      </div>
    </div>
  `;
}
