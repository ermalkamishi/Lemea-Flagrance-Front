import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import PromoBanner from '../components/PromoBanner';
import HomePromoBanner from '../components/HomePromoBanner';
import { useNavigate } from 'react-router-dom';
import ProductLink from '../components/ProductLink';
import { Carousel, Alert, Rate } from 'antd';
import { ClockCircleOutlined, SafetyCertificateOutlined, CarOutlined, CustomerServiceOutlined, SyncOutlined, ArrowRightOutlined, ShoppingCartOutlined, GiftOutlined, FireOutlined } from '@ant-design/icons';
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

  // Real discount numbers (no fake countdown)
  const discountPct = (p) => {
    const price = toNumber(p?.price, 0);
    const oldPrice = toNumber(p?.oldPrice, 0);
    return oldPrice > price && price > 0 ? Math.round((1 - price / oldPrice) * 100) : 0;
  };
  const dealDiscount = discountPct(dealOfTheDayProduct);
  const dealSavings = dealDiscount > 0
    ? toNumber(dealOfTheDayProduct.oldPrice, 0) - toNumber(dealOfTheDayProduct.price, 0)
    : 0;
  // Other discounted products first, then fill with popular/other products (max 10)
  const otherDeals = (() => {
    const rest = allProducts.filter((p) => p.id !== dealOfTheDayProduct?.id);
    const discounted = rest.filter((p) => discountPct(p) > 0);
    const fill = rest.filter((p) => discountPct(p) === 0);
    return [...discounted, ...fill].slice(0, 10);
  })();

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
      'Për Meshkuj': 'men',
      'Rhode Lipgloss': 'lipgloss',
      'Rhode Blush': 'blush',
      'Sete': 'sets',
      'Sets': 'sets'
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
        <title>Lemea Flagrance | Parfume origjinale në Maqedoni &amp; Kosovë</title>
        <meta
          name="description"
          content="Bleni parfume origjinale online në Lemea Flagrance. Porositni linjat më të njohura si Lattafa dhe French Avenue me dërgesë në Maqedoni dhe Kosovë."
        />
        <meta property="og:title" content="Lemea Flagrance | Parfume origjinale në Maqedoni &amp; Kosovë" />
        <meta
          property="og:description"
          content="Bleni parfume origjinale online në Lemea Flagrance. Porositni linjat më të njohura si Lattafa dhe French Avenue me dërgesë në Maqedoni dhe Kosovë."
        />
        <meta property="og:url" content="https://lemeaflagrance.shop/" />
        <meta property="og:image" content="https://lemeaflagrance.shop/logo.png" />
        <meta name="twitter:title" content="Lemea Flagrance | Parfume origjinale në Maqedoni &amp; Kosovë" />
        <meta
          name="twitter:description"
          content="Bleni parfume origjinale online në Lemea Flagrance. Porositni linjat më të njohura si Lattafa dhe French Avenue me dërgesë në Maqedoni dhe Kosovë."
        />
        <meta name="twitter:image" content="https://lemeaflagrance.shop/logo.png" />
        <link rel="canonical" href="https://lemeaflagrance.shop/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Lemea Flagrance",
          "url": "https://lemeaflagrance.shop",
          "logo": "https://lemeaflagrance.shop/logo.png",
          "sameAs": [
            "https://www.instagram.com/lemea.flagrance",
            "https://www.tiktok.com/@lemea.flagrance",
            "https://www.facebook.com/profile.php?id=61575000181053"
          ]
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
                      <ProductLink id={product.id}>{currentLang === 'mk' && product.name_mk ? product.name_mk : product.name}</ProductLink>
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

      {/* BANERI I RI PROMOCIONAL - Ndërmjet seksionit 1 dhe 2 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-2">
        <HomePromoBanner />
      </div>

      {/* 1. SEKSIONI I BESUESHMËRISË */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
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

      {/* 2. BANERI "OFERTA E DITËS" — kompakt: karta e ofertës + rresht me oferta të tjera */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex flex-col lg:flex-row gap-4 bg-white p-3 sm:p-4 rounded-3xl shadow-lg border border-gray-100">

          {/* Karta kryesore e ofertës */}
          {dealOfTheDayProduct && (
            <div
              onClick={(e) => handleProductClick(dealOfTheDayProduct.id, e)}
              className="w-full lg:w-[42%] shrink-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-5 sm:p-6 flex gap-4 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col min-w-0 flex-1">
                
                <h2 className="text-xl sm:text-2xl lg:text-[1.65rem] font-extrabold text-white leading-tight line-clamp-2">
                  <ProductLink id={dealOfTheDayProduct.id}>
                    {(currentLang === 'mk' && dealOfTheDayProduct.name_mk) ? dealOfTheDayProduct.name_mk : dealOfTheDayProduct.name}
                  </ProductLink>
                </h2>
                <p className="text-rose-100 text-sm font-medium mt-1">{getCategoryLabel(dealOfTheDayProduct.category)}</p>

                <div className="flex items-end flex-wrap gap-x-3 gap-y-1 mt-3">
                  <span className="text-3xl font-black text-white">
                    {toNumber(dealOfTheDayProduct.price, 0).toLocaleString()} {t('common.currency')}
                  </span>
                  {dealDiscount > 0 && (
                    <span className="text-rose-200 line-through text-base font-semibold mb-1">
                      {toNumber(dealOfTheDayProduct.oldPrice, 0).toLocaleString()} {t('common.currency')}
                    </span>
                  )}
                </div>

                {dealDiscount > 0 && (
                  <div className="inline-flex items-center gap-2 self-start mt-2 bg-white text-rose-600 font-extrabold text-sm px-3 py-1 rounded-lg shadow-sm">
                    -{dealDiscount}% · {t('home.deal.save')} {dealSavings.toLocaleString()} {t('common.currency')}
                  </div>
                )}

                <div className="flex gap-2 mt-auto pt-5">
                  <button
                    onClick={(e) => handleAddToCart(dealOfTheDayProduct, e)}
                    className="flex-1 bg-white text-rose-600 font-bold py-2.5 px-3 rounded-xl hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer text-sm sm:text-base"
                  >
                    <ShoppingCartOutlined className="text-lg" /> {t('home.deal.add_to_cart')}
                  </button>
                  <button
                    onClick={(e) => handleProductClick(dealOfTheDayProduct.id, e)}
                    aria-label={t('home.deal.view_details')}
                    className="bg-rose-700/40 hover:bg-rose-700/60 text-white font-bold py-2.5 px-4 rounded-xl transition-colors border border-rose-300/30 flex items-center justify-center cursor-pointer"
                  >
                    <ArrowRightOutlined />
                  </button>
                </div>
              </div>

              <div className="relative z-10 w-[38%] sm:w-[40%] shrink-0 self-center">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-white shadow-xl ring-4 ring-white/20">
                  <img
                    src={getImageUrl(dealOfTheDayProduct.image)}
                    alt={dealOfTheDayProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Oferta të tjera — një rresht që rrëshqet anash */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center justify-between px-1 pb-2">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t('home.deal.more_deals')}</h3>
              <button
                onClick={() => navigate('/produktet')}
                className="text-sm font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
              >
                {t('home.deal.see_all')} <ArrowRightOutlined className="text-xs" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 custom-scrollbar flex-1">
              {otherDeals.map((item) => {
                const pct = discountPct(item);
                return (
                  <div
                    key={item.id}
                    onClick={(e) => handleProductClick(item.id, e)}
                    className="snap-start shrink-0 w-[42%] sm:w-[30%] lg:w-[calc((100%-1.5rem)/3)] bg-gray-50 rounded-2xl overflow-hidden cursor-pointer group border border-gray-100 hover:shadow-lg hover:shadow-pink-100 transition-shadow flex flex-col"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {pct > 0 && (
                        <span className="absolute top-2 left-2 bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-md text-xs shadow-sm">
                          -{pct}%
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 sm:p-3">
                      <h4 className="text-gray-800 font-semibold text-xs sm:text-sm line-clamp-1">
                        <ProductLink id={item.id}>
                          {currentLang === 'mk' && item.name_mk ? item.name_mk : item.name}
                        </ProductLink>
                      </h4>
                      <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                        <span className="text-rose-600 font-extrabold text-sm">
                          {toNumber(item.price, 0).toLocaleString()} {t('common.currency')}
                        </span>
                        {pct > 0 && (
                          <span className="text-gray-400 line-through text-[11px] font-medium">
                            {toNumber(item.oldPrice, 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
                <h3 className="text-gray-800 font-semibold text-sm sm:text-base line-clamp-1 mb-1"><ProductLink id={product.id}>{currentLang === 'mk' && product.name_mk ? product.name_mk : product.name}</ProductLink></h3>
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
                            <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2"><ProductLink id={product.id}>{product.name}</ProductLink></h3>
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
                <h3 className="text-gray-800 font-semibold text-sm text-center line-clamp-1"><ProductLink id={product.id}>{currentLang === 'mk' && product.name_mk ? product.name_mk : product.name}</ProductLink></h3>
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
