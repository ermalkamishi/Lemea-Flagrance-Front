import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StarFilled, ArrowRightOutlined, FireOutlined, GiftOutlined } from '@ant-design/icons';

// Import transparent bottle assets
import bannerVS1 from '../assets/banner_VS1.png';
import bannerVS2 from '../assets/banner_VS2.png';
import bannerVS3 from '../assets/banner_VS3.png';
import bannerVS4 from '../assets/banner_VS4.png';
import bannerVS5 from '../assets/banner_VS5.png';

import bannerSDJ1 from '../assets/banner_SDJ1.png';
import bannerSDJ2 from '../assets/banner_SDJ2.png';
import bannerSDJ3 from '../assets/banner_SDJ3.png';
import bannerSDJ4 from '../assets/banner_SDJ4.png';
import bannerSDJ5 from '../assets/banner_SDJ5.png';

const ComboPromoBanner = ({ onBannerClick }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isMk = i18n.language === 'mk';

  const handleClick = () => {
    if (onBannerClick) {
      onBannerClick();
    } else {
      navigate('/produktet?combo=vs_sdj');
    }
  };

  return (
    <div
      onClick={handleClick}
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
        
        {/* Left & Central Floating Bottle Cluster */}
        <div className="w-full lg:w-3/5 relative h-56 sm:h-64 md:h-72 flex items-center justify-center">
          
          {/* Bottle 1: Sol De Janeiro (Left Outer) */}
          <img
            src={bannerSDJ1}
            alt="Sol De Janeiro Mist"
            className="absolute left-[2%] sm:left-[5%] top-[10%] w-24 sm:w-28 md:w-32 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform duration-500 animate-float-slow"
            style={{ '--rot': '-14deg', zIndex: 10 }}
          />

          {/* Bottle 2: Victoria's Secret (Left Inner) */}
          <img
            src={bannerVS1}
            alt="Victoria's Secret Mist"
            className="absolute left-[20%] sm:left-[22%] top-[2%] w-26 sm:w-32 md:w-36 object-contain drop-shadow-[0_15px_30px_rgba(236,72,153,0.2)] group-hover:scale-110 transition-transform duration-500 animate-float-medium"
            style={{ '--rot': '12deg', animationDelay: '0.4s', zIndex: 20 }}
          />

          {/* Bottle 3: Sol De Janeiro Center Hero */}
          <img
            src={bannerSDJ3}
            alt="Sol De Janeiro Mist Hero"
            className="absolute left-[38%] sm:left-[40%] top-[15%] w-28 sm:w-36 md:w-40 object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform duration-500 animate-float-fast"
            style={{ '--rot': '-6deg', animationDelay: '0.8s', zIndex: 30 }}
          />

          {/* Bottle 4: Victoria's Secret Center Right */}
          <img
            src={bannerVS3}
            alt="Victoria's Secret Mist Center"
            className="absolute left-[56%] sm:left-[58%] top-[5%] w-26 sm:w-32 md:w-36 object-contain drop-shadow-[0_15px_28px_rgba(236,72,153,0.18)] group-hover:scale-105 transition-transform duration-500 animate-float-medium"
            style={{ '--rot': '15deg', animationDelay: '1.2s', zIndex: 25 }}
          />

          {/* Bottle 5: Sol De Janeiro Right Outer */}
          <img
            src={bannerSDJ5}
            alt="Sol De Janeiro Mist Right"
            className="absolute right-[2%] sm:right-[5%] top-[12%] w-24 sm:w-28 md:w-32 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform duration-500 animate-float-slow"
            style={{ '--rot': '-12deg', animationDelay: '0.6s', zIndex: 15 }}
          />

          {/* Small Floating Background Layer Accent Bottles */}
          <img
            src={bannerVS5}
            alt="VS Accent"
            className="absolute left-[32%] bottom-[5%] w-18 sm:w-22 opacity-80 object-contain drop-shadow-md animate-float-slow"
            style={{ '--rot': '25deg', animationDelay: '1.6s', zIndex: 5 }}
          />
          <img
            src={bannerSDJ2}
            alt="SDJ Accent"
            className="absolute right-[25%] bottom-[2%] w-18 sm:w-22 opacity-85 object-contain drop-shadow-md animate-float-medium"
            style={{ '--rot': '-20deg', animationDelay: '1.0s', zIndex: 6 }}
          />
        </div>

        {/* Right-Side Content (Clear Negative Space) */}
        <div className="w-full lg:w-2/5 flex flex-col justify-center text-left lg:pl-4">
          
          {/* Offer Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md shadow-pink-500/20 mb-3 self-start">
            <GiftOutlined className="text-sm" />
            {isMk ? 'СПЕЦИЈАЛНА ПОНУДА' : 'OFERTË SPECIALE BUNDLE'}
          </div>

          {/* Bold Promotional Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight font-serif mb-2 tracking-tight">
            {isMk ? (
              <>BUNDLE POFERTA: <span className="text-pink-600">VS + SDJ</span> за <span className="text-amber-500 underline decoration-pink-300">999 Den</span>!</>
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

            {/* Interactive CTA Button */}
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
