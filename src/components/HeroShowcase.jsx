import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../utils/imageUtils';
import { toNumber } from '../utils/numberUtils';
import './HeroShowcase.css';

/*
 * Animated landing hero: a deck of product cards rises from the bottom,
 * flips face-up, fans out and closes into a tilted ring that keeps turning.
 * Pure CSS 3D transforms driven by one requestAnimationFrame loop (no WebGL).
 * Hover pauses the ring, drag/swipe spins it, every card links to its product.
 */

const AUTO_SPEED = 6; // degrees per second once the ring has formed
const INTRO = {
  riseDuration: 700,
  riseStagger: 35,
  flipAt: 550,
  flipDuration: 520,
  flipStagger: 30,
  spreadAt: 1000,
  spreadDuration: 1400,
};
const INTRO_END = INTRO.spreadAt + INTRO.spreadDuration;
const CLICK_GUARD_MS = 250; // ignore the click that ends a drag

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const wrapDeg = (a) => ((((a + 180) % 360) + 360) % 360) - 180;

const getLayout = (width, count) => {
  const w = Math.round(Math.min(136, Math.max(84, width / 9)));
  const h = Math.round((w * 4) / 3);
  const r = Math.round((Math.max(count, 10) * w * 1.12) / (2 * Math.PI));
  const below = Math.round(w * 0.5); // how much of the ring shows under its centre line
  const stageH = Math.round(r + h / 2 + 28 + below);
  const innerR = r - h / 2;
  const centerW = Math.round(Math.min(440, 2 * innerR * 0.82));
  // On small screens the arch is low, so the product info sits lower (below the ring's centre line).
  const centerBottom = innerR < 200 ? 10 : below + 12;
  return { w, h, r, below, stageH, centerW, centerBottom };
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
  const motion = useRef({
    rot: 0,
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

  // Track the section width so card size / ring radius fit the screen.
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

  // The animation loop: intro (rise → flip → spread) then a slowly turning ring.
  useEffect(() => {
    if (!count) return undefined;
    const m = motion.current;
    const reduce = prefersReducedMotion();
    const step = 360 / count;
    const offsets = Array.from({ length: count }, (_, i) => wrapDeg(i * step));
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
        m.rot += m.speed * dt;
      }

      const spread = easeInOutCubic(clamp01((elapsed - INTRO.spreadAt) / INTRO.spreadDuration));
      let best = 0;
      let bestAbs = Infinity;
      for (let i = 0; i < count; i += 1) {
        const card = cardRefs.current[i];
        if (!card) continue;
        const d = Math.min(i, count - i); // distance from the top card → symmetric fan
        const rise = easeOutCubic(clamp01((elapsed - d * INTRO.riseStagger) / INTRO.riseDuration));
        const flip = easeInOutCubic(
          clamp01((elapsed - INTRO.flipAt - d * INTRO.flipStagger) / INTRO.flipDuration)
        );
        const angle = m.rot + offsets[i] * spread;
        const lift = (1 - rise) * (layout.r + layout.h + 40);
        card.style.transform = `rotateZ(${angle}deg) translateY(${lift - layout.r}px) rotateY(${180 * (1 - flip)}deg)`;
        card.style.opacity = String(clamp01(rise * 3));

        const a = Math.abs(wrapDeg(angle));
        const reachable = a < 95 && rise > 0.99;
        if (tabState.current[i] !== reachable) {
          tabState.current[i] = reachable;
          card.tabIndex = reachable ? 0 : -1;
        }
        if (a < bestAbs) {
          bestAbs = a;
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
  }, [count, layout.r, layout.h]);

  // ---- drag / swipe to spin ----
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
    const degPerPx = 180 / (Math.PI * layout.r);
    const dDeg = (e.clientX - m.lastX) * degPerPx;
    m.rot += dDeg;
    const instant = dDeg / (Math.max(1, now - m.lastT) / 1000);
    m.speed = Math.max(-240, Math.min(240, m.speed * 0.5 + instant * 0.5));
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
  const showNames = layout.w >= 104;

  return (
    <section ref={sectionRef} className="hs-section" aria-label={t('home.hero_showcase.title')}>
      <div className="hs-header max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 text-center">
        <span className="hs-eyebrow">Lemea Flagrance</span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-800 leading-tight">
          {t('home.hero_showcase.title')}
        </h1>
        <p className="text-gray-500 text-sm sm:text-base mt-3 max-w-xl mx-auto">
          {t('home.hero_showcase.subtitle')}
        </p>
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
              width: layout.r * 2 + layout.h,
              height: layout.r * 2 + layout.h,
              bottom: layout.below - layout.r - layout.h / 2,
              borderWidth: layout.h * 0.9,
            }}
          />
        ) : (
          <>
            <div className="hs-ring" style={{ bottom: layout.below }}>
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
                    width: layout.w,
                    height: layout.h,
                    marginLeft: -layout.w / 2,
                    marginTop: -layout.h / 2,
                    zIndex: count - Math.min(i, count - i),
                    opacity: 0,
                  }}
                >
                  <span className="hs-face hs-front">
                    <img
                      src={getImageUrl(p.image)}
                      alt={nameOf(p)}
                      draggable={false}
                      decoding="async"
                    />
                    {showNames && <span className="hs-card-name">{nameOf(p)}</span>}
                  </span>
                  <span className="hs-face hs-back" aria-hidden="true">
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
