const modal = document.getElementById('cert-modal');
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