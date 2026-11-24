import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../utils/imageUtils';
import { toNumber } from '../utils/numberUtils';
import './HeroShowcase.css';

/*
 * Animated landing hero: a deck of cards rises from the bottom, flips to reveal
 * the products, then the products spread along a 180° arc that runs from the
 * bottom-left edge of the screen to the bottom-right edge and keeps flowing.
 * Plain 2D CSS transforms driven by one requestAnimationFrame loop (no WebGL).
 * Product photos use mix-blend-mode: multiply so their white backgrounds
 * disappear into the section background.
 * Hover pauses the flow, drag/swipe moves it, every product links to its page.
 */

const AUTO_SPEED = 40; // px per second along the arc once the intro is done
const INTRO = {
  riseDuration: 700,
  riseStagger: 35,
  flipAt: 1050, // flip while the deck spreads, so the photos never pile up on each other
  flipDuration: 450,
  flipStagger: 40,
  spreadAt: 1000,
  spreadDuration: 1400,
};
const INTRO_END = INTRO.spreadAt + INTRO.spreadDuration;
const CLICK_GUARD_MS = 250; // ignore the click that ends a drag
const ARC_SAMPLES = 240;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const clamp01 = (v) => clamp(v, 0, 1);
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const wrap = (v, len) => ((((v + len / 2) % len) + len) % len) - len / 2;

/*
 * Geometry: a half-ellipse whose centre sits on the bottom edge of the stage.
 * phi = 0 is the top of the arc, ±phiMax are just past the left/right ends
 * (slightly below the bottom edge, so products slide out of view there).
 */
const getLayout = (width, count) => {
  const size = Math.round(clamp(width / 9.5, 96, 184)); // square box per product
  const small = width < 640;
  const contentH = small ? 112 : 170; // product info shown inside the arch
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

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const HeroShowcase = ({ products = [], loading = false, getName, getCategoryLabel }) => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const tabState = useRef([]);
  const faceState = useRef([]);
  const motion = useRef({
    offset: 0,
    speed: 0,
    introStart: null,
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

  const count = products.length;
  const shouldRender = loading || count > 0;
  const layout = useMemo(() => getLayout(width || 1024, count || 14), [width, count]);
  const nameOf = (p) => (getName ? getName(p) : p.name);

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

  // The animation loop: intro (rise → flip → spread) then products flowing along the arc.
  useEffect(() => {
    if (!count) return undefined;
    const m = motion.current;
    const reduce = prefersReducedMotion();
    const { loop, pathLen, spacing, size, ry } = layout;
    const step = loop / count;
    // product 0 starts at the top of the arc, the others alternate right/left of it
    const offsets = Array.from({ length: count }, (_, i) => wrap(i * step, loop));
    if (m.introStart === null) m.introStart = reduce ? -Infinity : performance.now();
    if (m.activeIdx >= count) m.activeIdx = 0;

    let raf;
    let last = performance.now();
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!m.visible) return;

      const elapsed = now - m.introStart;
      if (elapsed >= INTRO_END && !m.dragging) {
        const target = m.hovering || reduce ? 0 : AUTO_SPEED;
        m.speed += (target - m.speed) * (1 - Math.exp(-dt * 2.2));
        m.offset = wrap(m.offset + m.speed * dt, loop);
      }

      const spread = easeInOutCubic(clamp01((elapsed - INTRO.spreadAt) / INTRO.spreadDuration));
      let best = 0;
      let bestAbs = Infinity;
      for (let i = 0; i < count; i += 1) {
        const card = cardRefs.current[i];
        if (!card) continue;
        const d = Math.min(i, count - i); // distance from the first product → symmetric fan
        const rise = easeOutCubic(clamp01((elapsed - d * INTRO.riseStagger) / INTRO.riseDuration));
        const flip = easeInOutCubic(
          clamp01((elapsed - INTRO.flipAt - d * INTRO.flipStagger) / INTRO.flipDuration)
        );

        const rel = wrap(offsets[i] * spread + m.offset, loop); // px from the top of the arc
        const dist = pathLen / 2 + rel;
        const onPath = dist >= 0 && dist <= pathLen;
        const lift = (1 - rise) * (ry + size + 40);

        if (onPath) {
          const { x, y, angle } = pointOnArc(layout, dist);
          const flipScale = Math.max(0.001, Math.abs(1 - 2 * flip));
          card.style.transform = `translate(${x}px, ${y + lift}px) rotate(${angle}deg) scaleX(${flipScale})`;
          // dissolve near the bottom corners instead of being cut by the stage edge
          const heightFade = clamp01((-y - size * 0.45) / (size * 0.55));
          card.style.opacity = String(clamp01(rise * 3) * heightFade);
          card.style.visibility = 'visible';
        } else {
          card.style.visibility = 'hidden';
        }

        const showFront = flip >= 0.5;
        if (faceState.current[i] !== showFront) {
          faceState.current[i] = showFront;
          card.classList.toggle('is-front', showFront);
        }

        const reachable = onPath && rise > 0.99 && Math.abs(rel) < pathLen / 2 - spacing * 0.5;
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
  }, [count, layout]);

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

  const shown = count ? products[hoverIdx ?? activeIdx] || products[0] : null;

  return (
    <section ref={sectionRef} className="hs-section" aria-label={t('home.hero_showcase.title')}>
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
              {products.map((p, i) => (
                <Link
                  key={p.id}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  to={`/produktet/${p.id}`}
                  draggable={false}
                  tabIndex={-1}
                  aria-label={nameOf(p)}
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
                    opacity: 0,
                  }}
                >
                  <img
                    className="hs-product"
                    src={getImageUrl(p.image)}
                    alt={nameOf(p)}
                    draggable={false}
                    decoding="async"
                  />
                  <span className="hs-back" aria-hidden="true">
                    <span className="hs-back-mark">L</span>
                  </span>
                </Link>
              ))}
            </div>

            {shown && (
              <div className="hs-center" style={{ bottom: layout.centerBottom, width: layout.centerW }}>
                <div key={shown.id} className="hs-center-inner">
                  <span className="hs-center-cat">
                    {getCategoryLabel ? getCategoryLabel(shown.category) : shown.category}
                  </span>
                  <p className="hs-center-name font-serif">{nameOf(shown)}</p>
                  <p className="hs-center-price">
                    {toNumber(shown.price, 0).toLocaleString()} {t('common.currency')}
                  </p>
                  <Link to={`/produktet/${shown.id}`} className="hs-center-btn">
                    {t('home.hero_showcase.view_product')}
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default HeroShowcase;
