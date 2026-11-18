import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { StarFilled, ArrowRightOutlined, GiftOutlined } from '@ant-design/icons';
import { toNumber } from '../utils/numberUtils';

// Import transparent bottle assets
import bannerVS1 from '../assets/banner_VS1.png';
import bannerVS3 from '../assets/banner_VS3.png';
import bannerVS5 from '../assets/banner_VS5.png';

import bannerSDJ1 from '../assets/banner_SDJ1.png';
import bannerSDJ2 from '../assets/banner_SDJ2.png';
import bannerSDJ3 from '../assets/banner_SDJ3.png';
import bannerSDJ5 from '../assets/banner_SDJ5.png';

/**
 * Each floating bottle is linked to a real product by a name fragment, so the
 * tooltip always shows the live name, price and stock from the database.
 * depth = how far the bottle moves with the mouse (front bottles move more).
 */
const BOTTLES = [
  {
    key: 'sdj48', src: bannerSDJ1, match: '48', label: "Cheirosa '48",
    wrap: 'left-[2%] sm:left-[5%] top-[10%]', img: 'w-24 sm:w-28 md:w-32 animate-float-slow',
    shadow: 'drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)]', rot: '-14deg', delay: '0s', z: 10, depth: 10,
  },
  {
    key: 'vsCandy', src: bannerVS1, match: 'candy baby', label: 'VS Candy Baby',
    wrap: 'left-[20%] sm:left-[22%] top-[2%]', img: 'w-26 sm:w-32 md:w-36 animate-float-medium',
    shadow: 'drop-shadow-[0_15px_30px_rgba(236,72,153,0.2)]', rot: '12deg', delay: '0.4s', z: 20, depth: 16,
  },
  {
    key: 'sdjAfter', src: bannerSDJ3, match: 'after hours', label: 'After Hours',
    wrap: 'left-[38%] sm:left-[40%] top-[15%]', img: 'w-28 sm:w-36 md:w-40 animate-float-fast',
    shadow: 'drop-shadow-[0_18px_35px_rgba(0,0,0,0.18)]', rot: '-6deg', delay: '0.8s', z: 30, depth: 22,
  },
  {
    key: 'vsCoconut', src: bannerVS3, match: 'coconut passion', label: 'VS Coconut Passion',
    wrap: 'left-[56%] sm:left-[58%] top-[5%]', img: 'w-26 sm:w-32 md:w-36 animate-float-medium',
    shadow: 'drop-shadow-[0_15px_28px_rgba(236,72,153,0.18)]', rot: '15deg', delay: '1.2s', z: 25, depth: 18,
  },
  {
    key: 'sdj71', src: bannerSDJ5, match: '71', label: "Cheirosa '71",
    wrap: 'right-[2%] sm:right-[5%] top-[12%]', img: 'w-24 sm:w-28 md:w-32 animate-float-slow',
    shadow: 'drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)]', rot: '-12deg', delay: '0.6s', z: 15, depth: 12,
  },
  {
    key: 'vsLoveSpell', src: bannerVS5, match: 'love spell', exact: 'vs love spell', label: 'VS Love Spell',
    wrap: 'left-[32%] bottom-[5%]', img: 'w-18 sm:w-22 opacity-80 animate-float-slow',
    shadow: 'drop-shadow-md', rot: '25deg', delay: '1.6s', z: 5, depth: 6,
  },
  {
    key: 'sdj59', src: bannerSDJ2, match: '59', label: 'Cheirosa 59 Delícia Drench',
    wrap: 'right-[25%] bottom-[2%]', img: 'w-18 sm:w-22 opacity-85 animate-float-medium',
    shadow: 'drop-shadow-md', rot: '-20deg', delay: '1.0s', z: 6, depth: 8,
  },
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const ComboPromoBanner = ({ onBannerClick }) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isMk = i18n.language === 'mk';
  const allProducts = useSelector((state) => state.products.items);

  const stageRef = useRef(null);
  const lastPointerType = useRef('mouse');
  const pointerIsDown = useRef(false);
  const [activeKey, setActiveKey] = useState(null);

  // Link every bottle to its live product (name, price, stock)
  const bottleProducts = useMemo(() => {
    const list = Array.isArray(allProducts) ? allProducts : [];
    const map = {};
    for (const b of BOTTLES) {
      const byName = (p) => (p.name || '').toLowerCase();
      map[b.key] =
        (b.exact && list.find((p) => byName(p) === b.exact)) ||
        list.find((p) => byName(p).includes(b.match)) ||
        null;
    }
    return map;
  }, [allProducts]);

  const handleBannerClick = () => {
    if (onBannerClick) {
      onBannerClick();
    } else {
      navigate('/produktet?combo=vs_sdj');
    }
  };

  // Mouse parallax: write CSS variables directly (no React re-render per mouse move)
  const handleMouseMove = (e) => {
    const el = stageRef.current;
    if (!el || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 .. 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    el.style.setProperty('--mx', x.toFixed(3));
    el.style.setProperty('--my', y.toFixed(3));
  };

  const resetParallax = () => {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty('--mx', '0');
    el.style.setProperty('--my', '0');
    setActiveKey(null);
  };

  const openProduct = (bottle) => {
    const product = bottleProducts[bottle.key];
    if (product) navigate(`/produktet/${product.id}`);
    else handleBannerClick();
  };

  // Desktop: hover shows the scent, click opens it.
  // Touch: first tap shows the scent, second tap on the same bottle opens it.
  const handleBottleClick = (e, bottle) => {
    e.stopPropagation();
    pointerIsDown.current = false;
    if (lastPointerType.current !== 'mouse' && activeKey !== bottle.key) {
      setActiveKey(bottle.key);
      return;
    }
    openProduct(bottle);
  };

  const formatPrice = (p) => `${toNumber(p?.price, 0).toLocaleString()} Den`;
  const isOut = (p) => p && (!p.inStock || p.stockQuantity === 0);

  return (
    <div
      onClick={handleBannerClick}
      className="bg-white rounded-3xl md:rounded-[36px] border border-pink-100/80 shadow-[0_15px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_22px_50px_rgba(236,72,153,0.15)] transition-all duration-500 overflow-hidden cursor-pointer group relative p-6 md:p-10 mb-8 select-none"
    >
      {/* Background Sparkling Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <StarFilled className="absolute top-6 left-[15%] text-amber-400 text-lg opacity-80 animate-sparkle" style={{ animationDelay: '0s' }} />
        <StarFilled className="absolute bottom-8 left-[35%] text-pink-400 text-sm opacity-90 animate-sparkle" style={{ animationDelay: '0.7s' }} />
        <StarFilled className="absolute top-10 left-[48%] text-purple-400 text-xl opacity-75 animate-sparkle" style={{ animationDelay: '1.4s' }} />
        <StarFilled className="absolute bottom-12 right-[32%] text-rose-400 text-base opacity-85 animate-sparkle" style={{ animationDelay: '0.4s' }} />
        <StarFilled className="absolute top-8 right-[12%] text-amber-400 text-sm opacity-80 animate-sparkle" style={{ animationDelay: '1.8s' }} />
        <StarFilled className="absolute bottom-6 left-[8%] text-pink-500 text-xl opacity-60 animate-sparkle" style={{ animationDelay: '1.1s' }} />

        {/* Soft background ambient glow blobs */}
        <div className="w-64 h-64 bg-pink-100/40 rounded-full absolute -left-20 -top-20 blur-3xl"></div>
        <div className="w-72 h-72 bg-amber-100/30 rounded-full absolute left-1/3 -bottom-24 blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 min-h-[220px]">

        {/* Interactive floating bottle cluster */}
        <div
          ref={stageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetParallax}
          className="w-full lg:w-3/5 relative h-56 sm:h-64 md:h-72 flex items-center justify-center"
          style={{ '--mx': 0, '--my': 0 }}
        >
          {BOTTLES.map((b) => {
            const product = bottleProducts[b.key];
            const isActive = activeKey === b.key;
            const dimmed = activeKey && !isActive;
            const name = product ? (isMk && product.name_mk ? product.name_mk : product.name) : b.label;

            return (
              <div
                key={b.key}
                role="button"
                tabIndex={0}
                aria-label={product ? `${name} – ${formatPrice(product)}` : name}
                onPointerDown={(e) => {
                  lastPointerType.current = e.pointerType || 'mouse';
                  pointerIsDown.current = true;
                }}
                // Hover only for a real mouse; touch screens use tap (see handleBottleClick)
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') { lastPointerType.current = 'mouse'; setActiveKey(b.key); } }}
                onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActiveKey(null); }}
                // Keyboard focus shows the scent; focus caused by a tap is ignored
                onFocus={() => { if (!pointerIsDown.current) setActiveKey(b.key); }}
                onBlur={() => setActiveKey(null)}
                onClick={(e) => handleBottleClick(e, b)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    openProduct(b);
                  }
                }}
                className={`absolute ${b.wrap} outline-none transition-[transform,opacity,filter] duration-300 ease-out ${dimmed ? 'opacity-50 saturate-50' : 'opacity-100'}`}
                style={{
                  zIndex: isActive ? 50 : b.z,
                  transform: `translate3d(calc(var(--mx) * ${b.depth}px), calc(var(--my) * ${b.depth * 0.6}px), 0) scale(${isActive ? 1.12 : 1})`,
                }}
              >
                <img
                  src={b.src}
                  alt={name}
                  draggable={false}
                  className={`${b.img} object-contain ${b.shadow} pointer-events-none`}
                  style={{ '--rot': b.rot, animationDelay: b.delay }}
                />

                {/* Scent tooltip */}
                <div
                  className={`pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-white/95 backdrop-blur-md border border-pink-100 shadow-[0_10px_30px_rgba(236,72,153,0.25)] px-3 py-2 text-center transition-all duration-200 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                >
                  <div className="text-[11px] sm:text-xs font-extrabold text-slate-900 leading-tight">{name}</div>
                  {product && (
                    <div className="text-[11px] sm:text-xs font-bold leading-tight mt-0.5">
                      {isOut(product) ? (
                        <span className="text-gray-400">{isMk ? 'Нема на залиха' : 'Jashtë stokut'}</span>
                      ) : (
                        <span className="text-pink-600">{formatPrice(product)}</span>
                      )}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    <span className="[@media(hover:hover)]:hidden">
                      {isMk ? 'Допри повторно за детали' : 'Prek sërish për detaje'}
                    </span>
                    <span className="hidden [@media(hover:hover)]:inline">
                      {isMk ? 'Кликни за детали' : 'Kliko për detaje'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Discoverability hint */}
          <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-semibold text-gray-400 bg-white/70 backdrop-blur-sm rounded-full px-3 py-1 whitespace-nowrap">
            <span className="[@media(hover:hover)]:hidden">
              {isMk ? 'Допри шише за да ја видиш аромата' : 'Prek një shishe për ta parë aromën'}
            </span>
           
          </div>
        </div>

        {/* Right-Side Content (Clear Negative Space) */}
        <div className="w-full lg:w-2/5 flex flex-col justify-center text-left lg:pl-4">

          {/* Offer Pill Badge */}
          

          {/* Bold Promotional Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight font-serif mb-2 tracking-tight">
            {isMk ? (
              <>ПАКЕТ ПОНУДА: <span className="text-pink-600">VS + SDJ</span> за <span className="text-amber-500 underline decoration-pink-300">999 Den</span>!</>
            ) : (
              <>BUNDLE OFFER: <span className="text-pink-600">VS + SDJ</span> for <span className="text-amber-500 underline decoration-pink-300">999 Den</span>!</>
            )}
          </h2>

          {/* Subtitle Details */}
          <p className="text-gray-600 text-sm sm:text-base mb-4 leading-relaxed font-medium">
            {isMk
              ? "Купете 1 Victoria's Secret Body Mist (499 Den) + 1 Sol De Janeiro Body Mist (699 Den) заедно за само 999 Den!"
              : "Bli 1 Victoria's Secret Body Mist (499 Den) + 1 Sol De Janeiro Body Mist (699 Den) së bashku për vetëm 999 Den!"
            }
          </p>

          {/* Price Tag & CTA Row */}
          <div className="flex flex-wrap items-center gap-4">

            {/* Price Box */}
            <div className="flex items-center gap-3 bg-pink-50/80 border border-pink-100 px-4 py-2 rounded-2xl">
              <span className="text-gray-400 line-through text-sm font-semibold">1,198 Den</span>
              <span className="text-2xl font-black text-slate-900">999 <span className="text-sm font-bold">Den</span></span>
              <span className="bg-rose-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                -{isMk ? 'Заштеди 199 Den' : 'Kurse 199 Den'}
              </span>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              className="bg-slate-900 text-white font-extrabold text-sm sm:text-base px-6 py-3 rounded-2xl hover:bg-pink-500 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300 flex items-center gap-2 group-hover:translate-x-1 cursor-pointer"
            >
              {isMk ? 'Избери Ароми' : 'Zgjidh Aromat'} <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ComboPromoBanner;
