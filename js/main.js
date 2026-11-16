// ===== Modal de certificaciones =====
const modal = document.getElementById('cert-modal');

if (modal) {
  const modalImg = modal.querySelector('.cert-modal-img');
  const modalVerify = modal.querySelector('.cert-modal-verify');

  document.querySelectorAll('.cert-open').forEach((boton) => {
    boton.addEventListener('click', () => {
      const tarjeta = boton.closest('.cert-card');         // sube hasta la tarjeta
      const img = tarjeta.querySelector('.cert-img');

      modalImg.src = img.getAttribute('src');              // copia la imagen de esa tarjeta
      modalImg.alt = img.alt;
      modalVerify.href = tarjeta.dataset.verify;           // lee data-verify del HTML

      modal.showModal();                                   // abre con capa oscura y foco
    });
  });

  // Cerrar al hacer clic en la capa oscura (fuera de la ventana)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}
// ===== Estrellas =====
const random = (min, max) => Math.random() * (max - min) + min;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Perillas para ajustar el efecto
const STAR_SRC    = 'assets/stickers/EstrellasSinFondo.svg';
const STAR_COUNT  = 6;     // estrellas al cargar
const MAX_STARS   = 25;    // tope para no llenar la sección
const SPAWN_EVERY = 900;   // ms entre una estrella nueva y otra
const LIFE_MIN    = 4000;  // ms mínimos que una estrella se queda visible
const LIFE_MAX    = 9000;  // ms máximos
const LEAVE_MS    = 700;   // duración de la salida (la transition del CSS es 0.6s)

const starsLayer = document.querySelector('.stars-layer');
const skills = document.querySelector('.skills');

// Desvanece una estrella y la quita del HTML cuando termina
function removeStar(star) {
  star.classList.add('is-leaving');
  setTimeout(() => star.remove(), LEAVE_MS);
}

// Cuando una estrella entra en pantalla: aparece y programa su salida
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

// Crea una estrella en la posición y tamaño que le digas
function createStar({ x, y, size, delay = random(0, 1.5) }) {
  // Si ya hay demasiadas, despide a la más vieja
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
  // 1. Unas cuantas al cargar
  for (let i = 0; i < STAR_COUNT; i++) createStar(randomStar());

  // 2. Van naciendo más, solo mientras la sección está en pantalla
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

  // 3. Una estrella donde hagas clic
  skills.addEventListener('click', (e) => {
    // No crear estrellas si el clic fue en un link, botón o ticket
    if (e.target.closest('a, button, .ticket-wrapper')) return;

    const rect = starsLayer.getBoundingClientRect();
    const size = random(30, 60);

    createStar({
      x: `${e.clientX - rect.left - size / 2}px`,
      y: `${e.clientY - rect.top - size / 2}px`,
      size,
      delay: 0, // que aparezca al instante
    });
  });
}

// ===== Nubes: cruzan de izquierda a derecha =====
const clouds = document.querySelectorAll('.cloud');

function setupClouds() {
  const vw = document.documentElement.clientWidth;

  clouds.forEach((cloud) => {
    const width = cloud.offsetWidth;
    if (!width) return; // nube oculta (en móvil)

    // Dónde está la nube "en reposo", sin contar la animación
    const baseLeft = cloud.offsetParent.getBoundingClientRect().left + cloud.offsetLeft;

    // Empieza justo fuera del borde izquierdo y termina justo fuera del derecho
    const from = -(baseLeft + width);
    const to = vw - baseLeft;

    // Velocidad al azar, proporcional al tamaño: las grandes (más "cerca") van más rápido
    if (!cloud.dataset.speed) cloud.dataset.speed = width * random(0.08, 0.16); // px por segundo
    const dur = (to - from) / cloud.dataset.speed;

    cloud.style.setProperty('--from', `${from}px`);
    cloud.style.setProperty('--to', `${to}px`);
    cloud.style.setProperty('--dur', `${dur}s`);

    // Delay negativo: al cargar, cada nube ya va a la mitad de su camino
    if (!cloud.dataset.started) {
      cloud.style.setProperty('--delay', `${-random(0, dur)}s`);
      cloud.dataset.started = 'true';

      // Cada vez que vuelve a empezar (ya fuera de pantalla), cambia un poco de altura
      cloud.addEventListener('animationiteration', () => {
        cloud.style.setProperty('--dy', `${random(-3, 3)}vw`);
      });
    }
  });
}

if (clouds.length) {
  setupClouds();

  // Recalcular si cambia el ancho de la ventana (con un respiro para no hacerlo 100 veces)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setupClouds, 200);
  });
}
