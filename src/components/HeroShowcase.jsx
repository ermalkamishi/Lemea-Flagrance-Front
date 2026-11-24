import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toNumber } from '../utils/numberUtils';
import './HeroShowcase.css';

/*
 * Animated landing hero: the products fly out from the bottom centre to their
 * places on a 180° arc that runs from the bottom-left edge of the screen to the
 * bottom-right edge, then keep flowing along it.
 * Plain 2D CSS transforms driven by one requestAnimationFrame loop (no WebGL).
 * Hover pauses the flow, drag/swipe moves it, every product links to its page.
 *
 * items: [{ key, product (catalog product or null until loaded), image (url), label }]
 * Images should be transparent PNGs; each one is auto-fitted (see autoFit) so all
 * products look about the same size no matter how much empty space their file has.
 */

const AUTO_SPEED = 40; // px per second along the arc once the intro is done
const INTRO = { flyAt: 150, flyDuration: 1100, flyStagger: 70 };
const introEndFor = (count) =>
  INTRO.flyAt + Math.floor(count / 2) * INTRO.flyStagger + INTRO.flyDuration;
const REVEAL_EARLY_MS = 300; // the rest of the site starts fading in just before the arc settles
const TILT = 0.3; // 0 = bottles stay upright, 1 = they lean fully along the arc
const DEPTH_MIN = 0.78; // size at the ends of the arc (1 at the top) → sense of depth
const CLICK_GUARD_MS = 250; // ignore the click that ends a drag
const ARC_SAMPLES = 240;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const clamp01 = (v) => clamp(v, 0, 1);
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const wrap = (v, len) => ((((v + len / 2) % len) + len) % len) - len / 2;

/*
 * Geometry: a half-ellipse whose centre sits on the bottom edge of the stage.
 * phi = 0 is the top of the arc, ±phiMax are just past the left/right ends
 * (slightly below the bottom edge, so products slide out of view there).
 */
const getLayout = (width, count) => {
  const size = Math.round(clamp(width / 9.5, 96, 184)); // square box per product
  const small = width < 640; // phones: product info goes below the arc instead of inside it
  const contentH = small ? 64 : 170; // room kept inside the arch
  const rx = Math.max(size, width / 2 - size * 0.4);
  const ry = Math.round(Math.max(size / 2 + contentH + 24, Math.min(rx * 0.5, 420)));
  const clearance = size * 0.6 + 6; // how far below the edge a product must go to be hidden
  const phiMax = Math.PI / 2 + Math.asin(Math.min(0.95, clearance / ry));

  // Arc-length lookup table so products move at an even speed along the ellipse.
  const phis = new Float64Array(ARC_SAMPLES + 1);
  const lens = new Float64Array(ARC_SAMPLES + 1);
  let prevX = rx * Math.sin(-phiMax);
  let prevY = -ry * Math.cos(-phiMax);
  for (let k = 0; k <= ARC_SAMPLES; k += 1) {
    const phi = -phiMax + (2 * phiMax * k) / ARC_SAMPLES;
    const x = rx * Math.sin(phi);
    const y = -ry * Math.cos(phi);
    phis[k] = phi;
    lens[k] = k === 0 ? 0 : lens[k - 1] + Math.hypot(x - prevX, y - prevY);
    prevX = x;
    prevY = y;
  }
  const pathLen = lens[ARC_SAMPLES];
  const spacing = size * 0.92;
  const loop = Math.max(pathLen + spacing, Math.max(count, 1) * spacing);

  return {
    small,
    size,
    rx,
    ry,
    phis,
    lens,
    pathLen,
    spacing,
    loop,
    stageH: Math.round(ry + size / 2 + 20),
    centerW: Math.round(Math.min(440, Math.max(180, 2 * (rx - size * 0.55) * 0.8))),
    centerBottom: 16,
  };
};

// Position + rotation of a product that is `dist` px along the arc (0 = left end).
const pointOnArc = (layout, dist) => {
  const { lens, phis, rx, ry } = layout;
  let lo = 0;
  let hi = ARC_SAMPLES;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (lens[mid] < dist) lo = mid;
    else hi = mid;
  }
  const seg = lens[hi] - lens[lo] || 1;
  const phi = phis[lo] + ((phis[hi] - phis[lo]) * (dist - lens[lo])) / seg;
  return {
    x: rx * Math.sin(phi),
    y: -ry * Math.cos(phi),
    // rotate so the product "stands" on the arc (points away from its centre)
    angle: (Math.atan2(ry * Math.sin(phi), rx * Math.cos(phi)) * 180) / Math.PI,
  };
};

/*
 * Auto-fit: find the visible (non-transparent) part of a product image and scale/
 * centre it so it fills ~84% of the box height or ~72% of its width, whichever
 * comes first. Result goes into CSS variables used by .hs-product's transform.
 */
