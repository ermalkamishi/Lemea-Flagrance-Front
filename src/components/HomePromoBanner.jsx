import React, { useRef } from 'react';
import { Carousel, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import {
  ArrowRightOutlined,
  LeftOutlined,
  RightOutlined,
  ShoppingOutlined,
  PlusOutlined,
  CheckCircleFilled
} from '@ant-design/icons';

// Slide 1 & 2 image assets
import promoImg1 from '../assets/promo-banner-image (1).jpg';
import promoImg2 from '../assets/promo-banner-image (2).jpg';

// Slide 3 Jet Set data
import { JET_SETS } from '../data/jetSetsData';

const HomePromoBanner = () => {
  const carouselRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const isMk = i18n.language === 'mk';

  const handleAddToCart = (item, e) => {
    if (e) e.stopPropagation();
    dispatch(
      addToCart({
        id: item.id,
        name: item.fullName,
        price: item.price,
        image: item.image,
        category: item.category,
        brand: item.brand,
        quantity: 1
      })
    );
    message.success({
      content: `${item.name} ${isMk ? 'е додаден во кошничката!' : 'u shtua në shportë!'}`,
      icon: <CheckCircleFilled className="text-emerald-500" />
    });
  };

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
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {/* Soft Gradient Scrim on Left for optimal text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/45 to-transparent w-full sm:w-[55%] pointer-events-none" />

              {/* Content Box - Constrained to Left Quadrant */}
              <div className="relative z-10 p-5 sm:p-8 lg:p-12 max-w-[280px] sm:max-w-[340px] lg:max-w-[390px] flex flex-col items-start">
                
                {/* Headline */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-serif leading-tight tracking-tight mb-2">
                  {isMk ? (
                    <>Victoria's Secret <br /><span className="text-pink-600 font-extrabold">3 Body Mists за 999 Ден</span></>
                  ) : (
                    <>Victoria's Secret <br /><span className="text-pink-600 font-extrabold">3 Body Mist për 999 Den</span></>
                  )}
                </h2>

                {/* Subtitle */}
                <p className="text-gray-700 font-medium text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
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
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-pink-600 text-white font-extrabold text-xs sm:text-sm px-5 sm:px-7 py-3 rounded-2xl shadow-xl shadow-slate-900/15 hover:shadow-pink-500/25 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
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
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {/* Soft Gradient Scrim on Left for optimal text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FAF5F1]/90 via-[#FAF5F1]/45 to-transparent w-full sm:w-[55%] pointer-events-none" />

              {/* Content Box - Constrained to Left Quadrant */}
              <div className="relative z-10 p-5 sm:p-8 lg:p-12 max-w-[280px] sm:max-w-[340px] lg:max-w-[390px] flex flex-col items-start">
                
                {/* Headline */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-serif leading-tight tracking-tight mb-2">
                  {isMk ? (
                    <>VS + Sol De Janeiro <br /><span className="text-amber-500 font-extrabold">Комбо за 999 Ден!</span></>
                  ) : (
                    <>VS + Sol De Janeiro <br /><span className="text-amber-500 font-extrabold">Combo për 999 Den!</span></>
                  )}
                </h2>

                {/* Subtitle */}
                <p className="text-gray-700 font-medium text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
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
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-amber-500 text-white font-extrabold text-xs sm:text-sm px-5 sm:px-6 py-3 rounded-2xl shadow-xl shadow-slate-900/15 hover:shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    <span>{isMk ? 'Види ги комбинациите' : 'Zbulo Kombinimet'}</span>
                    <ArrowRightOutlined className="text-xs transition-transform group-hover:translate-x-1" />
                  </button>

                  <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-pink-200 text-xs font-bold text-pink-600 shadow-sm">
                    {isMk ? '-199 Ден' : '-199 Den'}
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════
              SLIDE 3: 4 Sol De Janeiro Jet Sets
          ════════════════════════════════════════════════════════ */}
          <div className="outline-none">
            <div className="relative w-full h-[360px] sm:h-[400px] md:h-[430px] lg:h-[455px] bg-gradient-to-br from-[#FAF7F2] via-[#F6F1EA] to-[#ECE3D4] p-3.5 sm:p-5 lg:p-6 flex flex-col justify-between overflow-hidden">
              
              {/* Soft decorative background glow blobs */}
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl pointer-events-none" />

              {/* Header Row: Title & Action Button */}
              <div className="relative z-10 flex flex-row items-center justify-between gap-3 mb-2 sm:mb-3">
                <div>
                  <h3 className="text-base sm:text-xl lg:text-2xl font-black text-slate-900 font-serif tracking-tight leading-tight">
                    {isMk ? 'Иконски патувачки сетови 3-во-1' : 'Sete Udhëtimi Ikonike 3-në-1'}
                  </h3>
                  <p className="text-gray-600 text-[11px] sm:text-xs mt-0.5 hidden sm:block">
                    {isMk
                      ? 'Body Mist (30ml) + Krem Trupi (50ml) + Xhel Dushi (90ml)'
                      : 'Body Mist (30ml) + Krem Trupi (50ml) + Xhel Dushi (90ml)'}
                  </p>
                </div>

                {/* Main CTA Button to Sets Category */}
                <button
                  type="button"
                  onClick={() => navigate('/produktet?category=Sete')}
                  className="inline-flex items-center gap-1.5 sm:gap-2 bg-slate-900 hover:bg-pink-600 text-white font-extrabold text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-md hover:shadow-pink-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span>{isMk ? 'Сите сетови' : 'Shiko Setet'}</span>
                  <ArrowRightOutlined className="text-xs" />
                </button>
              </div>

              {/* 4 Product Cards Grid - Bigger Cards & Full-Width Images */}
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4 pb-2">
                {JET_SETS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/produktet/${item.id}`)}
                    style={{ '--hover-glow': item.glowColor }}
                    className="group/card bg-white hover:bg-white rounded-2xl overflow-hidden border border-amber-100/80 hover:border-pink-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                  >
                    {/* Card Image Container - Fills the entire width of the card */}
                    <div className="relative w-full h-28 sm:h-36 md:h-40 lg:h-48 overflow-hidden bg-[#FAF7F2]">
                      <img
                        src={item.image}
                        alt={item.fullName}
                        className="w-full h-full object-cover object-bottom group-hover/card:scale-105 transition-transform duration-500"
                      />
                      {/* Scent Number Tag */}
                      <span className={`absolute top-2 left-2 ${item.badgeBg} text-white font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-md backdrop-blur-sm`}>
                        {item.scentName}
                      </span>
                    </div>

                    {/* Card Details */}
                    <div className="p-2.5 sm:p-3 lg:p-3.5 flex flex-col justify-between flex-1">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm lg:text-[15px] truncate group-hover/card:text-pink-600 transition-colors">
                          {isMk ? item.nameMk : item.name}
                        </h4>
                        
                        {/* Scent Notes */}
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">
                          {isMk ? item.notesMk : item.notesSq}
                        </p>
                      </div>

                      {/* Price & Add button row */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-slate-900 font-black text-xs sm:text-sm lg:text-[15px]">
                            {item.price.toLocaleString()} Den
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                            {item.oldPrice.toLocaleString()}
                          </span>
                        </div>

                        {/* Quick Add Button */}
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(item, e)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-pink-500 text-slate-700 hover:text-white flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer shadow-sm"
                          title={isMk ? 'Додај во кошничка' : 'Shto në shportë'}
                        >
                          <PlusOutlined className="text-xs" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
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
