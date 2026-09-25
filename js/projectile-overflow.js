import { canvasWidth, screenScale } from './screen.js';
// Let the entire projectile trail leave the browser before recycling it.
export function projectileResetX() {
  return -Math.max(0, window.innerWidth - canvasWidth) / screenScale - 170;
}
