// ===== Comparador antes / después =====
document.querySelectorAll('.cs-compare__frame').forEach((frame) => {
  const range = frame.querySelector('.cs-compare__range');
  if (!range) return;

  const setPos = (value) => {
    const pos = Math.min(100, Math.max(0, value));
    range.value = pos;
    frame.style.setProperty('--pos', `${pos}%`);
  };

  // Mouse y touch: la línea sigue al puntero sobre toda la imagen
  const fromPointer = (e) => {
    const rect = frame.getBoundingClientRect();
    setPos(((e.clientX - rect.left) / rect.width) * 100);
  };

  frame.addEventListener('pointerdown', (e) => {
    frame.setPointerCapture(e.pointerId);
    frame.classList.add('is-dragging');
    fromPointer(e);
  });

  frame.addEventListener('pointermove', (e) => {
    if (frame.hasPointerCapture(e.pointerId)) fromPointer(e);
  });

  const stop = (e) => {
    if (frame.hasPointerCapture(e.pointerId)) frame.releasePointerCapture(e.pointerId);
    frame.classList.remove('is-dragging');
  };
  frame.addEventListener('pointerup', stop);
  frame.addEventListener('pointercancel', stop);

  // Teclado: flechas sobre el control
  range.addEventListener('input', () => setPos(Number(range.value)));

  setPos(Number(range.value));
});
