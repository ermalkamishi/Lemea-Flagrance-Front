import React, { useRef } from 'react';
import { Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRightOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';

// Slide 1 & 2 image assets
import promoImg1 from '../assets/promo-banner-image (1).jpg';
import promoImg2 from '../assets/promo-banner-image (2).jpg';

const HomePromoBanner = () => {
  const carouselRef = useRef(null);
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isMk = i18n.language === 'mk';

  return (
    <div className="relative group select-none promo-carousel-wrapper">
      {/* Outer Banner Wrapper - exact sizing match to Section 5 carousel */}
      <div className="relative rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl border border-pink-100/50 bg-[#FAF7F2]">
        
        <Carousel
          ref={carouselRef}
          autoplay
          autoplaySpeed={3000}
          effect="fade"
          dots={{ className: 'custom-promo-dots' }}
        >
          {/* ════════════════════════════════════════════════════════
              SLIDE 1: Victoria's Secret 3 Body Mist for 999 Den
          ════════════════════════════════════════════════════════ */}
          <div className="outline-none cursor-pointer" onClick={() => navigate("/produktet?category=Body+Mist&brand=Victoria's+Secret")}>
            <div className="relative w-full h-[360px] sm:h-[400px] md:h-[430px] lg:h-[455px] flex items-center justify-between overflow-hidden">
              
              {/* Full-Bleed Panorama Banner Image */}
              <img
                src={promoImg1}
                alt="Victoria's Secret 3 Body Mist 999 Den"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-100 contrast-[1.03]"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />

              {/* Soft Gradient Scrim on Left: Cushions the text with natural background tone while leaving artwork full-opacity */}
              <div className="absolute inset-y-0 left-0 w-[75%] sm:w-[55%] bg-gradient-to-r from-white/95 via-white/70 to-transparent pointer-events-none" />

              {/* Content Box - Constrained to Left Quadrant */}
              <div className="relative z-10 p-5 sm:p-8 lg:p-12 max-w-[260px] sm:max-w-[340px] lg:max-w-[390px] flex flex-col items-start">
                
                {/* Headline */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 font-serif leading-tight tracking-tight mb-2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                  {isMk ? (
                    <>Victoria's Secret <br /><span className="text-pink-700 font-black">3 Body Mists за 999 Ден</span></>
                  ) : (
                    <>Victoria's Secret <br /><span className="text-pink-700 font-black">3 Body Mist për 999 Den</span></>
                  )}
                </h2>

                {/* Subtitle */}
                <p className="text-slate-900 font-bold text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                  {isMk
                    ? 'Изберете ги вашите 3 омилени мириси по специјална понуда денес.'
                    : 'Zgjidhni 3 nga aromat tuaja më të dashura me çmimin special promocional.'}
                </p>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/produktet?category=Body+Mist&brand=Victoria's+Secret");
                  }}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-pink-600 text-white font-extrabold text-xs sm:text-sm px-5 sm:px-7 py-3 rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-pink-500/25 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                  <span>{isMk ? 'Истражи Victoria\'s Secret' : 'Eksploro Victoria\'s Secret'}</span>
                  <ArrowRightOutlined className="text-xs transition-transform group-hover:translate-x-1" />
                </button>
              </div>

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════
              SLIDE 2: Garden of Smells (VS + Sol De Janeiro Combo)
          ════════════════════════════════════════════════════════ */}
          <div className="outline-none cursor-pointer" onClick={() => navigate('/produktet?combo=vs_sdj')}>
            <div className="relative w-full h-[360px] sm:h-[400px] md:h-[430px] lg:h-[455px] flex items-center justify-between overflow-hidden">
              
              {/* Full-Bleed Panorama Banner Image */}
              <img
                src={promoImg2}
                alt="Garden of Smells Combo Offer"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-100 contrast-[1.03]"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />

              {/* Soft Gradient Scrim on Left: Perfectly balances text contrast using artwork's warm ivory tone while keeping artwork 100% vivid */}
              <div className="absolute inset-y-0 left-0 w-[75%] sm:w-[55%] bg-gradient-to-r from-[#FAF5F1]/95 via-[#FAF5F1]/75 to-transparent pointer-events-none" />

              {/* Content Box - Constrained to Left Quadrant */}
              <div className="relative z-10 p-5 sm:p-8 lg:p-12 max-w-[260px] sm:max-w-[340px] lg:max-w-[390px] flex flex-col items-start">
                
                {/* Headline */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 font-serif leading-tight tracking-tight mb-2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                  {isMk ? (
                    <>VS + Sol De Janeiro <br /><span className="text-amber-800 sm:text-amber-700 font-black">Комбо за 999 Ден!</span></>
                  ) : (
                    <>VS + Sol De Janeiro <br /><span className="text-amber-800 sm:text-amber-700 font-black">Combo për 999 Den!</span></>
                  )}
                </h2>

                {/* Subtitle */}
                <p className="text-slate-900 font-bold text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                  {isMk
                    ? '1 Victoria\'s Secret (499 Ден) + 1 Sol De Janeiro (699 Ден) заедно по супер цена.'
                    : '1 Victoria\'s Secret (499 Den) + 1 Sol De Janeiro (699 Den) së bashku me çmim promocional.'}
                </p>

                {/* Price pill & CTA row */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/produktet?combo=vs_sdj');
                    }}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm px-5 sm:px-6 py-3 rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    <span>{isMk ? 'Види ги комбинациите' : 'Zbulo Kombinimet'}</span>
                    <ArrowRightOutlined className="text-xs transition-transform group-hover:translate-x-1" />
                  </button>

                  <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-pink-200 text-xs font-black text-pink-700 shadow-md">
                    {isMk ? '-199 Ден' : '-199 Den'}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </Carousel>

        {/* Custom Navigation Arrows */}
        <button
          type="button"
          onClick={() => carouselRef.current?.prev()}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border border-white/60"
        >
          <LeftOutlined className="text-xs sm:text-sm" />
        </button>

        <button
          type="button"
          onClick={() => carouselRef.current?.next()}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border border-white/60"
        >
          <RightOutlined className="text-xs sm:text-sm" />
        </button>

      </div>
    </div>
  );
};

export default HomePromoBanner;
