import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, setCartItemQuantity, selectCartTotals } from '../redux/cartSlice';
import { Button, message, Tag } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, ArrowRightOutlined, SafetyCertificateOutlined, MinusOutlined, PlusOutlined, GiftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../utils/imageUtils';
import { toNumber } from '../utils/numberUtils';

const Cart = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const { subtotal, discount, perfumeMistDiscount, groupsOf3Discount, total, count } = useSelector(selectCartTotals);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isPromoActive = new Date().getTime() < new Date('2026-06-10T23:59:59+09:00').getTime();
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-slate-50 font-sans">
        <div className="w-48 h-48 bg-pink-50 rounded-full flex items-center justify-center mb-8 shadow-inner border border-pink-100">
          <ShoppingCartOutlined className="text-[80px] text-pink-300" />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 font-serif">{t('cart.empty_title')}</h2>
        <p className="text-gray-500 mb-10 max-w-md text-center text-lg leading-relaxed">
          {t('cart.empty_desc')}
        </p>
        <Button
          size="large"
          className="bg-slate-900 text-white hover:bg-pink-500 border-none rounded-xl h-14 px-10 font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-pink-500/30 hover:-translate-y-1"
          onClick={() => navigate('/produktet')}
        >
          {t('cart.start_shopping')} <ArrowRightOutlined />
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-10 flex items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif">{t('cart.title')}</h1>
          <span className="bg-pink-100 text-pink-600 font-bold px-4 py-1.5 rounded-full text-lg shadow-sm border border-pink-200">
            {cartItems.length}
          </span>
        </div>

        {/* Promo Mini Banner - only while offer is active */}
        {isPromoActive && (
          <div className="mb-8 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-rose-500 to-violet-600 rounded-[24px] blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-slate-900 border border-slate-800 text-white rounded-[20px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-pink-500 rounded-full blur-2xl opacity-10 pointer-events-none"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-xl shadow-md border border-pink-400/25">
                  <GiftOutlined />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base tracking-wide font-serif">
                    {t('promo_banner.title_line1')} {t('promo_banner.title_line2')}
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5 max-w-xl">
                    {t('promo_banner.desc')}
                  </p>
                </div>
              </div>
              <Tag className="font-extrabold border-none bg-pink-500 text-white px-3 py-1 rounded-lg text-xs uppercase animate-pulse flex-shrink-0 relative z-10">
                5 DITË VETËM
              </Tag>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Lista e Produkteve */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => {
              return (
                <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-[30px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(236,72,153,0.1)] transition-all duration-300">

                  {/* Imazhi */}
                  <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 cursor-pointer relative group" onClick={() => navigate(`/produktet/${item.id}`)}>
                    <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
                  </div>

                  {/* Info */}
                  <div className="flex-grow w-full flex flex-col h-full justify-center">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-extrabold text-pink-500 uppercase tracking-widest">{item.brand || item.category || t('cart.product')}</span>
                        <h3 className="font-bold text-xl text-slate-900 line-clamp-2 cursor-pointer hover:text-pink-600 transition-colors mt-1" onClick={() => navigate(`/produktet/${item.id}`)}>{item.name}</h3>
                      </div>
                      <button
                        onClick={() => { dispatch(removeFromCart(item.id)); message.success(t('cart.remove_msg')); }}
                        className="w-11 h-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors flex-shrink-0 ml-4 shadow-sm"
                        title={t('cart.remove_msg')}
                      >
                        <DeleteOutlined className="text-xl" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-auto pt-2">
                      <div className="text-slate-900 font-extrabold text-2xl tracking-tight">
                        {toNumber(item.price, 0).toLocaleString()} <span className="text-base font-bold ml-0.5">{t('common.currency')}</span>
                      </div>

                      <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-2 py-1 sm:px-3">
                        <button
                          type="button"
                          aria-label={t('cart.quantity')}
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            dispatch(setCartItemQuantity({ id: item.id, quantity: item.quantity - 1 }))
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <MinusOutlined />
                        </button>
                        <span className="min-w-[2rem] text-center font-black text-slate-900 text-base sm:text-lg">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={t('cart.quantity')}
                          onClick={() => {
                            const cap =
                              item.stockQuantity != null ? toNumber(item.stockQuantity, 99) : 99;
                            dispatch(
                              setCartItemQuantity({
                                id: item.id,
                                quantity: Math.min(cap, item.quantity + 1),
                              }),
                            );
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white"
                        >
                          <PlusOutlined />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Përmbledhja (Summary) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-28">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-8 font-serif">{t('cart.summary')}</h2>

              <div className="space-y-5 mb-8">
                <div className="flex justify-between text-gray-600 text-lg">
                  <span className="font-medium">{t('cart.subtotal')}</span>
                  <span className="font-bold text-slate-900">{subtotal.toLocaleString()} {t('common.currency')}</span>
                </div>
                {perfumeMistDiscount > 0 && (
                  <div className="flex justify-between text-pink-600 text-lg animate-pulse">
                    <span className="font-medium flex items-center gap-2">
                      <GiftOutlined /> {t('common.perfume_mist_discount', 'Parfum + Body Mist Falas')}
                    </span>
                    <span className="font-bold">-{perfumeMistDiscount.toLocaleString()} {t('common.currency')}</span>
                  </div>
                )}
                {groupsOf3Discount > 0 && (
                  <div className="flex justify-between text-pink-600 text-lg animate-pulse">
                    <span className="font-medium flex items-center gap-2">
                      <GiftOutlined /> {t('common.mist_bundle_discount', 'Ofertë: 3 Body Mist')}
                    </span>
                    <span className="font-bold">-{groupsOf3Discount.toLocaleString()} {t('common.currency')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 text-lg">
                  <span className="font-medium">{t('cart.shipping')}</span>
                  <span className="font-bold text-emerald-500 uppercase tracking-wider text-sm bg-emerald-50 px-2 py-1 rounded-md">{t('cart.free')}</span>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-gray-100 pt-8 mb-8">
                <span className="text-xl font-bold text-slate-900">{t('cart.total')}</span>
                <span className="text-4xl font-black text-pink-600 tracking-tight">{total.toLocaleString()} <span className="text-2xl">{t('common.currency')}</span></span>
              </div>

              <Button
                type="primary"
                size="large"
                block
                className="bg-slate-900 hover:bg-pink-500 text-white h-16 rounded-2xl text-xl font-bold shadow-xl hover:shadow-pink-500/30 hover:-translate-y-1 transition-all duration-300 border-none flex items-center justify-center gap-3"
                onClick={() => navigate('/pagesa')}
              >
                {t('cart.checkout_btn')} <ArrowRightOutlined className="text-2xl" />
              </Button>

              <div className="mt-8 flex items-center justify-center gap-2 text-gray-500 font-medium bg-gray-50 py-3 rounded-xl border border-gray-100">
                <SafetyCertificateOutlined className="text-xl text-emerald-500" />
                <span>{t('cart.secure_shopping')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;