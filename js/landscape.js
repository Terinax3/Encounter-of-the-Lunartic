export function needsLandscape(w, h, touchDevice) {
  return touchDevice && h > w;
}
export function landscapeRequired() {
  return needsLandscape(innerWidth, innerHeight,
    navigator.maxTouchPoints > 0 || matchMedia('(any-pointer: coarse)').matches);
}
export function setupLandscape() {
  const overlay = document.getElementById('rotate-screen');
  const stage = document.getElementById('game-stage');
  const update = () => {
    const blocked = landscapeRequired();
    overlay.hidden = !blocked;
    stage.inert = blocked;
  };
  document.getElementById('landscape-button').addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      if (screen.orientation?.lock) await screen.orientation.lock('landscape');
    } catch {
      // Rotation remains the fallback when fullscreen or locking is unavailable.
    }
    update();
    if (landscapeRequired()) {
      document.getElementById('rotate-help').textContent = 'Turn your phone or iPad sideways. If needed, turn off your device’s rotation lock.';
    }
  });
  window.addEventListener('resize', update);
  screen.orientation?.addEventListener('change', update);
  update();
}
