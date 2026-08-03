const DIRECCION = 'Cangrejal, Acosta, San José';
const MAPS_LINK = 'https://maps.app.goo.gl/eSgyD1Tdjr2q43tMA';


const MAPS_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(DIRECCION)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

 /**
 * Renderiza la sección de ubicación dentro del contenedor indicado.
 * @param {string} selector 
 */
export function initLocationSection(selector = '#ubicacion') {
  const contenedor = document.querySelector(selector);
  if (!contenedor) return;

  contenedor.classList.add('location-section');
  contenedor.innerHTML = `
    <div class="container">
      <h2 class="section-title">Visítanos</h2>
      <p class="section-subtitle">Te esperamos con los mejores productos frescos del sector.</p>

      <div class="location-grid">
        <div class="location-card">
          <div class="location-card__item">
            <span class="location-card__icon" aria-hidden="true"></span>
            <div>
              <span class="location-card__label">Dirección</span>
              <p class="location-card__value">${DIRECCION}</p>
            </div>
          </div>

          <div class="location-card__item">
            <span class="location-card__icon" aria-hidden="true"></span>
            <div>
              <span class="location-card__label">Horario de atención</span>
              <p class="location-card__value">Lunes a domingo: 6:00 a.m. — 9:00 p.m.</p>
            </div>
          </div>

          <div class="location-card__item">
            <span class="location-card__icon" aria-hidden="true"></span>
            <div>
              <span class="location-card__label">Teléfono</span>
              <p class="location-card__value">+506 0000-0000</p>
            </div>
          </div>

          <a
            class="btn btn-primary btn-block"
            href="${MAPS_LINK}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cómo llegar
          </a>
        </div>

        <div class="location-map-wrap">
          <iframe
            src="${MAPS_EMBED_SRC}"
            title="Ubicación de Minisuper La Mesa en el mapa"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  `;
}