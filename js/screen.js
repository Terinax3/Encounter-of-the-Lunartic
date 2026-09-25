// The world fills the viewport. A shared uniform scale preserves artwork proportions.
export let screenScale = 1;
export let worldWidth = 1920;
export let worldHeight = 1080;
export let canvasWidth = 1920;
export let canvasHeight = 1080;

export function updateScreen(pixelWidth, pixelHeight) {
  canvasWidth = Math.max(1, pixelWidth);
  canvasHeight = Math.max(1, pixelHeight);
  screenScale = Math.min(canvasWidth / 1920, canvasHeight / 1080);
  worldWidth = canvasWidth / screenScale;
  worldHeight = canvasHeight / screenScale;
}
export function remapPosition(object, previous) {
  object.x *= worldWidth / previous.width;
  object.y *= worldHeight / previous.height;
}
export function screenPoint(clientX, clientY, bounds) {
  return {x: (clientX - bounds.left) * worldWidth / bounds.width,
    y: (clientY - bounds.top) * worldHeight / bounds.height};
}
