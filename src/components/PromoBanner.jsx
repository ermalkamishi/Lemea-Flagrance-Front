import React, { useState, useEffect } from 'react';
import { Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PROMO, isPromoActive } from '../config/promoConfig';

/* ─── Small time unit block ─── */
const TimeUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div
      className="bg-white/10 border border-white/10 rounded-lg text-center"
      style={{ padding: '4px 8px', minWidth: 36 }}
    >
      <span className="text-white font-black text-sm leading-none">
        {String(value).padStart(2, '0')}
      </span>
    </div>
    <span className="text-white/40 mt-0.5" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </span>
  </div>
);

/* ─── Decorative overlay blobs ─── */
const Blob = ({ style }) => (
  <div className="absolute pointer-events-none" style={style} />
);

/**
 * PromoBanner
 * Bilingual (Albanian + Macedonian) promotion strip.
 * Shows a 3-slide Carousel while isPromoActive() is true.
 * Returns null automatically after the promo ends.
 *
 * @param {boolean} compact - Reduces height; use in Cart / Checkout.
 */
const PromoBanner = ({ compact = false }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ days: 5, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = PROMO.end - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setTimeLeft(calc());
    const timer = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Auto-hide after promo ends ──
  if (!isPromoActive()) return null;

  const py      = compact ? '10px 14px' : '14px 20px';
  const minH    = compact ? 58 : 74;
  const my      = compact ? '10px 0' : '20px 0';
  const baseBg  = 'linear-gradient(90deg, #0f172a 0%, #1a0a22 50%, #0f172a 100%)';

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    padding: py,
    minHeight: minH,
    background: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div
      style={{
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.07)',
        margin: my,
        width: '100%',
        background: baseBg,
      }}
    >
      <Carousel autoplay autoplaySpeed={4500} dots={false} fade>

        {/* ─── SLIDE 1 — Main offer ─── */}
        <div>
          <div style={rowStyle}>
            <Blob style={{ inset: 0, background: 'radial-gradient(ellipse at top right, rgba(236,72,153,0.14) 0%, transparent 65%)' }} />
            <Blob style={{ inset: 0, background: 'radial-gradient(ellipse at bottom left, rgba(234,179,8,0.09) 0%, transparent 65%)' }} />

            {/* Badge */}
            <span
              style={{
                background: 'linear-gradient(135deg, #db2777, #e11d48)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: 999,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              🏷️ 5 ditë · 5 дена
            </span>

            {/* Text block */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 14, lineHeight: 1.3, margin: 0 }}>
                Të gjitha parfumet &nbsp;
                <span style={{ color: '#fbbf24', fontWeight: 900 }}>1.399 Den</span>
              </p>
              <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 2, lineHeight: 1.3 }}>
                Сите парфеми &nbsp;
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>1.399 Ден</span>
              </p>
            </div>

            {/* Tag */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'rgba(255,255,255,0.65)',
                fontSize: 11,
                fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.10)',
                padding: '5px 12px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              ✨ Ekskluzive · Ексклузивно
            </span>
          </div>
        </div>

        {/* ─── SLIDE 2 — Countdown ─── */}
        <div>
          <div style={{ ...rowStyle, gap: 16 }}>
            <Blob style={{ inset: 0, background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />

            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
              ⏱️ Mbaron / Завршува:
            </span>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <TimeUnit value={timeLeft.days}    label="dit" />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginBottom: 14, fontSize: 14 }}>:</span>
              <TimeUnit value={timeLeft.hours}   label="orë" />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginBottom: 14, fontSize: 14 }}>:</span>
              <TimeUnit value={timeLeft.minutes} label="min" />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginBottom: 14, fontSize: 14 }}>:</span>
              <TimeUnit value={timeLeft.seconds} label="sek" />
            </div>

            <span style={{ color: '#fbbf24', fontWeight: 900, fontSize: 14, flexShrink: 0, whiteSpace: 'nowrap' }}>
              @ 1.399 Den
            </span>
          </div>
        </div>

        {/* ─── SLIDE 3 — CTA ─── */}
        <div>
          <div style={rowStyle}>
            <Blob style={{ inset: 0, background: 'radial-gradient(ellipse at top left, rgba(251,191,36,0.09) 0%, transparent 65%)' }} />
            <Blob style={{ inset: 0, background: 'radial-gradient(ellipse at bottom right, rgba(236,72,153,0.10) 0%, transparent 65%)' }} />

            {/* Text */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.3, margin: 0 }}>
                ✨ Ofertë ekskluzive · Ексклузивна понуда
              </p>
              <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
                Parfume për meshkuj &amp; femra · Парфеми за мажи &amp; жени
              </p>
            </div>

            {/* CTA button */}
            <button
              onClick={() => navigate('/produktet')}
              style={{
                background: 'linear-gradient(135deg, #ec4899, #e11d48)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 12,
                padding: '8px 20px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 14px rgba(236,72,153,0.35)',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              Blij Tani / Купи Сега →
            </button>
          </div>
        </div>

      </Carousel>
    </div>
  );
};

export default PromoBanner;
