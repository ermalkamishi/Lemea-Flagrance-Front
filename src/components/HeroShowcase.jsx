import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { autoFitImage } from '../utils/autoFitImage';
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
const MOBILE_SPEED = 26; // phones: px per second (a bit slower, the products are bigger there)
const ARC_SAMPLES = 240;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const clamp01 = (v) => clamp(v, 0, 1);
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const wrap = (v, len) => ((((v + len / 2) % len) + len) % len) - len / 2;

/*
 * Geometry: a half-ellipse whose centre sits on the bottom edge of the stage.
 * phi = 0 is the top of the arc, ±phiMax are just past the left/right ends
 * (slightly below the bottom edge, so products slide out of view there).
 *
 * Phones (small) use a "featured carousel" instead: a wide, gentle dome that is
 * wider than the screen, so one big product sits in the centre with smaller ones
 * at the sides; it slides slowly to the right (see MOBILE_SPEED) and can be swiped.
 */
const getLayout = (width, count) => {
  const small = width < 640;
  let size; // square box per product
  let rx;
  let ry;
  let spacing; // distance between products along the arc
  let arcBottom; // lifts the arc a bit off the bottom edge (phones)
  if (small) {
    size = Math.round(clamp(width * 0.48, 130, 220));
    rx = width * 0.95;
    ry = Math.round(size * 0.5);
    spacing = size * 0.72;
    arcBottom = Math.round(size * 0.25);
  } else {
    size = Math.round(clamp(width / 8, 110, 220));
    rx = Math.max(size, width / 2 - size * 0.4);
    ry = Math.round(Math.max(size / 2 + 140, Math.min(rx * 0.5, 420))); // room for the name + button inside
    spacing = size * 0.78;
    arcBottom = 0;
  }
  const clearance = size * 0.6 + 6; // how far below the edge a product must go to be hidden
  // phones: the dome is wider than the screen, so it can simply end at its sides
  const phiMax = small ? Math.PI / 2 : Math.PI / 2 + Math.asin(Math.min(0.95, clearance / ry));

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
  const loop = Math.max(pathLen + spacing, Math.max(count, 1) * spacing);

  return {
    small,
    width,
    size,
    rx,
    ry,
    phis,
    lens,
    pathLen,
    spacing,
    loop,
    arcBottom,
    stageH: Math.round(ry + size / 2 + 20 + arcBottom),
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

// Every product fills ~90% of its box height or ~80% of its width (see autoFitImage).
const autoFit = (img) => autoFitImage(img, { fitHeight: 0.9, fitWidth: 0.8, maxScale: 1.9 });

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const HeroShowcase = ({
  items = [],
  loading = false,
  getName,
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
  const zState = useRef([]);
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
    const { loop, pathLen, spacing, size, ry, small } = layout;
    const halfW = layout.width / 2;
    const step = loop / count;
    // item 0 lands on the top of the arc, the others alternate right/left of it
    const offsets = Array.from({ length: count }, (_, i) => wrap(i * step, loop));
    const introEnd = introEndFor(count);
    const startY = size * 0.6; // fly-out point: just below the bottom centre of the stage
    if (m.introStart === null) m.introStart = reduce || !withIntro ? -Infinity : performance.now();
    if (m.activeIdx >= count) m.activeIdx = 0;
    m.offset = wrap(m.offset, loop);
    const autoSpeed = small ? MOBILE_SPEED : AUTO_SPEED;

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

      // slow drift to the right; after a swipe the momentum eases back into the drift
      if (elapsed >= introEnd && !m.dragging) {
        const target = m.hovering || reduce ? 0 : autoSpeed;
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

        let depth = 1;
        if (onPath && fly > 0) {
          const target = pointOnArc(layout, dist);
          const x = target.x * fly;
          const y = startY + (target.y - startY) * fly;
          let opacity;
          if (small) {
            // featured carousel: big in the centre, smaller and lighter towards the screen edges
            const nx = Math.abs(target.x) / halfW; // 0 = centre, 1 = screen edge
            depth = 1 - 0.42 * Math.pow(Math.min(1, nx), 1.2);
            opacity = (1 - 0.4 * Math.min(1, nx)) * clamp01((1.3 - nx) / 0.3) * clamp01(fly * 3);
          } else {
            depth = DEPTH_MIN + (1 - DEPTH_MIN) * clamp01(-target.y / ry);
            // fades in as it rises, dissolves near the bottom corners instead of being cut off
            opacity = clamp01((-y - size * 0.45) / (size * 0.55));
          }
          const scale = (0.55 + 0.45 * fly) * depth;
          const tilt = target.angle * TILT * fly;
          card.style.transform = `translate(${x}px, ${y}px) rotate(${tilt}deg) scale(${scale})`;
          card.style.opacity = String(opacity);
          card.style.visibility = 'visible';
        } else {
          card.style.visibility = 'hidden';
        }

        // products closer to the viewer (bigger) are drawn on top
        const z = Math.round(depth * 100);
        if (zState.current[i] !== z) {
          zState.current[i] = z;
          card.style.zIndex = String(z);
        }

        const reachable =
          onPath &&
          fly > 0.99 &&
          (small ? Math.abs(rel) < halfW : Math.abs(rel) < pathLen / 2 - spacing * 0.5);
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

  const centerInfo = shown && (
    <div
      className={`hs-center${layout.small ? ' is-below' : ''}`}
      style={layout.small ? undefined : { bottom: layout.centerBottom, width: layout.centerW }}
    >
      <div key={shown.key} className="hs-center-inner">
       
        <p className="hs-center-name font-serif">{nameOf(shown)}</p>
        
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
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-800 leading-tight pb-2">
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
            <div className="hs-arc" style={{ bottom: layout.arcBottom }}>
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
                  // Pause only for a real mouse hover or keyboard focus. A finger touching a
                  // product (to swipe) must not pause it: touch has no "leave", so it would stay paused.
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(i)}
                  onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
                  onFocus={(e) => e.currentTarget.matches(':focus-visible') && setHover(i)}
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
