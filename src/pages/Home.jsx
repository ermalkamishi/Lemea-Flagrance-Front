import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import PromoBanner from '../components/PromoBanner';
import { useNavigate } from 'react-router-dom';
import { Carousel, Alert, Rate } from 'antd';
import { ClockCircleOutlined, SafetyCertificateOutlined, CarOutlined, CustomerServiceOutlined, SyncOutlined, ArrowRightOutlined, ShoppingCartOutlined, GiftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addToCart } from '../redux/cartSlice';
import { getImageUrl } from '../utils/imageUtils';
import { toNumber } from '../utils/numberUtils';
import { message } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import './Home.css';
import { getApiBaseUrl } from '../utils/apiBase';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const allProducts = useSelector(state => state.products.items) || [];
  const productsStatus = useSelector((state) => state.products.status);
  const productsError = useSelector((state) => state.products.error);

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    if (!product) return;

    const priceValue = typeof product.price === 'string'
      ? parseFloat(product.price.replace(/[^\d.]/g, ''))
      : product.price;

    dispatch(addToCart({ ...product, price: priceValue, quantity: 1 }));
    message.success({
      content: `${product.name} ${t('cart.added_msg')}`,
      className: 'mt-20',
      icon: <CheckCircleFilled className="text-emerald-500" />
    });
  };

  const handleProductClick = (productId, e) => {
    if (e) e.stopPropagation();
    if (!productId) return;
    navigate(`/produktet/${productId}`);
  };

  // Find real products for hero slides based on names or pick first ones
  const findProductByName = (name) => allProducts.find(p => p.name.toLowerCase().includes(name.toLowerCase()));

  const dealOfTheDayProduct = allProducts.find(p => p.oldPrice && p.price < p.oldPrice) || allProducts.find(p => p.isPopular) || allProducts[0];

  const heroSlides = [
    {
      id: 1,
      tag: t('hero.tag'),
      title1: 'Lattafa Khamrah',
      title2: t('home.hero_slides.slide1_title2'),
      title2Color: 'text-yellow-300',
      desc: t('home.hero_slides.slide1_desc'),
      btnText: t('hero.btn'),
      btnColor: 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300 shadow-yellow-400/20',
      bgGradient: 'from-amber-700 via-orange-600 to-amber-500',
      featuredProductNames: ['Khamrah', 'Asad', 'Yara']
    },
    {
      id: 2,
      tag: t('common.limited_edition', 'Ofertë Limituar'),
      title1: t('home.hero_slides.offer_title1', '3 Body Mist'),
      title2: t('home.hero_slides.offer_title2', 'Për vetëm 999 Den'),
      title2Color: 'text-yellow-300',
      desc: t('home.hero_slides.offer_desc', 'Zgjidh 3 Body Mist-et tuaja të preferuara Victoria Secret dhe pëfito çmimin special. Kombino aromën tënde sot!'),
      btnText: t('hero.view_all', 'Shiko të Gjitha'),
      btnColor: 'bg-white text-pink-600 hover:bg-pink-50 shadow-white/20',
      bgGradient: 'from-pink-600 via-rose-500 to-orange-400',
      featuredProductNames: ['Pure Seduction', 'Love Spell', 'Aqua Kiss']
    },
    {
      id: 3,
      tag: t('home.hero_slides.slide3_tag'),
      title1: t('home.hero_slides.slide3_title1'),
      title2: t('home.hero_slides.slide3_title2'),
      title2Color: 'text-orange-200',
      desc: t('home.hero_slides.slide3_desc'),
      btnText: t('home.hero_slides.slide3_btn'),
      btnColor: 'bg-orange-500 text-white hover:bg-orange-400 shadow-orange-500/20',
      bgGradient: 'from-rose-700 via-pink-600 to-orange-400',
      featuredProductNames: ['Amber Romance', 'Fakhar']
    }
  ];

  const [activeCategory, setActiveCategory] = useState('');
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 10, seconds: 19 });
  const [categories, setCategories] = useState([]);
  const apiUrl = getApiBaseUrl();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await fetch(`${apiUrl}/categories`);
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
        // Only set default if nothing is selected yet
        if (categoriesData.length > 0 && !activeCategory) {
          const defaultCat = categoriesData.find(c => c.name === 'Parfume') || categoriesData[0];
          setActiveCategory(defaultCat.name);
        }
      } catch (e) {
        console.error('Error fetching data:', e);
      }
    };
    fetchData();
  }, [apiUrl]); // Removed activeCategory from here

  // This effect was causing the reset loop, so we remove the categories dependency
  useEffect(() => {
    // We only want to run this if the user changes language (t changes) 
    // and we already have categories, but we should be careful not to reset user selection.
    // For now, let's keep it simple and only set it if empty.
    if (categories.length > 0 && !activeCategory) {
      const defaultCat = categories.find(c => c.name === 'Parfume') || categories[0];
      setActiveCategory(defaultCat.name);
    }
  }, [t]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCategoryLabel = (catName) => {
    if (!catName) return '';
    const catObj = categories.find(c => c.name === catName);
    if (currentLang === 'mk' && catObj && catObj.name_mk) {
      return catObj.name_mk;
    }
    const keyMap = {
      'Parfume': 'perfumes',
      'Body Mist': 'body_spray',
      'Për meshkuj': 'men',
      'Rhode Lipgloss': 'lipgloss'
    };
    const key = keyMap[catName] || catName.toLowerCase().replace(/ /g, '_');
    const translated = t(`home.categories.${key}`);
    return translated !== `home.categories.${key}` ? translated : catName;
  };

  const categoryOptions = categories.map(c => c.name);
  const parfumeIndex = categoryOptions.indexOf('Parfume');
  if (parfumeIndex > 0) {
    categoryOptions.splice(parfumeIndex, 1);
    categoryOptions.unshift('Parfume');
  }

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => p.category === activeCategory && p.inStock && (p.stockQuantity > 0 || p.stockQuantity === undefined));
  }, [allProducts, activeCategory]);

  const topProducts = useMemo(() => {
    return allProducts
      .filter(p => p.inStock && (p.stockQuantity > 0 || p.stockQuantity === undefined))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 8);
  }, [allProducts]);

  const newProducts = useMemo(() => {
    return allProducts
      .filter(p => p.inStock && (p.stockQuantity > 0 || p.stockQuantity === undefined))
      .reverse()
      .slice(0, 4);
  }, [allProducts]);

  return (
    <>
      <Helmet>
        <title>Lemea Fragrance | Parfume &amp; Body Mist Origjinale</title>
        <meta name="description" content="Bli parfume dhe body mist origjinale Lattafa, Victoria Secret dhe më shumë. Dërrgesa e shpejtë në Maqedoni dhe Kosovë. Çmime të përballueshme." />
        <meta property="og:title" content="Lemea Fragrance | Parfume &amp; Body Mist Origjinale" />
        <meta property="og:description" content="Bli parfume dhe body mist origjinale Lattafa, Victoria Secret dhe më shumë. Dërrgesa e shpejtë në Maqedoni dhe Kosovë." />
        <meta property="og:url" content="https://www.lemeafragrance.shop/" />
        <link rel="canonical" href="https://www.lemeafragrance.shop/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "Lemea Fragrance",
          "url": "https://www.lemeafragrance.shop",
          "logo": "https://www.lemeafragrance.shop/og-image.jpg",
          "description": "Dyqan online i parfumeve dhe body mist origjinale. Lattafa, Victoria Secret dhe më shumë.",
          "email": "lemea.fragrance@gmail.com",
          "areaServed": [
            { "@type": "Country", "name": "North Macedonia" },
            { "@type": "Country", "name": "Kosovo" }
          ],
          "priceRange": "$$",
          "currenciesAccepted": "MKD",
          "paymentAccepted": "Cash",
          "sameAs": []
        })}</script>
      </Helmet>
    <div className="bg-slate-50 min-h-screen pb-20">
      {productsStatus === 'failed' && (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <Alert
            type="warning"
            showIcon
            message={t('common.products_load_error')}
            description={
              productsError ||
              t('common.backend_error_desc')
            }
            className="rounded-2xl border-amber-200"
          />
        </div>
      )}

      {/* Seksioni i Filtrave dhe Produkteve */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <h2 className="text-3xl font-serif font-bold text-gray-800 mb-6 text-center ">
          {t('hero.popular')}
        </h2>

        {/* Filtrat (Kategoritë) */}
        <div className="flex overflow-x-auto lg:flex-wrap lg:justify-center gap-3 mb-10 pb-4 lg:pb-0 custom-scrollbar snap-x">
          {categoryOptions.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border cursor-pointer snap-start ${activeCategory === category
                ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-200'
                : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:text-pink-500'
                }`}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>

        {/* Grid-i i Produkteve të Filtruara */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.slice(0, 8).map((product, index) => (
              <div
                key={product.id}
                onClick={(e) => handleProductClick(product.id, e)}
                className={`bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-xl hover:shadow-pink-100 transition-all duration-300 cursor-pointer group flex-col h-full ${
                  index >= 4 ? 'hidden md:flex' : 'flex'
                }`}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {(product.isPopular || product.rating >= 4.8) && (
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-pink-500 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                      {t('common.hot')}
                    </span>
                  )}
                </div>

                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
                      {getCategoryLabel(product.category)}
                    </span>
                    <h3 className="text-gray-800 font-semibold text-sm line-clamp-2 mb-2">
                      {currentLang === 'mk' && product.name_mk ? product.name_mk : product.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-pink-600 font-bold text-lg">
                      {toNumber(product.price, 0).toLocaleString()} {t('common.currency')}
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors duration-300 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-400">
              {t('home.no_products')}
            </div>
          )}
        </div>

        {/* Butoni Shiko Të Gjitha */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate(`/produktet?category=${encodeURIComponent(activeCategory)}`)}
            className="px-10 py-3 rounded-full border-2 border-pink-500 text-pink-500 font-bold hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-pink-200 active:scale-95 cursor-pointer"
          >
            {t('hero.view_all', 'Shiko Të Gjitha')}
          </button>
        </div>
      </div>

      {/* 1. SEKSIONI I BESUESHMËRISË */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <SafetyCertificateOutlined />, title: t('home.trust.secure_payment'), desc: t('home.trust.secure_desc') },
            { icon: <SyncOutlined />, title: t('home.trust.customer_protection'), desc: t('home.trust.protection_desc') },
            { icon: <CarOutlined />, title: t('home.trust.fast_shipping'), desc: t('home.trust.shipping_desc') },
            { icon: <CustomerServiceOutlined />, title: t('home.trust.support'), desc: t('home.trust.support_desc') }
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 flex-shrink-0 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center text-xl">
                {feature.icon}
              </div>
              <div>
                <h4 className="text-gray-800 font-bold text-sm">{feature.title}</h4>
                <p className="text-gray-500 text-xs mt-0.5">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROMO BANNER 5 DITË - Seksioni i dytë */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <PromoBanner />
      </div>

      {/* 2. BANERI "OFERTA E DITËS" */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-3xl shadow-lg border border-gray-100">
          <div className="w-full lg:w-[45%] bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-6 left-6 bg-white text-rose-600 font-extrabold px-3 py-1 rounded-full text-sm z-10 shadow-md">
              -{dealOfTheDayProduct?.oldPrice ? Math.round((1 - dealOfTheDayProduct.price / dealOfTheDayProduct.oldPrice) * 100) : '31'}%
            </div>
            <div className="z-10 flex flex-col items-center lg:items-start text-center lg:text-left h-full">
              <div className="flex items-center gap-2 text-yellow-300 font-bold text-sm mb-4 uppercase tracking-wider">
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-2 leading-tight">
                {(currentLang === 'mk' && dealOfTheDayProduct?.name_mk) ? dealOfTheDayProduct.name_mk : (dealOfTheDayProduct?.name || 'Lattafa Khamrah')} <br /> {getCategoryLabel(dealOfTheDayProduct?.category) || 'Eau de Parfum'}
              </h2>
              <div className="flex items-end justify-center lg:justify-start gap-3 my-4">
                <span className="text-4xl font-black text-white">
                  {dealOfTheDayProduct ? toNumber(dealOfTheDayProduct.price, 0).toLocaleString() : '1,800'} {t('common.currency')}
                </span>
                {dealOfTheDayProduct?.oldPrice && (
                  <span className="text-rose-200 line-through text-lg font-medium mb-1">{dealOfTheDayProduct.oldPrice.toLocaleString()} {t('common.currency')}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-white text-sm font-medium">{t('home.deal.ends_in')}</span>
                <div className="flex gap-2">
                  <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 text-white font-bold text-center min-w-[40px]">
                    {String(timeLeft.hours).padStart(2, '0')} <span className="text-[10px] block font-normal">{t('home.deal.hours')}</span>
                  </div>
                  <span className="text-white font-bold self-start mt-1">:</span>
                  <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 text-white font-bold text-center min-w-[40px]">
                    {String(timeLeft.minutes).padStart(2, '0')} <span className="text-[10px] block font-normal">{t('home.deal.minutes')}</span>
                  </div>
                  <span className="text-white font-bold self-start mt-1">:</span>
                  <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 text-white font-bold text-center min-w-[40px]">
                    {String(timeLeft.seconds).padStart(2, '0')} <span className="text-[10px] block font-normal">{t('home.deal.seconds')}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 w-full mt-auto">
                <button
                  onClick={(e) => handleAddToCart(dealOfTheDayProduct, e)}
                  className="flex-1 bg-white text-rose-600 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <ShoppingCartOutlined className="text-lg" /> {t('home.deal.add_to_cart')}
                </button>
                <button
                  onClick={(e) => handleProductClick(dealOfTheDayProduct?.id, e)}
                  className="flex-1 bg-rose-700/50 hover:bg-rose-700/70 text-white font-bold py-3 px-4 rounded-xl transition-colors backdrop-blur-md border border-rose-400/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {t('home.deal.view_details')} <ArrowRightOutlined />
                </button>
              </div>
            </div>
            {dealOfTheDayProduct && (
              <img
                src={getImageUrl(dealOfTheDayProduct.image)}
                alt={dealOfTheDayProduct.name}
                className="absolute right-[-20%] bottom-[-10%] w-2/3 opacity-40 lg:opacity-60 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700 pointer-events-none"
              />
            )}
          </div>
          <div className="w-full lg:w-[55%] grid grid-cols-2 md:grid-cols-3 gap-3">
            {allProducts.filter(p => p.oldPrice && p.id !== dealOfTheDayProduct?.id).slice(0, 6).map((item, idx) => (
              <div
                key={item.id}
                onClick={(e) => handleProductClick(item.id, e)}
                className="relative rounded-2xl overflow-hidden cursor-pointer group h-40 lg:h-full bg-gray-100"
              >
                <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 left-2 bg-white text-rose-500 font-extrabold px-2 py-0.5 rounded-md text-xs shadow-sm">
                  -{Math.round((1 - item.price / item.oldPrice) * 100)}%
                </div>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
              </div>
            ))}
            {/* Fallback if not enough discounted products */}
            {allProducts.filter(p => p.oldPrice && p.id !== dealOfTheDayProduct?.id).length < 6 &&
              allProducts.slice(0, 6 - allProducts.filter(p => p.oldPrice && p.id !== dealOfTheDayProduct?.id).length).map((item) => (
                <div
                  key={`extra-${item.id}`}
                  onClick={(e) => handleProductClick(item.id, e)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group h-40 lg:h-full bg-gray-100"
                >
                  <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* 3. SEKSIONI: TOP PRODUKTET */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800">
              {t('hero.top_picks')}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{t('products.subtitle')}</p>
          </div>
          <button
            onClick={() => navigate('/produktet')}
            className="hidden sm:flex items-center gap-1 text-pink-500 font-semibold hover:text-pink-600 transition-colors"
          >
            {t('hero.view_all')} <ArrowRightOutlined className="text-xs" />
          </button>
        </div>
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 custom-scrollbar snap-x">
          {topProducts.map((product) => (
            <div
              key={`top-${product.id}`}
              onClick={(e) => handleProductClick(product.id, e)}
              className="min-w-[220px] sm:min-w-[250px] bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-pink-100 transition-all duration-300 cursor-pointer snap-start flex flex-col group"
            >
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-gray-50">
                <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="mt-auto">
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider block mb-1">{getCategoryLabel(product.category)}</span>
                <h3 className="text-gray-800 font-semibold text-sm sm:text-base line-clamp-1 mb-1">{currentLang === 'mk' && product.name_mk ? product.name_mk : product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <Rate disabled defaultValue={toNumber(product.rating, 5)} allowHalf style={{ fontSize: 10 }} />
                  <span className="text-[10px] text-gray-400">({product.reviewsCount || 0})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-pink-600 font-bold text-lg">{toNumber(product.price, 0).toLocaleString()} {t('common.currency')}</span>
                  <div
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product, e); }}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors"
                  >
                    +
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        <div className="relative rounded-[40px] overflow-hidden shadow-2xl">
          <Carousel autoplay autoplaySpeed={4500} effect="scrollx" dotPosition="bottom">
            {heroSlides.map((slide) => (
              <div key={slide.id} className="outline-none">
                <div className={`w-full p-5 py-6 sm:p-6 sm:py-8 lg:p-12 bg-gradient-to-br ${slide.bgGradient} flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 min-h-[280px] sm:min-h-[320px] lg:min-h-[450px]`}>
                  <div className="w-full lg:w-1/2 z-10 flex flex-col items-start text-white">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 lg:px-4 lg:py-1.5 rounded-full mb-3 lg:mb-6">
                      <span className="text-[10px] sm:text-xs lg:text-sm font-bold tracking-wider uppercase text-white">{slide.tag}</span>
                    </div>
                    <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2 sm:mb-3 lg:mb-4 leading-tight">
                      {slide.title1} <br className="hidden sm:block" />
                      <span className={`${slide.title2Color} block sm:inline mt-1 sm:mt-0`}>{slide.title2}</span>
                    </h1>
                    <p className="text-xs sm:text-sm lg:text-lg text-white/90 mb-4 sm:mb-6 lg:mb-8 max-w-md leading-relaxed">{slide.desc}</p>
                    <button
                      onClick={() => navigate('/produktet')}
                      className={`${slide.btnColor} font-bold text-sm sm:text-base lg:text-lg px-5 py-2.5 sm:px-6 sm:py-3 lg:px-8 lg:py-3 rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto text-center cursor-pointer`}
                    >
                      {slide.btnText}
                    </button>
                  </div>
                  <div className="hidden lg:flex w-full lg:w-1/2 z-10 gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                    {slide.featuredProductNames.map((name) => {
                      const product = findProductByName(name) || allProducts[Math.floor(Math.random() * allProducts.length)];
                      if (!product) return null;
                      return (
                        <div
                          key={product.id}
                          onClick={(e) => handleProductClick(product.id, e)}
                          className="min-w-[180px] w-[180px] flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-300 cursor-pointer snap-start group hover:-translate-y-2 hover:shadow-xl"
                        >
                          <div className="h-40 overflow-hidden bg-black/10">
                            <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="p-4 flex flex-col justify-between">
                            <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                            <div>
                              {slide.id === 2 ? (
                                <span className="text-yellow-300 font-bold text-md">333 {t('common.currency')} <span className="text-[10px] opacity-80">(Ofertë)</span></span>
                              ) : (
                                <>
                                  {product.oldPrice && <span className="text-white/60 line-through text-xs mr-2">{toNumber(product.oldPrice, 0).toLocaleString()} {t('common.currency')}</span>}
                                  <span className="text-white font-bold text-md">{toNumber(product.price, 0).toLocaleString()} {t('common.currency')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      {/* 4. SEKSIONI: KOLEKSIONI I RI */}
      <div className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-3">
              {t('home.new_collection.title')}
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              {t('home.new_collection.desc')}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {newProducts.map((product) => (
              <div
                key={`new-${product.id}`}
                onClick={(e) => handleProductClick(product.id, e)}
                className="bg-slate-50 rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                  <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <span className="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                    {t('home.new_collection.badge')}
                  </span>
                </div>
                <h3 className="text-gray-800 font-semibold text-sm text-center line-clamp-1">{currentLang === 'mk' && product.name_mk ? product.name_mk : product.name}</h3>
                <p className="text-gray-500 text-center text-sm font-medium mt-1">{toNumber(product.price, 0).toLocaleString()} {t('common.currency')}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/produktet')}
              className="bg-white border-2 border-pink-500 text-pink-600 font-bold text-base px-8 py-3 rounded-full hover:bg-pink-500 hover:text-white transition-colors duration-300 shadow-sm cursor-pointer"
            >
              {t('hero.view_all')}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Home;
