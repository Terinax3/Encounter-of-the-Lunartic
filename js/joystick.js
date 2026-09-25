// Circular travel limit plus a small dead zone to prevent thumb jitter.
export function joystickVector(dx, dy, radius, deadZone = 0.12) {
  if (radius <= 0) return { x: 0, y: 0, offsetX: 0, offsetY: 0 };
  const distance = Math.hypot(dx, dy);
  const travel = Math.min(distance, radius);
  const strength = Math.max(0, (travel / radius - deadZone) / (1 - deadZone));
  const ux = distance ? dx / distance : 0;
  const uy = distance ? dy / distance : 0;
  return { x: ux * strength, y: uy * strength, offsetX: ux * travel, offsetY: uy * travel };
}

export function createJoystick(parent) {
  const base = document.createElement('div');
  base.id = 'touch-joystick';
  base.hidden = true;
  base.setAttribute('role', 'group');
  base.setAttribute('aria-label', 'Flight joystick: drag to steer');
  const knob = document.createElement('span');
  knob.className = 'joystick-knob';
  knob.setAttribute('aria-hidden', 'true');
  base.append(knob);
  parent.append(base);

  let pointer = null;
  let enabled = false;
  const axes = { x: 0, y: 0 };
  function reset() {
    const captured = pointer;
    pointer = null;
    axes.x = axes.y = 0;
    knob.style.transform = 'translate(-50%, -50%)';
    base.classList.remove('active');
    if (captured !== null && base.hasPointerCapture(captured)) base.releasePointerCapture(captured);
  }
  function move(event) {
    const rect = base.getBoundingClientRect();
    const radius = Math.max(0, (rect.width - knob.offsetWidth) / 2 - 3);
    const vector = joystickVector(event.clientX - rect.left - rect.width / 2,
      event.clientY - rect.top - rect.height / 2, radius);
    axes.x = vector.x;
    axes.y = vector.y;
    knob.style.transform = `translate(calc(-50% + ${vector.offsetX}px), calc(-50% + ${vector.offsetY}px))`;
  }
  base.addEventListener('pointerdown', event => {
    if (!enabled || pointer !== null || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    pointer = event.pointerId;
    base.setPointerCapture(pointer);
    base.classList.add('active');
    move(event);
  });
  base.addEventListener('pointermove', event => {
    if (event.pointerId !== pointer) return;
    event.preventDefault();
    event.stopPropagation();
    move(event);
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    base.addEventListener(name, event => {
      if (event.pointerId === pointer) reset();
    });
  }
  base.addEventListener('contextmenu', event => event.preventDefault());
  window.addEventListener('blur', reset);
  window.addEventListener('resize', reset);
  document.addEventListener('visibilitychange', reset);
  return {
    axes,
    setEnabled(value) {
      const touchDevice = navigator.maxTouchPoints > 0 || matchMedia('(any-pointer: coarse)').matches;
      const next = Boolean(value && touchDevice);
      if (enabled === next) return;
      enabled = next;
      base.hidden = !enabled;
      if (!enabled) reset();
    },
  };
}
