// ===== Modal de certificaciones =====
const modal = document.getElementById('cert-modal');

if (modal) {
  const modalImg = modal.querySelector('.cert-modal-img');
  const modalVerify = modal.querySelector('.cert-modal-verify');

  document.querySelectorAll('.cert-open').forEach((boton) => {
    boton.addEventListener('click', () => {
      const tarjeta = boton.closest('.cert-card');
      const img = tarjeta.querySelector('.cert-img');

      modalImg.src = img.getAttribute('src');
      modalImg.alt = img.alt;
      modalVerify.href = tarjeta.dataset.verify;

      modal.showModal();
    });
  });

  // Cerrar al clic afuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}
// ===== Estrellas =====
const random = (min, max) => Math.random() * (max - min) + min;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Ajustes
const STAR_SRC    = 'assets/stickers/EstrellasSinFondo.svg';
const STAR_COUNT  = 6;     // al cargar
const MAX_STARS   = 25;    // máximo en pantalla
const SPAWN_EVERY = 900;   // ms entre estrellas
const LIFE_MIN    = 4000;  // ms de vida mínima
const LIFE_MAX    = 9000;  // ms de vida máxima
const LEAVE_MS    = 700;   // ms de salida

const starsLayer = document.querySelector('.stars-layer');
const skills = document.querySelector('.skills');

// Desvanece y elimina
function removeStar(star) {
  star.classList.add('is-leaving');
  setTimeout(() => star.remove(), LEAVE_MS);
}

// Aparece al entrar en pantalla
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const star = entry.target;
    star.classList.add('is-visible');
    observer.unobserve(star);

    if (!reduceMotion) {
      setTimeout(() => removeStar(star), random(LIFE_MIN, LIFE_MAX));
    }
  });
}, { threshold: 0.3 });

// Crea una estrella
function createStar({ x, y, size, delay = random(0, 1.5) }) {
  // Respeta el máximo
  const alive = starsLayer.querySelectorAll('.star:not(.is-leaving)');
  if (alive.length >= MAX_STARS) removeStar(alive[0]);

  const star = document.createElement('img');
  star.src = STAR_SRC;
  star.alt = '';
  star.className = 'star star--random';

  star.style.setProperty('--x', x);
  star.style.setProperty('--y', y);
  star.style.setProperty('--size', `${size}px`);
  star.style.setProperty('--dur', `${random(3, 7)}s`);
  star.style.setProperty('--delay', `${delay}s`);

  starsLayer.appendChild(star);
  observer.observe(star);
  return star;
}

// Posición y tamaño al azar
const randomStar = () => ({
  x: `${random(0, 95)}%`,
  y: `${random(10, 92)}%`,
  size: random(20, 70),
});

if (starsLayer && skills) {
  // Iniciales
  for (let i = 0; i < STAR_COUNT; i++) createStar(randomStar());

  // Nuevas mientras se ve la sección
  if (!reduceMotion) {
    let spawnTimer = null;

    const sectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !spawnTimer) {
        spawnTimer = setInterval(() => createStar(randomStar()), SPAWN_EVERY);
      } else if (!entry.isIntersecting && spawnTimer) {
        clearInterval(spawnTimer);
        spawnTimer = null;
      }
    });

    sectionObserver.observe(skills);
  }

  // Estrella al hacer clic
  skills.addEventListener('click', (e) => {
    // Ignora links, botones y tickets
    if (e.target.closest('a, button, .ticket-wrapper')) return;

    const rect = starsLayer.getBoundingClientRect();
    const size = random(30, 60);

    createStar({
      x: `${e.clientX - rect.left - size / 2}px`,
      y: `${e.clientY - rect.top - size / 2}px`,
      size,
      delay: 0, // sin retraso
    });
  });
}

// ===== Nubes =====
const clouds = document.querySelectorAll('.cloud');

function setupClouds() {
  const vw = document.documentElement.clientWidth;

  clouds.forEach((cloud) => {
    const width = cloud.offsetWidth;
    if (!width) return; // oculta en móvil

    // Posición sin animación
    const baseLeft = cloud.offsetParent.getBoundingClientRect().left + cloud.offsetLeft;

    // De borde a borde
    const from = -(baseLeft + width);
    const to = vw - baseLeft;

    // Más grande, más rápida
    if (!cloud.dataset.speed) cloud.dataset.speed = width * random(0.08, 0.16); // px/s
    const dur = (to - from) / cloud.dataset.speed;

    cloud.style.setProperty('--from', `${from}px`);
    cloud.style.setProperty('--to', `${to}px`);
    cloud.style.setProperty('--dur', `${dur}s`);

    // Empieza a medio camino
    if (!cloud.dataset.started) {
      cloud.style.setProperty('--delay', `${-random(0, dur)}s`);
      cloud.dataset.started = 'true';

      // Nueva altura en cada vuelta
      cloud.addEventListener('animationiteration', () => {
        cloud.style.setProperty('--dy', `${random(-3, 3)}vw`);
      });
    }
  });
}

if (clouds.length) {
  setupClouds();

  // Recalcular al redimensionar
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setupClouds, 200);
  });
}

// ===== Certificaciones: destacada =====
const certsGrid = document.getElementById('certs');
const certsStatus = document.getElementById('certs-status');

if (certsGrid) {
  // Nombre único para la animación
  certsGrid.querySelectorAll('.cert-card').forEach((card) => {
    card.style.viewTransitionName = `cert-${card.dataset.cert}`;
  });

  certsGrid.addEventListener('click', (e) => {
    const boton = e.target.closest('.cert-select');
    if (!boton) return;

    const nueva = boton.closest('.cert-card');
    const actual = certsGrid.querySelector('.card-top');
    if (!actual || nueva === actual) return;

    const intercambiar = () => {
      // Intercambia clases
      const lugar = [...nueva.classList].find((c) => c.startsWith('card-'));
      nueva.classList.replace(lugar, 'card-top');
      actual.classList.replace('card-top', lugar);

      // Intercambia posición
      const siguiente = nueva.nextElementSibling;
      certsGrid.insertBefore(nueva, actual);
      certsGrid.insertBefore(actual, siguiente);

      // Aviso y foco
      if (certsStatus) {
        certsStatus.textContent = `${nueva.querySelector('h3').textContent} ahora es la certificación destacada`;
      }
      nueva.querySelector('.cert-open').focus({ preventScroll: true });
    };

    // Animar si se puede
    if (document.startViewTransition && !reduceMotion) {
      document.startViewTransition(intercambiar);
    } else {
      intercambiar();
    }
  });
}
