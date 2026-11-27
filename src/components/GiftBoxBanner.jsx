import React, { useMemo } from 'react';
import { Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { GiftOutlined, ArrowRightOutlined, TagOutlined } from '@ant-design/icons';
import { GIFT_BOX, GIFT_BOX_SLOTS, GIFT_BOX_ROUTE, getGiftBoxSlot } from '../config/giftBoxConfig';
import { getImageUrl } from '../utils/imageUtils';

/**
 * Compact gift box promo that sits above the filter card on /produktet.
 * Same width as the filter card, short height, 3 auto-rotating slides.
 */
const NO_PRODUCTS = [];

const GiftBoxBanner = ({ className = '' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const allProducts = useSelector((state) => state.products.items) || NO_PRODUCTS;

  // One sample image per slot for the "what's inside" slide
  const samples = useMemo(() => {
    const found = {};
    allProducts.forEach((p) => {
      const slot = getGiftBoxSlot(p);
      if (slot && !found[slot] && p.image && p.inStock !== false) found[slot] = p;
    });
    return GIFT_BOX_SLOTS.map((s) => ({ slot: s, product: found[s.key] }));
  }, [allProducts]);

  const go = () => navigate(GIFT_BOX_ROUTE);
  const price = GIFT_BOX.price.toLocaleString();

  const slideBase =
    'h-[150px] px-5 py-4 flex flex-col justify-center text-white cursor-pointer select-none';

  return (
    <div
      className={`gift-box-banner rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(91,23,72,0.35)] gb-gradient ${className}`}
    >
      <Carousel autoplay autoplaySpeed={4000} dots={{ className: 'gift-box-dots' }}>
        {/* Slide 1: CTA */}
        <div>
          <div className={slideBase} onClick={go}>
           
            <h3 className="text-lg font-extrabold leading-tight">{t('gift_box.title')}</h3>
            <p className="text-xs text-white/90 mb-2.5">
              4 = <strong className="text-amber-200">{price} {t('common.currency')}</strong>
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); go(); }}
              className="w-fit inline-flex items-center gap-1.5 bg-white text-[#7a1650] font-bold text-xs px-3.5 py-1.5 rounded-full hover:bg-amber-200 hover:text-[#4a0f3f] transition-colors"
            >
              {t('gift_box.cta')} <ArrowRightOutlined />
            </button>
          </div>
        </div>

        {/* Slide 2: what's inside */}
        <div>
          <div className={slideBase} onClick={go}>
            <h3 className="text-sm font-extrabold mb-2">{t('gift_box.slide_products_title')}</h3>
            <div className="flex items-center gap-1.5 mb-2">
              {samples.map(({ slot, product }, i) => (
                <React.Fragment key={slot.key}>
                  {i > 0 && <span className="text-white/80 font-bold text-xs">+</span>}
                  <div className="w-10 h-10 rounded-lg bg-white/90 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {product ? (
                      <img src={getImageUrl(product.image)} alt={slot.short} className="w-full h-full object-cover" />
                    ) : (
                      <GiftOutlined className="text-pink-400" />
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
            <p className="text-[11px] leading-snug text-white/95 font-semibold">
              {GIFT_BOX_SLOTS.map((s) => s.short).join(' + ')}
            </p>
          </div>
        </div>

        {/* Slide 3: price */}
        <div>
          <div className={slideBase} onClick={go}>
            <div className="flex items-center gap-2 mb-1">
              <TagOutlined className="text-2xl" />
              <h3 className="text-lg font-extrabold">{t('gift_box.slide_price_title', { price })}</h3>
            </div>
            <p className="text-xs text-white/90 mb-1">{t('gift_box.slide_price_desc')}</p>
          </div>
        </div>
      </Carousel>
    </div>
  );
};

export default GiftBoxBanner;
