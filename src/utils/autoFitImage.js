/*
 * Auto-fit for transparent product images (PNG/WebP).
 *
 * Finds the visible (non-transparent) part of the image and writes CSS variables
 * --fit-k (scale), --fit-x / --fit-y (centring offset, % of the box) on the <img>,
 * so a stylesheet can make every product fill its box the same way, no matter how
 * much empty space the file has around the bottle. The <img> is expected to use
 * object-fit: contain and a transform like:
 *   transform: scale(var(--fit-k, 1)) translate(var(--fit-x, 0%), var(--fit-y, 0%));
 *
 * Use it as the <img>'s ref and onLoad handler. Only works for same-origin images
 * (cross-origin ones are left as they are).
 */
const fitted = new WeakSet();

export const autoFitImage = (img, { fitHeight = 0.9, fitWidth = 0.8, maxScale = 1.9 } = {}) => {
  if (!img || fitted.has(img) || !img.complete || !img.naturalWidth) return;
  fitted.add(img);
  try {
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const down = Math.min(1, 160 / Math.max(W, H)); // a small copy is plenty to find the edges
    const w = Math.max(1, Math.round(W * down));
    const h = Math.max(1, Math.round(H * down));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    let x1 = w;
    let y1 = h;
    let x2 = -1;
    let y2 = -1;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        if (data[(y * w + x) * 4 + 3] > 40) {
          if (x < x1) x1 = x;
          if (x > x2) x2 = x;
          if (y < y1) y1 = y;
          if (y > y2) y2 = y;
        }
      }
    }
    if (x2 < 0) return;
    const unit = 1 / Math.max(w, h); // object-fit: contain → one pixel as a fraction of the box
    const bw = (x2 - x1 + 1) * unit;
    const bh = (y2 - y1 + 1) * unit;
    const k = Math.min(fitWidth / bw, fitHeight / bh, maxScale);
    const ox = ((x1 + x2 + 1) / 2 - w / 2) * unit;
    const oy = ((y1 + y2 + 1) / 2 - h / 2) * unit;
    img.style.setProperty('--fit-k', k.toFixed(3));
    img.style.setProperty('--fit-x', `${(-ox * 100).toFixed(2)}%`);
    img.style.setProperty('--fit-y', `${(-oy * 100).toFixed(2)}%`);
  } catch {
    /* unreadable image (e.g. cross-origin): keep the plain contained layout */
  }
};
