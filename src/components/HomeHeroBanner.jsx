import React, { useMemo } from 'react';
import { Carousel } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../utils/imageUtils';
import { toNumber } from '../utils/numberUtils';
import { autoFitImage } from '../utils/autoFitImage';
import { HERO_PRODUCTS, normalizeProductName } from '../config/heroProducts';
import { GIFT_BOX, GIFT_BOX_ROUTE } from '../config/giftBoxConfig';
import { GiftOutlined, CarOutlined, AppstoreOutlined } from '@ant-design/icons';
import './HomeHeroBanner.css';

/*
 * Promotional banner on the Home page (tablet/desktop; phones show the animated
 * hero in its place). Slides cross-fade; on each slide the text rises in line by
 * line and the featured products float in. Products that have a transparent image
 * in src/config/heroProducts.js float freely on the gradient; others are shown as
 * a clean photo card.
 */

const SLIDE_MS = 6000;

// Dark on the left (behind the text) → warm glow on the right (behind the products).
const THEMES = {
  amber: {
    bg: 'linear-gradient(115deg, #2a0f05 0%, #6b2a0c 38%, #b45309 72%, #f59e0b 100%)',
    glow: 'rgba(251, 191, 36, 0.55)',
    accent: 'text-amber-300',
    btn: 'text-amber-900',
  },
  pink: {
    bg: 'linear-gradient(115deg, #3b0620 0%, #831843 38%, #db2777 72%, #fb7185 100%)',
    glow: 'rgba(251, 113, 133, 0.55)',
    accent: 'text-yellow-300',
    btn: 'text-pink-700',
  },
  rose: {
    bg: 'linear-gradient(115deg, #2b0510 0%, #881337 40%, #e11d48 75%, #fb923c 100%)',
    glow: 'rgba(253, 186, 116, 0.5)',
    accent: 'text-orange-200',
    btn: 'text-rose-700',
  },
  // Gift Box: deep plum → magenta → gold
  gift: {
    bg: 'linear-gradient(115deg, #1a0526 0%, #4c1d5e 34%, #be185d 68%, #f59e0b 100%)',
    glow: 'rgba(252, 211, 77, 0.5)',
    accent: 'text-amber-300',
    btn: 'text-fuchsia-800',
  },
};

const TRANSPARENT_IMAGES = new Map(
  HERO_PRODUCTS.map(({ name, image }) => [normalizeProductName(name), image])
);

const fitBannerImage = (img) => autoFitImage(img, { fitHeight: 0.92, fitWidth: 0.85, maxScale: 1.9 });

