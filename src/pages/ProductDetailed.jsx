import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import PromoBanner from '../components/PromoBanner';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Tag, Rate, Breadcrumb, Tabs, message, Spin, Form, Input } from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  SafetyCertificateOutlined,
  TruckOutlined,
  ReloadOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addToCart } from '../redux/cartSlice';
import { getImageUrl } from '../utils/imageUtils';
import { getApiBaseUrl } from '../utils/apiBase';
import { toNumber } from '../utils/numberUtils';
import { getProductRatingInfo, getFallbackReviews } from '../utils/reviewUtils';
import { fetchProducts } from '../redux/productsSlice';
import { JET_SETS } from '../data/jetSetsData';

const ProductDetailed = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const items = useSelector((state) => state.products.items);
  const allProducts = useMemo(() => items ?? [], [items]);

  const [product, setProduct] = useState(null);
  const [loadStatus, setLoadStatus] = useState('idle');
  const [categories, setCategories] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [productReviews, setProductReviews] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm] = Form.useForm();

  const fromStore = useMemo(() => {
    return allProducts.find((p) => p.id === id) || JET_SETS.find((p) => p.id === id);
  }, [allProducts, id]);

  const activeReviews = useMemo(() => {
    return productReviews && productReviews.length > 0 ? productReviews : getFallbackReviews(product);
  }, [productReviews, product]);

  useEffect(() => {
    let cancelled = false;

    // Fetch categories for translations
    fetch(`${getApiBaseUrl()}/categories`)
      .then(res => res.json())
      .then(data => { if (!cancelled) setCategories(data); })
      .catch(console.error);

    queueMicrotask(() => {
      if (cancelled) return;

      if (fromStore) {
        setProduct(fromStore);
        setLoadStatus('succeeded');
        return;
      }

      if (!id) {
        setProduct(null);
        setLoadStatus('failed');
        return;
      }

      setLoadStatus('loading');
      (async () => {
        try {
          const res = await fetch(`${getApiBaseUrl()}/products/${id}`);
          if (!res.ok) throw new Error('not found');
          const data = await res.json();
          if (!cancelled) {
            setProduct(data);
            setLoadStatus('succeeded');
          }

          // Fetch product specific reviews
          const revRes = await fetch(`${getApiBaseUrl()}/reviews/product/${id}`);
          if (revRes.ok) {
            const revData = await revRes.json();
            if (!cancelled) setProductReviews(revData);
          }
        } catch {
          if (!cancelled) {
            setProduct(null);
            setLoadStatus('failed');
          }
        }
      })();
    });

    return () => { cancelled = true; };
  }, [id, fromStore]);

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

  const similarProducts = useMemo(() => {
    if (!product) return [];
    const pool = allProducts.some((p) => p.category === product.category)
      ? allProducts
      : [...allProducts, ...JET_SETS];
    return pool
      .filter((p) => p.category === product.category && p.id !== product.id && p.inStock)
      .slice(0, 4);
  }, [allProducts, product]);

  useEffect(() => {
    queueMicrotask(() => {
      if (product?.image) {
        setMainImage(product.image);
        window.scrollTo(0, 0);
      }
      setQuantity(1);
    });
  }, [product?.id, product?.image]);

  const stockMax = useMemo(() => {
    if (!product) return 99;
    const q = toNumber(product.stockQuantity, 0);
    if (!product.inStock || q <= 0) return 1;
    return Math.max(1, q);
  }, [product]);

  if (loadStatus === 'loading' || (loadStatus === 'idle' && !fromStore)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 font-sans">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-50 px-4 font-sans">
        <h2 className="mb-4 text-2xl font-bold text-gray-800 md:text-3xl">{t('product_details.not_found')}</h2>
        <Button size="large" onClick={() => navigate('/produktet')} className="rounded-xl border-none bg-pink-500 text-white hover:bg-pink-600">
          {t('product_details.back_to_products')}
        </Button>
      </div>
    );
  }

  const priceNum = toNumber(product.price, 0);
  const oldPriceNum = product.oldPrice != null ? toNumber(product.oldPrice, NaN) : NaN;
  const saveAmount = Number.isFinite(oldPriceNum) ? oldPriceNum - priceNum : 0;

  const handleAddToCart = () => {
    if (!product.inStock || product.stockQuantity === 0) return;
    const safeQty = Math.min(Math.max(1, quantity), stockMax);
    dispatch(addToCart({ ...product, quantity: safeQty }));
    message.success({
      content: `${product.name} ${t('product_details.added_to_cart')}`,
      className: 'mt-20',
      icon: <CheckCircleFilled className="text-emerald-500" />,
    });
  };

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-4 font-sans">
      <Helmet>
        <title>{product.name}{product.brand ? ` – ${product.brand}` : ''} | Lemea Fragrance</title>
        <meta
          name="description"
          content={`${product.name}${product.brand ? ` nga ${product.brand}` : ''} — bli online në Lemea Fragrance. Çmimi: ${priceNum.toLocaleString()} Den. Dërrgesa e shpejtë në Maqedoni dhe Kosovë.`}
        />
        <meta property="og:title" content={`${product.name} | Lemea Fragrance`} />
        <meta
          property="og:description"
          content={`${product.name}${product.brand ? ` nga ${product.brand}` : ''} — çmimi: ${priceNum.toLocaleString()} Den.`}
        />
        <meta property="og:image" content={product.image ? `https://lemeafragrance.shop/api/images/${product.image}` : 'https://www.lemeafragrance.shop/og-image.jpg'} />
        <meta property="og:url" content={`https://www.lemeafragrance.shop/produktet/${product.id}`} />
        <link rel="canonical" href={`https://www.lemeafragrance.shop/produktet/${product.id}`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "image": product.image ? `https://lemeafragrance.shop/api/images/${product.image}` : undefined,
          "description": product.description || `${product.name} ${product.brand ? `nga ${product.brand}` : ''}.`,
          "brand": product.brand ? { "@type": "Brand", "name": product.brand } : undefined,
          "sku": product.id,
          "offers": {
            "@type": "Offer",
            "url": `https://www.lemeafragrance.shop/produktet/${product.id}`,
            "priceCurrency": "MKD",
            "price": priceNum,
            "availability": product.inStock && product.stockQuantity !== 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            "seller": { "@type": "Organization", "name": "Lemea Fragrance" }
          }
        })}</script>
      </Helmet>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 py-4">
          <Breadcrumb separator=">">
            <Breadcrumb.Item>
              <Link to="/">{t('product_details.breadcrumb.home')}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item className="cursor-pointer text-gray-500 hover:text-pink-500" onClick={() => navigate('/produktet')}>
              {t('checkout.back_products')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>{getCategoryLabel(product.category)}</Breadcrumb.Item>
            <Breadcrumb.Item className="font-semibold text-gray-800">{product.name}</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <div className="rounded-[40px] border border-gray-100 bg-white p-6 shadow-sm md:p-10">
          <div className="grid gap-12 md:grid-cols-2 lg:gap-20">
            <div className="space-y-6">
              <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 md:aspect-square">
                <img
                  src={getImageUrl(mainImage)}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {product.discount && (
                  <div className="absolute left-6 top-6 rounded-xl bg-rose-500 px-4 py-2 text-lg font-extrabold text-white shadow-lg">
                    {product.discount}
                  </div>
                )}
              </div>

              {imagesList.length > 1 && (
                <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-2">
                  {imagesList.map((img, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setMainImage(img)}
                      className={`h-24 w-24 flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border-[3px] transition-all duration-300 ${mainImage === img ? 'border-pink-500 p-0.5' : 'border-transparent hover:border-pink-200'
                        }`}
                    >
                      <img src={getImageUrl(img)} className="h-full w-full rounded-xl object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="mb-6">
                <Tag className="mb-4 rounded-lg border-none bg-pink-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-pink-600">
                  {product.brand}
                </Tag>
                <h1 className="mb-4 text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
                  {currentLang === 'mk' && product.name_mk ? product.name_mk : product.name}
                </h1>

                <div className="mb-6 flex flex-wrap items-center gap-4">
                  <span
                    className={
                      product.inStock
                        ? 'flex items-center gap-1 text-sm font-bold text-emerald-500'
                        : 'flex items-center gap-1 text-sm font-bold text-rose-500'
                    }
                  >
                    <CheckCircleFilled /> {product.inStock ? t('product_details.in_stock') : t('product_details.out_of_stock')}
                  </span>
                </div>

                <div className="mb-8 rounded-3xl border border-gray-100 bg-gray-50 p-6">
                  <div className="flex flex-wrap items-end gap-4">
                    <span className="text-4xl font-black text-slate-900">{priceNum.toLocaleString()} {t('common.currency')}</span>
                    {Number.isFinite(oldPriceNum) && oldPriceNum > priceNum && (
                      <div className="flex flex-col pb-1">
                        <span className="text-lg font-medium text-gray-400 line-through">{oldPriceNum.toLocaleString()} {t('common.currency')}</span>
                        <span className="text-sm font-bold text-rose-500">
                          {t('product_details.save')} {saveAmount.toLocaleString()} {t('common.currency')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="mb-8 text-base leading-relaxed text-gray-600">
                  {currentLang === 'mk' && product.description_mk ? product.description_mk : (product.description || t('product_details.default_desc'))}
                </p>

                <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                  <div className="flex h-[60px] w-full items-center rounded-2xl border-2 border-gray-200 bg-white p-1 sm:w-[160px]">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-full w-10 items-center justify-center text-xl font-medium text-gray-500 hover:text-slate-900"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center text-lg font-bold text-slate-900">{quantity}</div>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(stockMax, q + 1))}
                      className="flex h-full w-10 items-center justify-center text-xl font-medium text-gray-500 hover:text-slate-900"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!product.inStock || product.stockQuantity === 0}
                    className={`flex h-[60px] flex-1 items-center justify-center gap-3 rounded-2xl text-lg font-bold transition-all duration-300 ${product.inStock && product.stockQuantity > 0
                      ? '-translate-y-0 bg-slate-900 text-white hover:-translate-y-1 hover:bg-pink-600 hover:shadow-lg hover:shadow-pink-500/30 cursor-pointer'
                      : 'cursor-not-allowed bg-gray-200 text-gray-400'
                      }`}
                  >
                    <ShoppingCartOutlined className="text-2xl" />
                    {product.inStock && product.stockQuantity > 0
                      ? t('product_details.add_to_cart')
                      : t('product_details.out_of_stock')}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3 text-emerald-700">
                    <SafetyCertificateOutlined className="text-2xl" />
                    <span className="text-sm font-semibold leading-tight">
                      {t('product_details.original')}
                      <br />
                      <span className="text-xs font-normal opacity-80">{t('product_details.guaranteed')}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3 text-blue-700">
                    <ReloadOutlined className="text-2xl" />
                    <span className="text-sm font-semibold leading-tight">
                      {t('product_details.easy_return')}
                      <br />
                      <span className="text-xs font-normal opacity-80">{t('product_details.return_policy')}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="product-tabs" className="mt-12 rounded-[40px] border border-gray-100 bg-white p-6 shadow-sm md:p-10">
          <Tabs
            defaultActiveKey="1"
            size="large"
            items={[
              {
                key: '1',
                label: <span className="px-4 text-lg font-bold">{t('product_details.tabs.description')}</span>,
                children: (
                  <div className="max-w-3xl py-6 leading-relaxed text-gray-600">
                    <p className="mb-4">{t('product_details.desc_p1')}</p>
                    <p className="mb-4">
                      <strong>{t('product_details.main_notes')}</strong> {t('product_details.notes_list')}
                    </p>
                    <p>{t('product_details.desc_p2').replace('offshore', product.name)}</p>
                  </div>
                ),
              },
              {
                key: '2',
                label: <span className="px-4 text-lg font-bold">{t('product_details.tabs.specifications')}</span>,
                children: (
                  <div className="max-w-2xl py-6">
                    <table className="w-full border-collapse text-left">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <th className="w-1/3 py-4 font-medium text-gray-500">{t('product_details.specs.brand')}</th>
                          <td className="py-4 font-bold text-gray-800">{product.brand}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <th className="py-4 font-medium text-gray-500">{t('product_details.specs.category')}</th>
                          <td className="py-4 font-bold text-gray-800">{product.category}</td>
                        </tr>
                        {(() => {
                          const cat = product.category;
                          const brand = (product.brand || '').toLowerCase();
                          const name = (product.name || '').toLowerCase();
                          const showQty = cat === 'Parfume' || cat === 'P\u00ebr meshkuj' || cat === 'Për meshkuj' || cat === 'Body Mist';
                          
                          let qtyVal = '100 ml';
                          if (cat === 'Body Mist') {
                            const isSDJ = brand.includes('sol') || name.includes('sol de janeiro') || name.includes('cheirosa');
                            qtyVal = isSDJ ? '90 ml' : '250 ml';
                          }

                          if (!showQty) return null;

                          return (
                            <tr className="border-b border-gray-100">
                              <th className="py-4 font-medium text-gray-500">{t('product_details.specs.quantity')}</th>
                              <td className="py-4 font-bold text-gray-800">{qtyVal}</td>
                            </tr>
                          );
                        })()}
                        <tr>
                          <th className="py-4 font-medium text-gray-500">{t('product_details.specs.package')}</th>
                          <td className="py-4 font-bold text-gray-800">{t('product_details.specs.luxury_box')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ),
              },
            ]}
          />
        </div>

        <div className="mt-8">
          <PromoBanner compact />
        </div>

        {/* Seksioni i Produkteve të Ngjashme */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-slate-900 mb-8 font-serif px-4">
              {t('product_details.similar_products', 'Produkte të Ngjashme')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-0">
              {similarProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    navigate(`/produktet/${p.id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="bg-white rounded-3xl p-3 border border-gray-100 hover:shadow-xl hover:shadow-pink-100 transition-all duration-500 cursor-pointer group flex flex-col h-full"
                >
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-3 bg-gray-50">
                    <img
                      src={getImageUrl(p.image)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-pink-500 font-bold uppercase tracking-widest mb-1 block">
                        {getCategoryLabel(p.category)}
                      </span>
                      <h3 className="text-slate-800 font-bold text-xs sm:text-sm line-clamp-2 mb-2 leading-tight">
                        {currentLang === 'mk' && p.name_mk ? p.name_mk : p.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-slate-900 font-extrabold text-sm sm:text-base">
                        {toNumber(p.price, 0).toLocaleString()} {t('common.currency')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(addToCart({ ...p, quantity: 1 }));
                          message.success(`${p.name} ${t('cart.added_msg')}`);
                        }}
                        className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-pink-500 transition-all active:scale-90"
                      >
                        <ShoppingCartOutlined />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 p-4 backdrop-blur-lg border-t border-gray-100 md:hidden animate-in slide-in-from-bottom duration-500">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h4 className="font-bold text-gray-800 mb-0 text-xs uppercase tracking-widest">{t('products.price')}</h4>
            <span className="text-xl font-black text-slate-900 leading-none">{priceNum.toLocaleString()} {t('common.currency')}</span>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock || product.stockQuantity === 0}
            className={`flex flex-1 h-12 items-center justify-center gap-2 rounded-xl text-base font-bold shadow-lg transition-all ${product.inStock && product.stockQuantity > 0
              ? 'bg-pink-500 text-white shadow-pink-200'
              : 'bg-gray-200 text-gray-400'
              }`}
          >
            <ShoppingCartOutlined className="text-xl" />
            {product.inStock && product.stockQuantity > 0
              ? t('product_details.add_to_cart')
              : t('product_details.out_of_stock')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailed;
