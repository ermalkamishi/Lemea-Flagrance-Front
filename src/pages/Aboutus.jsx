import React, { useState, useEffect } from 'react';
import {
  HeartOutlined,
  StarOutlined,
  SafetyCertificateOutlined,
  SmileOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

// 12 Victoria's Secret & Lemea Infographic Bottle Images
import bottle1 from '../assets/Lemea_Bottle (1).jpg';
import bottle2 from '../assets/Lemea_Bottle (2).jpg';
import bottle3 from '../assets/Lemea_Bottle (3).jpg';
import bottle4 from '../assets/Lemea_Bottle (4).jpg';
import bottle5 from '../assets/Lemea_Bottle (5).jpg';
import bottle6 from '../assets/Lemea_Bottle (6).jpg';
import bottle7 from '../assets/Lemea_Bottle (7).jpg';
import bottle8 from '../assets/Lemea_Bottle (8).jpg';
import bottle9 from '../assets/Lemea_Bottle (9).jpg';
import bottle10 from '../assets/Lemea_Bottle (10).jpg';
import bottle11 from '../assets/Lemea_Bottle (11).jpg';
import bottle12 from '../assets/Lemea_Bottle (12).jpg';

const BOTTLE_IMAGES = [
  bottle1,
  bottle2,
  bottle3,
  bottle4,
  bottle5,
  bottle6,
  bottle7,
  bottle8,
  bottle9,
  bottle10,
  bottle11,
  bottle12
];

const Aboutus = () => {
  const { t } = useTranslation();
  const [currentBottle, setCurrentBottle] = useState(0);

  // Auto-play sliding and fading to the left continuously every 1.8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBottle((prev) => (prev + 1) % BOTTLE_IMAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const values = [
    { icon: <HeartOutlined />, title: t('about.values.passion_title'), desc: t('about.values.passion_desc') },
    { icon: <StarOutlined />, title: t('about.values.quality_title'), desc: t('about.values.quality_desc') },
    { icon: <SafetyCertificateOutlined />, title: t('about.values.security_title'), desc: t('about.values.security_desc') },
    { icon: <SmileOutlined />, title: t('about.values.happy_title'), desc: t('about.values.happy_desc') }
  ];

  return (
    <>
      <Helmet>
        <title>Rreth Nesh | Lemea Flagrance</title>
        <meta name="description" content="Mëso më shumë rreth Lemea Flagrance — misioni ynë, vlerat tona dhe angazhimi ynë ndaj cilësisë dhe autenticitetit të parfumeve." />
        <meta property="og:title" content="Rreth Nesh | Lemea Flagrance" />
        <meta property="og:description" content="Mëso më shumë rreth Lemea Flagrance — misioni ynë, vlerat tona dhe angazhimi ynë ndaj cilësisë dhe autenticitetit." />
        <meta property="og:url" content="https://lemeaflagrance.shop/rreth-nesh" />
        <link rel="canonical" href="https://lemeaflagrance.shop/rreth-nesh" />
      </Helmet>

      <div className="bg-slate-50 min-h-screen py-16 px-4">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center mb-16 md:mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-800 mb-4 md:mb-6">{t('about.title')}</h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed px-4">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Grid i Vlerave */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {values.map((v, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-pink-100 shadow-sm hover:shadow-xl hover:shadow-pink-100 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl text-pink-500 mb-4">{v.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{v.title}</h3>
              <p className="text-gray-500 text-sm">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Seksioni i Dyfishtë (Foto + Tekst) - Card background perfectly matches the bottle images */}
        <div className="max-w-6xl mx-auto bg-[#FEFFFA] rounded-[3rem] overflow-hidden shadow-sm flex flex-col md:flex-row items-stretch border border-amber-100/30 mb-20">
          <div className="md:w-1/2 p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-800 mb-6">{t('about.detail_title')}</h2>
            <p className="text-gray-600 mb-6 leading-relaxed text-base">
              {t('about.detail_desc')}
            </p>
            <ul className="space-y-3 text-gray-700 text-base">
              <li>✓ {t('about.list_1')}</li>
              <li>✓ {t('about.list_2')}</li>
              <li>✓ {t('about.list_3')}</li>
            </ul>
          </div>

          {/* Right Column: Seamless Full-Half Animated Bottle Slides */}
          <div className="md:w-1/2 w-full aspect-[1568/2744] md:aspect-auto md:h-auto md:min-h-[36rem] bg-[#FEFFFA] relative overflow-hidden flex items-center justify-center">
            <div className="relative w-full h-full">
              {BOTTLE_IMAGES.map((img, idx) => {
                const isActive = idx === currentBottle;
                const isPrev = idx === (currentBottle - 1 + BOTTLE_IMAGES.length) % BOTTLE_IMAGES.length;

                let stateClasses = '';
                if (isActive) {
                  // Active slide: centered, fully visible
                  stateClasses = 'opacity-100 translate-x-0 z-10 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]';
                } else if (isPrev) {
                  // Outgoing slide: smoothly slides and fades out to the LEFT
                  stateClasses = 'opacity-0 -translate-x-full z-0 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none';
                } else {
                  // Incoming slides waiting on the RIGHT: instant reset without animation
                  stateClasses = 'opacity-0 translate-x-full z-0 transition-none pointer-events-none';
                }

                return (
                  <div
                    key={idx}
                    className={`absolute inset-0 flex items-center justify-center ${stateClasses}`}
                  >
                    <img
                      src={img}
                      alt={`Victoria's Secret Fragrance ${idx + 1}`}
                      className="w-full h-full object-cover md:object-contain select-none"
                      loading={idx < 2 ? 'eager' : 'lazy'}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Aboutus;
