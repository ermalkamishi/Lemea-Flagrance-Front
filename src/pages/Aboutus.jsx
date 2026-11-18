import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  HeartOutlined,
  StarOutlined,
  WalletOutlined,
  SmileOutlined,
  SafetyCertificateFilled,
  CarFilled,
  ArrowRightOutlined,
  SearchOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CarOutlined,
  CustomerServiceOutlined,
  GiftOutlined,
  InstagramOutlined,
  TikTokOutlined,
  FacebookOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SOCIAL } from '../config/social';

// Lemea infographic bottle images (hero slider)
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
  bottle1, bottle2, bottle3, bottle4, bottle5, bottle6,
  bottle7, bottle8, bottle9, bottle10, bottle11, bottle12,
];

/** Counts from 0 to `target` once the element scrolls into view. */
function CountUp({ target, suffix = '' }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || !target) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let frame;
    const run = () => {
      if (reduce) {
        setValue(target);
        return;
      }
      const start = performance.now();
      const duration = 1200;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        setValue(Math.round(target * (1 - Math.pow(1 - p, 3)))); // ease-out
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target]);

  return <span ref={ref}>{value}{suffix}</span>;
}

const Aboutus = () => {
  const { t } = useTranslation();
  const [currentBottle, setCurrentBottle] = useState(0);
  const allProducts = useSelector((state) => state.products.items);

  // Hero slider: next bottle every 1.8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBottle((prev) => (prev + 1) % BOTTLE_IMAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Real numbers from the live catalogue
  const { productCount, brands, categoryCount } = useMemo(() => {
    const list = Array.isArray(allProducts) ? allProducts : [];
    const brandMap = new Map();
    for (const p of list) {
      const name = (p.brand || '').trim();
      if (name) brandMap.set(name, (brandMap.get(name) || 0) + 1);
    }
    return {
      productCount: list.length,
      brands: [...brandMap.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      categoryCount: new Set(list.map((p) => p.category).filter(Boolean)).size,
    };
  }, [allProducts]);

  const stats = [
    { value: productCount, suffix: '+', label: t('about.stat_products') },
    { value: brands.length, label: t('about.stat_brands') },
    { value: categoryCount, label: t('about.stat_categories') },
    { value: 2, label: t('about.stat_countries') },
  ];

  const values = [
    { icon: <HeartOutlined />, title: t('about.values.passion_title'), desc: t('about.values.passion_desc'), tint: 'from-pink-500 to-rose-500' },
    { icon: <StarOutlined />, title: t('about.values.quality_title'), desc: t('about.values.quality_desc'), tint: 'from-amber-400 to-orange-500' },
    { icon: <WalletOutlined />, title: t('about.values.security_title'), desc: t('about.values.security_desc'), tint: 'from-emerald-400 to-teal-500' },
    { icon: <SmileOutlined />, title: t('about.values.happy_title'), desc: t('about.values.happy_desc'), tint: 'from-violet-500 to-fuchsia-500' },
  ];

  const steps = [
    { icon: <SearchOutlined />, title: t('about.step1_title'), desc: t('about.step1_desc') },
    { icon: <ShoppingOutlined />, title: t('about.step2_title'), desc: t('about.step2_desc') },
    { icon: <DollarOutlined />, title: t('about.step3_title'), desc: t('about.step3_desc') },
  ];

  const promises = [
    { icon: <CarOutlined />, text: t('about.list_1') },
    { icon: <CustomerServiceOutlined />, text: t('about.list_2') },
    { icon: <GiftOutlined />, text: t('about.list_3') },
  ];

  const socials = [
    { key: 'instagram', icon: <InstagramOutlined />, url: SOCIAL.instagram.url, label: 'Instagram' },
    { key: 'tiktok', icon: <TikTokOutlined />, url: SOCIAL.tiktok.url, label: 'TikTok' },
    { key: 'facebook', icon: <FacebookOutlined />, url: SOCIAL.facebook.url, label: 'Facebook' },
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

      <div className="bg-slate-50 min-h-screen font-sans overflow-x-hidden">

        {/* 1. HERO — story + animated bottle slider */}
        <section className="relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-40 -right-24 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-12 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 leading-[1.1] mb-5">
                {t('about.title')}
              </h1>
              <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                {t('about.subtitle')}
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link
                  to="/produktet"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-pink-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5"
                  style={{ color: '#fff' }}
                >
                  {t('about.cta_shop')} <ArrowRightOutlined />
                </Link>
                <Link
                  to="/kontakti"
                  className="inline-flex items-center gap-2 bg-white hover:bg-pink-50 text-slate-900 font-bold px-6 py-3.5 rounded-2xl border border-gray-200 hover:border-pink-200 transition-colors"
                  style={{ color: '#0f172a' }}
                >
                  {t('about.cta_contact')}
                </Link>
              </div>
            </div>

            {/* Slider card with floating trust badges */}
            <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-[#FEFFFA] shadow-[0_30px_60px_-15px_rgba(236,72,153,0.25)] border border-white">
                {BOTTLE_IMAGES.map((img, idx) => {
                  const isActive = idx === currentBottle;
                  const isPrev = idx === (currentBottle - 1 + BOTTLE_IMAGES.length) % BOTTLE_IMAGES.length;
                  let stateClasses;
                  if (isActive) {
                    stateClasses = 'opacity-100 translate-x-0 z-10 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]';
                  } else if (isPrev) {
                    stateClasses = 'opacity-0 -translate-x-full z-0 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none';
                  } else {
                    stateClasses = 'opacity-0 translate-x-full z-0 transition-none pointer-events-none';
                  }
                  return (
                    <div key={idx} className={`absolute inset-0 flex items-center justify-center ${stateClasses}`}>
                      <img
                        src={img}
                        alt={`Lemea Flagrance ${idx + 1}`}
                        className="w-full h-full object-contain select-none"
                        loading={idx < 2 ? 'eager' : 'lazy'}
                      />
                    </div>
                  );
                })}
              </div>

              
            </div>
          </div>
        </section>

       

        {/* 3. VALUES */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 text-center mb-10">{t('about.values_title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <div
                key={v.title}
                className="group relative bg-white p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-pink-100 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${v.tint} scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500`}></div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.tint} text-white text-2xl flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                  {v.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. HOW IT WORKS */}
        <section className="bg-white border-y border-gray-100 py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 text-center mb-12">{t('about.steps_title')}</h2>
            <ol className="relative grid md:grid-cols-3 gap-10 md:gap-6">
              {/* connecting line (desktop) */}
              <div className="hidden md:block absolute top-8 left-[16.6%] right-[16.6%] h-0.5 bg-gradient-to-r from-pink-200 via-rose-300 to-amber-200"></div>
              {steps.map((s, i) => (
                <li key={s.title} className="relative text-center px-4">
                  <div className="relative mx-auto w-16 h-16 rounded-full bg-white border-2 border-pink-200 text-pink-500 text-2xl flex items-center justify-center shadow-md mb-5">
                    {s.icon}
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">{s.title}</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 5. BRANDS — clickable infinite marquee */}
        {brands.length > 0 && (
          <section className="py-16 md:py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">{t('about.brands_title')}</h2>
              <p className="text-gray-500 text-sm">{t('about.brands_hint')}</p>
            </div>
            <div className="marquee-pause relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div className="flex w-max gap-4 animate-marquee py-2">
                {[...brands, ...brands].map((b, i) => (
                  <Link
                    key={`${b.name}-${i}`}
                    to={`/produktet?brand=${encodeURIComponent(b.name)}`}
                    aria-hidden={i >= brands.length ? 'true' : undefined}
                    tabIndex={i >= brands.length ? -1 : undefined}
                    className="shrink-0 bg-white border border-gray-100 hover:border-pink-300 rounded-2xl px-6 py-4 shadow-sm hover:shadow-lg hover:shadow-pink-100 transition-all duration-300 hover:-translate-y-1 group"
                    style={{ color: 'inherit' }}
                  >
                    <span className="block font-serif text-xl font-bold text-slate-900 group-hover:text-pink-600 transition-colors whitespace-nowrap">{b.name}</span>
                    <span className="block text-xs font-semibold text-gray-400">{b.count} {t('about.products_count')}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 6. CARE FOR DETAIL */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
          <div className="grid md:grid-cols-2 gap-8 items-center bg-[#FEFFFA] rounded-[2.5rem] p-6 sm:p-10 md:p-12 border border-amber-100/50 shadow-sm">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-900 mb-4">{t('about.detail_title')}</h2>
              <p className="text-gray-600 leading-relaxed">{t('about.detail_desc')}</p>
            </div>
            <ul className="space-y-3">
              {promises.map((p) => (
                <li key={p.text} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-pink-200 transition-colors">
                  <span className="w-11 h-11 shrink-0 rounded-xl bg-pink-50 text-pink-500 text-xl flex items-center justify-center">{p.icon}</span>
                  <span className="font-semibold text-slate-800">{p.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 7. FINAL CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-pink-900 px-6 py-12 sm:px-12 sm:py-14 text-center text-white">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
            <h2 className="relative text-3xl md:text-4xl font-serif font-bold mb-3">{t('about.cta_title')}</h2>
            <p className="relative text-slate-300 max-w-xl mx-auto mb-8">{t('about.cta_desc')}</p>
            <div className="relative flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/produktet"
                className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-400 font-bold px-6 py-3.5 rounded-2xl transition-all hover:shadow-lg hover:shadow-pink-500/40 hover:-translate-y-0.5"
                style={{ color: '#fff' }}
              >
                {t('about.cta_shop')} <ArrowRightOutlined />
              </Link>
              <span className="hidden sm:inline text-slate-400 text-sm font-semibold mx-2">{t('about.follow')}</span>
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-pink-600 border border-white/15 flex items-center justify-center text-xl transition-all hover:-translate-y-0.5"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Aboutus;