const HomeHeroBanner = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const storeProducts = useSelector((state) => state.products.items);
  const allProducts = useMemo(() => storeProducts || [], [storeProducts]);
  const currentLang = i18n.language;

  const slides = [
    {
      id: 1,
      theme: 'amber',
      tag: t('hero.tag'),
      title1: 'Lattafa Khamrah',
      title2: t('home.hero_slides.slide1_title2'),
      desc: t('home.hero_slides.slide1_desc'),
      btnText: t('hero.btn'),
      products: ['Lattafa Khamrah', 'Lattafa Asad Bourbon', 'Lattafa Yara'],
    },
    {
      id: 2,
      theme: 'pink',
      tag: t('common.limited_edition', 'Ofertë Limituar'),
      title1: t('home.hero_slides.offer_title1', '3 Body Mist'),
      title2: t('home.hero_slides.offer_title2', 'Për vetëm 999 Den'),
      desc: t('home.hero_slides.offer_desc', 'Zgjidh 3 Body Mist-et tuaja të preferuara Victoria Secret dhe pëfito çmimin special. Kombino aromën tënde sot!'),
      btnText: t('hero.view_all', 'Shiko të Gjitha'),
      offerPrice: 333,
      products: ['VS Pure Seduction La Creme', 'VS Love Spell', 'VS Aqua Kiss'],
    },
    {
      id: 3,
      theme: 'rose',
      tag: t('home.hero_slides.slide3_tag'),
      title1: t('home.hero_slides.slide3_title1'),
      title2: t('home.hero_slides.slide3_title2'),
      desc: t('home.hero_slides.slide3_desc'),
      btnText: t('home.hero_slides.slide3_btn'),
      products: ['Amber Romance', 'Fakhar'],
    },
    {
      id: 4,
      theme: 'gift',
      isGiftBox: true,
      to: GIFT_BOX_ROUTE,
      tag: t('gift_box.hero_tag'),
      title1: t('gift_box.hero_title1'),
      title2: t('gift_box.hero_title2'),
      desc: t('gift_box.hero_desc'),
      btnText: t('gift_box.cta'),
      perks: [
        { icon: <AppstoreOutlined />, text: t('gift_box.perk_products') },
        { icon: <CarOutlined />, text: t('gift_box.perk_delivery') },
        { icon: <GiftOutlined />, text: t('gift_box.perk_gift') },
      ],
      products: ['VS Velvet Petals Noir', 'Cheirosa 68 Beija Flor', 'Sheglam Eyeshadow Primer 1', 'Sheglam Blush Love Cake'],
    },
  ];

  // Featured products per slide: exact name match first, otherwise "name contains".
  const slideNames = slides.map((s) => s.products.join('|')).join('||');
  const slideProducts = useMemo(() => {
    const byName = new Map(allProducts.map((p) => [normalizeProductName(p.name), p]));
    return slideNames.split('||').map((group) =>
      group
        .split('|')
        .map((name) => {
          const key = normalizeProductName(name);
          const product =
            byName.get(key) ||
            allProducts.find((p) => normalizeProductName(p.name).includes(key));
          if (!product) return null;
          const transparent = TRANSPARENT_IMAGES.get(normalizeProductName(product.name));
          return {
            product,
            image: transparent || getImageUrl(product.image),
            transparent: Boolean(transparent),
          };
        })
        .filter(Boolean)
    );
  }, [allProducts, slideNames]);

  const nameOf = (p) => (currentLang === 'mk' && p.name_mk ? p.name_mk : p.name);

  return (
    <div className="hb-banner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
      <div className="hb-frame">
        <Carousel
          autoplay={{ dotDuration: true }}
          autoplaySpeed={SLIDE_MS}
          effect="fade"
          speed={900}
          pauseOnHover={false}
          dots={{ className: 'hb-dots' }}
        >
          {slides.map((slide, si) => {
            const theme = THEMES[slide.theme];
            const products = slideProducts[si] || [];
            return (
              <div key={slide.id}>
                <div className="hb-slide" style={{ '--hb-bg': theme.bg, '--hb-glow': theme.glow }}>
                  <span className="hb-orb hb-orb-a" aria-hidden="true" />
                  <span className="hb-orb hb-orb-b" aria-hidden="true" />

                  <div className="hb-content">
                    <span className="hb-tag hb-anim" style={{ '--d': '0ms' }}>
                      {slide.tag}
                    </span>
                    <h2 className="hb-title font-serif hb-anim" style={{ '--d': '90ms' }}>
                      <span className="block">{slide.title1}</span>
                      <span className={`block ${theme.accent}`}>{slide.title2}</span>
                    </h2>
                    <p className="hb-desc hb-anim" style={{ '--d': '180ms' }}>
                      {slide.desc}
                    </p>
                    {slide.perks && (
                      <ul className="hb-perks hb-anim" style={{ '--d': '230ms' }}>
                        {slide.perks.map((perk) => (
                          <li key={perk.text} className="hb-perk">
                            {perk.icon} {perk.text}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="hb-anim" style={{ '--d': '290ms' }}>
                      <button
                        type="button"
                        onClick={() => navigate(slide.to || '/produktet')}
                        className={`hb-btn ${theme.btn} ${slide.isGiftBox ? 'hb-btn-gift' : ''}`}
                      >
                        {slide.isGiftBox && <GiftOutlined className="mr-2" />}
                        {slide.btnText}
                      </button>
                    </div>
                  </div>

                  {products.length > 0 && (
                    <div className={`hb-stage hb-count-${products.length}`}>
                      {slide.isGiftBox && (
                        <>
                          <span className="hb-sparkle hb-sparkle-a" aria-hidden="true">✦</span>
                          <span className="hb-sparkle hb-sparkle-b" aria-hidden="true">✦</span>
                          <span className="hb-sparkle hb-sparkle-c" aria-hidden="true">✦</span>
                          <span className="hb-sparkle hb-sparkle-d" aria-hidden="true">✦</span>
                          <div className="hb-seal-wrap">
                            <div className="hb-seal">
                              <span className="hb-seal-top">{t('gift_box.seal_top')}</span>
                              <span className="hb-seal-price">{GIFT_BOX.price.toLocaleString()}</span>
                              <span className="hb-seal-cur">{t('common.currency')}</span>
                              <span className="hb-seal-bottom">{t('gift_box.seal_bottom')}</span>
                            </div>
                          </div>
                        </>
                      )}
                      {products.map(({ product, image, transparent }, k) => (
                        <div key={product.id} className={`hb-item hb-pos-${k}`} style={{ '--i': k }}>
                          <div className="hb-enter">
                            <Link to={`/produktet/${product.id}`} className="hb-float" draggable={false}>
                              <span className={transparent ? 'hb-bottle' : 'hb-card'}>
                                <img
                                  src={image}
                                  alt={nameOf(product)}
                                  draggable={false}
                                  decoding="async"
                                  ref={transparent ? fitBannerImage : undefined}
                                  onLoad={transparent ? (e) => fitBannerImage(e.currentTarget) : undefined}
                                />
                              </span>
                              <span className="hb-label">
                                <span className="hb-label-name">{nameOf(product)}</span>
                                <span className="hb-label-price">
                                  {slide.offerPrice ? (
                                    <>
                                      {slide.offerPrice} {t('common.currency')}{' '}
                                      <span className="hb-label-note">(Ofertë)</span>
                                    </>
                                  ) : (
                                    <>
                                      {toNumber(product.oldPrice, 0) > toNumber(product.price, 0) && (
                                        <span className="hb-label-old">
                                          {toNumber(product.oldPrice, 0).toLocaleString()}
                                        </span>
                                      )}
                                      {toNumber(product.price, 0).toLocaleString()} {t('common.currency')}
                                    </>
                                  )}
                                </span>
                              </span>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </Carousel>
      </div>
    </div>
  );
};

export default HomeHeroBanner;