const FIT_HEIGHT = 0.84;
const FIT_WIDTH = 0.72;
const MAX_FIT_SCALE = 1.8;
const fitted = new WeakSet();
const autoFit = (img) => {
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
    const k = Math.min(FIT_WIDTH / bw, FIT_HEIGHT / bh, MAX_FIT_SCALE);
    const ox = ((x1 + x2 + 1) / 2 - w / 2) * unit;
    const oy = ((y1 + y2 + 1) / 2 - h / 2) * unit;
    img.style.setProperty('--fit-k', k.toFixed(3));
    img.style.setProperty('--fit-x', `${(-ox * 100).toFixed(2)}%`);
    img.style.setProperty('--fit-y', `${(-oy * 100).toFixed(2)}%`);
  } catch {
    /* unreadable image (e.g. cross-origin): keep the plain contained layout */
  }
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const HeroShowcase = ({
  items = [],
  loading = false,
  getName,
  getCategoryLabel,
  playIntro = true,
  onIntroDone,
}) => {
  const { t } = useTranslation();
  // Decided once when the hero mounts: fly-in intro, or start directly on the arc.
  const [withIntro] = useState(playIntro);
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const tabState = useRef([]);
  const onIntroDoneRef = useRef(onIntroDone);
  const motion = useRef({
    offset: 0,
    speed: 0,
    introStart: null,
    introReported: false,
    hovering: false,
    pressed: false,
    dragging: false,
    startX: 0,
    lastX: 0,
    lastT: 0,
    dragEndedAt: 0,
    visible: true,
    activeIdx: 0,
  });

  const [width, setWidth] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const count = items.length;
  const shouldRender = loading || count > 0;
  const layout = useMemo(() => getLayout(width || 1024, count || 14), [width, count]);

  const nameOf = (item) => {
    if (!item.product) return item.label;
    return getName ? getName(item.product) : item.product.name;
  };
  const linkOf = (item) => (item.product ? `/produktet/${item.product.id}` : '/produktet');

  useEffect(() => {
    onIntroDoneRef.current = onIntroDone;
  }, [onIntroDone]);

  // Track the section width so product size / arc fit the screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [shouldRender]);

  // Skip per-frame work while the hero is scrolled out of view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => {
      motion.current.visible = entry.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, [shouldRender]);

  // The animation loop: intro (products fly onto the arc) then a continuous flow.
  useEffect(() => {
    if (!count) return undefined;
    const m = motion.current;
    const reduce = prefersReducedMotion();
    const { loop, pathLen, spacing, size, ry } = layout;
    const step = loop / count;
    // item 0 lands on the top of the arc, the others alternate right/left of it
    const offsets = Array.from({ length: count }, (_, i) => wrap(i * step, loop));
    const introEnd = introEndFor(count);
    const startY = size * 0.6; // fly-out point: just below the bottom centre of the stage
    if (m.introStart === null) m.introStart = reduce || !withIntro ? -Infinity : performance.now();
    if (m.activeIdx >= count) m.activeIdx = 0;

    let raf;
    let last = performance.now();
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const elapsed = now - m.introStart;

      if (!m.introReported && elapsed >= introEnd - REVEAL_EARLY_MS) {
        m.introReported = true;
        onIntroDoneRef.current?.();
      }
      if (!m.visible) return;

      if (elapsed >= introEnd && !m.dragging) {
        const target = m.hovering || reduce ? 0 : AUTO_SPEED;
        m.speed += (target - m.speed) * (1 - Math.exp(-dt * 2.2));
        m.offset = wrap(m.offset + m.speed * dt, loop);
      }

      let best = 0;
      let bestAbs = Infinity;
      for (let i = 0; i < count; i += 1) {
        const card = cardRefs.current[i];
        if (!card) continue;
        const d = Math.min(i, count - i); // distance from the centre product → symmetric burst
        const fly = easeOutCubic(
          clamp01((elapsed - INTRO.flyAt - d * INTRO.flyStagger) / INTRO.flyDuration)
        );
        const rel = wrap(offsets[i] + m.offset, loop); // px from the top of the arc
        const dist = pathLen / 2 + rel;
        const onPath = dist >= 0 && dist <= pathLen;

        if (onPath && fly > 0) {
          const target = pointOnArc(layout, dist);
          const x = target.x * fly;
          const y = startY + (target.y - startY) * fly;
          const depth = DEPTH_MIN + (1 - DEPTH_MIN) * clamp01(-target.y / ry);
          const scale = (0.55 + 0.45 * fly) * depth;
          const tilt = target.angle * TILT * fly;
          card.style.transform = `translate(${x}px, ${y}px) rotate(${tilt}deg) scale(${scale})`;
          // fades in as it rises, dissolves near the bottom corners instead of being cut off
          card.style.opacity = String(clamp01((-y - size * 0.45) / (size * 0.55)));
          card.style.visibility = 'visible';
        } else {
          card.style.visibility = 'hidden';
        }

        const reachable = onPath && fly > 0.99 && Math.abs(rel) < pathLen / 2 - spacing * 0.5;
        if (tabState.current[i] !== reachable) {
          tabState.current[i] = reachable;
          card.tabIndex = reachable ? 0 : -1;
        }
        if (Math.abs(rel) < bestAbs) {
          bestAbs = Math.abs(rel);
          best = i;
        }
      }
      if (best !== m.activeIdx) {
        m.activeIdx = best;
        setActiveIdx(best);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count, layout, withIntro]);

  // ---- drag / swipe to move the products along the arc ----
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const m = motion.current;
    m.pressed = true;
    m.dragging = false;
    m.startX = e.clientX;
    m.lastX = e.clientX;
    m.lastT = performance.now();
  };

  const onPointerMove = (e) => {
    const m = motion.current;
    if (!m.pressed) return;
    if (!m.dragging) {
      if (Math.abs(e.clientX - m.startX) < 6) return;
      m.dragging = true;
      setIsDragging(true);
      stageRef.current?.setPointerCapture?.(e.pointerId);
    }
    const now = performance.now();
    const dx = e.clientX - m.lastX;
    m.offset = wrap(m.offset + dx, layout.loop);
    const instant = dx / (Math.max(1, now - m.lastT) / 1000);
    m.speed = clamp(m.speed * 0.5 + instant * 0.5, -1500, 1500);
    m.lastX = e.clientX;
    m.lastT = now;
  };

  const endDrag = (e) => {
    const m = motion.current;
    m.pressed = false;
    if (!m.dragging) return;
    m.dragging = false;
    m.dragEndedAt = performance.now();
    setIsDragging(false);
    if (stageRef.current?.hasPointerCapture?.(e.pointerId)) {
      stageRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const guardClick = (e) => {
    if (performance.now() - motion.current.dragEndedAt < CLICK_GUARD_MS) e.preventDefault();
  };

  const setHover = (i) => {
    motion.current.hovering = i !== null;
    setHoverIdx(i);
  };

  if (!shouldRender) return null;

  const shown = count ? items[hoverIdx ?? activeIdx] || items[0] : null;
  const shownProduct = shown?.product;

  const centerInfo = shown && (
    <div
      className={`hs-center${layout.small ? ' is-below' : ''}`}
      style={layout.small ? undefined : { bottom: layout.centerBottom, width: layout.centerW }}
    >
      <div key={shown.key} className="hs-center-inner">
        {shownProduct && (
          <span className="hs-center-cat">
            {getCategoryLabel ? getCategoryLabel(shownProduct.category) : shownProduct.category}
          </span>
        )}
        <p className="hs-center-name font-serif">{nameOf(shown)}</p>
        {shownProduct && (
          <p className="hs-center-price">
            {toNumber(shownProduct.price, 0).toLocaleString()} {t('common.currency')}
          </p>
        )}
        <Link to={linkOf(shown)} className="hs-center-btn">
          {t('home.hero_showcase.view_product')}
        </Link>
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className={`hs-section${withIntro ? '' : ' hs-no-intro'}`}
      aria-label={t('home.hero_showcase.title')}
    >
      <div className="hs-header max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-800 leading-tight">
          {t('home.hero_showcase.title')}
        </h1>
      </div>

      <div
        ref={stageRef}
        className={`hs-stage${isDragging ? ' is-dragging' : ''}`}
        style={{ height: layout.stageH }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {count === 0 ? (
          <div
            className="hs-skeleton"
            style={{
              width: layout.rx * 2 + layout.size,
              height: layout.ry * 2 + layout.size,
              bottom: -(layout.ry + layout.size / 2),
              borderWidth: layout.size * 0.75,
            }}
          />
        ) : (
          <>
            <div className="hs-arc">
              {items.map((item, i) => (
                <Link
                  key={item.key}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  to={linkOf(item)}
                  draggable={false}
                  tabIndex={-1}
                  aria-label={nameOf(item)}
                  onClick={guardClick}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className={`hs-card${hoverIdx === i ? ' is-hovered' : ''}`}
                  style={{
                    width: layout.size,
                    height: layout.size,
                    marginLeft: -layout.size / 2,
                    marginTop: -layout.size / 2,
                    zIndex: count - Math.min(i, count - i),
                    visibility: 'hidden',
                  }}
                >
                  <img
                    ref={autoFit}
                    className="hs-product"
                    src={item.image}
                    alt={nameOf(item)}
                    draggable={false}
                    decoding="async"
                    onLoad={(e) => autoFit(e.currentTarget)}
                  />
                </Link>
              ))}
            </div>

            {!layout.small && centerInfo}
          </>
        )}
      </div>
      {layout.small && centerInfo}
    </section>
  );
};

export default HeroShowcase;
