// Full-screen starfield. This decorative canvas never receives input.
export function createSpaceBackground() {
  const canvas = document.createElement('canvas');
  canvas.id = 'space-background';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const context = canvas.getContext('2d');
  const stars = Array.from({ length: 700 }, () => ({
    x: Math.random(), y: Math.random(), phase: Math.random() * Math.PI * 2,
  }));
  let width = 0;
  let height = 0;
  let density = 1;
  function resize() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    density = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }
  function draw(time, scale) {
    if (width !== window.innerWidth || height !== window.innerHeight ||
        density !== Math.min(window.devicePixelRatio || 1, 2)) resize();
    context.setTransform(density, 0, 0, density, 0, 0);
    context.fillStyle = 'rgb(30, 30, 70)';
    context.fillRect(0, 0, width, height);
    const count = Math.min(stars.length, Math.max(180, Math.round(width * height / 4000)));
    const radius = Math.max(0.5, 1.5 * scale);
    for (let i = 0; i < count; i++) {
      const star = stars[i];
      context.fillStyle = `rgba(255,255,255,${Math.abs(Math.sin(star.phase + time * 0.0006)) * 0.4})`;
      context.beginPath();
      context.arc(star.x * width, star.y * height, radius, 0, Math.PI * 2);
      context.fill();
    }
  }
  resize();
  return { draw };
}
