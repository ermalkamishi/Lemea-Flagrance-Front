import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { message, Spin } from 'antd';
import {
  GiftOutlined,
  CheckCircleFilled,
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  CarOutlined,
} from '@ant-design/icons';
import { addGiftBox } from '../redux/cartSlice';
import { GIFT_BOX, GIFT_BOX_SLOTS, getGiftBoxSlot } from '../config/giftBoxConfig';
import { getImageUrl } from '../utils/imageUtils';
import { toNumber } from '../utils/numberUtils';

const isAvailable = (p) => p.inStock !== false && toNumber(p.stockQuantity, 1) > 0;

const NO_PRODUCTS = [];

const GiftBox = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isMk = i18n.language === 'mk';
  const allProducts = useSelector((state) => state.products.items) || NO_PRODUCTS;
  const productsStatus = useSelector((state) => state.products.status);

  // slotKey -> chosen product
  const [selection, setSelection] = useState({});
  // 'all' or a slot key: which step(s) are visible
  const [activeFilter, setActiveFilter] = useState('all');

  // Products grouped by slot, only the ones in stock
  const productsBySlot = useMemo(() => {
    const groups = Object.fromEntries(GIFT_BOX_SLOTS.map((s) => [s.key, []]));
    allProducts.forEach((p) => {
      const slot = getGiftBoxSlot(p);
      if (slot && isAvailable(p)) groups[slot].push(p);
    });
    return groups;
  }, [allProducts]);

  const chosenCount = GIFT_BOX_SLOTS.filter((s) => selection[s.key]).length;
  const remaining = GIFT_BOX.size - chosenCount;
  const isComplete = remaining === 0;

  const productName = (p) => (isMk && p.name_mk ? p.name_mk : p.name);
  const slotLabel = (slot) => (isMk ? slot.label.mk : slot.label.sq);

  const toggleProduct = (slotKey, product) => {
    setSelection((prev) => {
      if (prev[slotKey]?.id === product.id) {
        const next = { ...prev };
        delete next[slotKey];
        return next;
      }
      return { ...prev, [slotKey]: product };
    });
  };

  const handleAddToCart = () => {
    if (!isComplete) return;
    const products = GIFT_BOX_SLOTS.map((s) => ({ ...selection[s.key], slot: s.key }));
    dispatch(addGiftBox({ products }));
    message.success(t('gift_box.added'));
    setSelection({});
    navigate('/cart');
  };

  const scrollToSlot = (key) => {
    // If a filter hides this step, switch the filter to it first
    if (activeFilter !== 'all' && activeFilter !== key) setActiveFilter(key);
    requestAnimationFrame(() => {
      const el = document.getElementById(`giftbox-slot-${key}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const visibleSlots = activeFilter === 'all'
    ? GIFT_BOX_SLOTS
    : GIFT_BOX_SLOTS.filter((s) => s.key === activeFilter);

  const chipClass = (active) =>
    `inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition-all ${
      active
        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
        : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:text-pink-600'
    }`;

  const renderAddButton = (className = '') => (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={!isComplete}
      className={`flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-300 ${
        isComplete
          ? 'bg-slate-900 text-white hover:bg-pink-500 shadow-xl hover:shadow-pink-500/30'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      } ${className}`}
    >
      <ShoppingCartOutlined />
      {isComplete ? t('gift_box.add_to_cart') : t('gift_box.complete_first', { count: remaining })}
    </button>
  );

  return (
    <>
      <Helmet>
        <title>Gift Box | Lemea Flagrance</title>
        <meta name="description" content={t('gift_box.page_desc', { price: GIFT_BOX.price.toLocaleString() })} />
        <link rel="canonical" href="https://lemeaflagrance.shop/produktet/gift-box" />
      </Helmet>

      <div className="bg-slate-50 min-h-screen pt-6 pb-32 lg:pb-20 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/produktet"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-pink-600 mb-5"
          >
            <ArrowLeftOutlined /> {t('gift_box.back')}
          </Link>

          {/* Header */}
          <div className="gb-gradient rounded-3xl p-6 sm:p-8 text-white shadow-[0_10px_30px_rgba(91,23,72,0.3)] mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <GiftOutlined className="text-2xl sm:text-3xl" style={{ color: '#fde68a' }} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-serif mb-2">{t('gift_box.page_title')}</h1>
                <p className="text-white/90 text-sm sm:text-base max-w-2xl">
                  {t('gift_box.page_desc', { price: GIFT_BOX.price.toLocaleString() })}
                </p>
                <p className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs sm:text-sm font-semibold">
                  <CarOutlined /> {t('gift_box.free_delivery_note')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Slots */}
            <div className="w-full lg:w-2/3 space-y-8">
              {/* Group filters */}
              <div className="flex gap-2 overflow-x-auto pb-5 -mb-4 no-scrollbar">
                <button type="button" onClick={() => setActiveFilter('all')} className={chipClass(activeFilter === 'all')}>
                  {t('products.categories.all')}
                </button>
                {GIFT_BOX_SLOTS.map((slot) => (
                  <button
                    key={slot.key}
                    type="button"
                    onClick={() => setActiveFilter(slot.key)}
                    className={chipClass(activeFilter === slot.key)}
                  >
                    {selection[slot.key] && (
                      <CheckCircleFilled className={activeFilter === slot.key ? 'text-emerald-400' : 'text-emerald-500'} />
                    )}
                    {slot.short}
                  </button>
                ))}
              </div>

              {productsStatus === 'loading' && allProducts.length === 0 && (
                <div className="flex justify-center py-20"><Spin size="large" /></div>
              )}

              {visibleSlots.map((slot) => {
                const index = GIFT_BOX_SLOTS.indexOf(slot);
                const chosen = selection[slot.key];
                const products = productsBySlot[slot.key];
                return (
                  <section
                    key={slot.key}
                    id={`giftbox-slot-${slot.key}`}
                    className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 sm:p-6 scroll-mt-24"
                  >
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div>
                        <span className="text-xs font-extrabold text-pink-500 uppercase tracking-widest">
                          {t('gift_box.step', { n: index + 1 })}
                        </span>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">{slotLabel(slot)}</h2>
                      </div>
                      {chosen ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 font-bold text-xs px-3 py-1.5 rounded-full">
                          <CheckCircleFilled /> {t('gift_box.selected')}
                        </span>
                      ) : (
                        <span className="bg-pink-50 text-pink-600 font-bold text-xs px-3 py-1.5 rounded-full">
                          {t('gift_box.choose_one')}
                        </span>
                      )}
                    </div>

                    {products.length === 0 && productsStatus !== 'loading' ? (
                      <p className="text-sm text-gray-500">{t('gift_box.no_products')}</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {products.map((p) => {
                          const isSelected = chosen?.id === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => toggleProduct(slot.key, p)}
                              aria-pressed={isSelected}
                              className={`relative text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 bg-white ${
                                isSelected
                                  ? 'border-pink-500 shadow-lg shadow-pink-500/20'
                                  : chosen
                                    ? 'border-gray-100 opacity-60 hover:opacity-100'
                                    : 'border-gray-100 hover:border-pink-200'
                              }`}
                            >
                              {isSelected && (
                                <CheckCircleFilled className="absolute top-2 right-2 z-10 text-2xl text-pink-500 bg-white rounded-full" />
                              )}
                              <div className="aspect-square bg-gray-50 overflow-hidden">
                                <img
                                  src={getImageUrl(p.image)}
                                  alt={productName(p)}
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-2.5 sm:p-3">
                                <p className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-snug">
                                  {productName(p)}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            {/* Summary (desktop) */}
            <aside className="hidden lg:block w-full lg:w-1/3">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
                <h3 className="text-xl font-extrabold text-slate-900 font-serif mb-1">{t('gift_box.your_box')}</h3>
                <p className="text-sm text-gray-500 mb-4">{t('gift_box.progress', { count: chosenCount })}</p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-5">
                  <div
                    className="h-full bg-gradient-to-r from-[#5b1748] to-amber-400 transition-all duration-300"
                    style={{ width: `${(chosenCount / GIFT_BOX.size) * 100}%` }}
                  />
                </div>

                <ul className="space-y-3 mb-6">
                  {GIFT_BOX_SLOTS.map((slot) => {
                    const chosen = selection[slot.key];
                    return (
                      <li key={slot.key}>
                        <button
                          type="button"
                          onClick={() => scrollToSlot(slot.key)}
                          className="w-full flex items-center gap-3 text-left rounded-xl p-2 hover:bg-gray-50"
                        >
                          <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center ${chosen ? 'bg-gray-50' : 'bg-pink-50 border-2 border-dashed border-pink-200'}`}>
                            {chosen ? (
                              <img src={getImageUrl(chosen.image)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <GiftOutlined className="text-pink-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-pink-500 uppercase tracking-wider">{slot.short}</p>
                            <p className={`text-sm truncate ${chosen ? 'font-semibold text-slate-800' : 'text-gray-400 italic'}`}>
                              {chosen ? productName(chosen) : t('gift_box.empty_slot')}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="flex justify-between items-end border-t border-gray-100 pt-5 mb-5">
                  <span className="font-bold text-slate-900">{t('cart.total')}</span>
                  <span className="text-3xl font-black text-pink-600">
                    {GIFT_BOX.price.toLocaleString()} <span className="text-lg">{t('common.currency')}</span>
                  </span>
                </div>

                {renderAddButton('w-full h-14 text-base')}
              </div>
            </aside>
          </div>
        </div>

        {/* Summary bar (mobile) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-4 pt-3 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {GIFT_BOX_SLOTS.map((slot) => (
                <button
                  key={slot.key}
                  type="button"
                  onClick={() => scrollToSlot(slot.key)}
                  aria-label={slotLabel(slot)}
                  className={`w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center ${selection[slot.key] ? 'bg-gray-50' : 'bg-pink-50 border border-dashed border-pink-200'}`}
                >
                  {selection[slot.key] ? (
                    <img src={getImageUrl(selection[slot.key].image)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <GiftOutlined className="text-pink-300 text-sm" />
                  )}
                </button>
              ))}
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-500">{t('gift_box.progress', { count: chosenCount })}</p>
              <p className="text-lg font-black text-pink-600 leading-tight">
                {GIFT_BOX.price.toLocaleString()} {t('common.currency')}
              </p>
            </div>
          </div>
          {renderAddButton('w-full h-12 text-sm')}
        </div>
      </div>
    </>
  );
};

export default GiftBox;
