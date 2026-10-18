import React from 'react';
import { Link } from 'react-router-dom';
import { FacebookOutlined, InstagramOutlined, TikTokOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main links — 3 columns on large screens */}
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">

          {/* Kolona 1: Rreth Markës */}
          <div className="space-y-4">
            <h2 className="font-serif text-3xl font-bold text-white tracking-wide">
              Lemea
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t('footer.about_desc')}
            </p>
            {/* Ikonat e Rrjeteve Sociale */}
            <div className="flex space-x-4 pt-4">
              <a
                href="https://www.instagram.com/lemea.flagrance/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white transition-all duration-300 hover:bg-pink-500"
              >
                <InstagramOutlined />
              </a>
              <a
                href="https://www.tiktok.com/@lemea.flagrance?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white transition-all duration-300 hover:bg-pink-500"
              >
                <TikTokOutlined />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61575000181053"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white transition-all duration-300 hover:bg-pink-500"
              >
                <FacebookOutlined />
              </a>
            </div>
          </div>

          {/* Kolona 2: Linket e Shpejta */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">{t('footer.links')}</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/produktet" className="text-slate-400 hover:text-pink-400 transition-colors text-sm font-medium">{t('nav.products')}</Link>
              </li>
              <li>
                <Link to="/rreth-nesh" className="text-slate-400 hover:text-pink-400 transition-colors text-sm font-medium">{t('nav.about')}</Link>
              </li>
              <li>
                <Link to="/kontakti" className="text-slate-400 hover:text-pink-400 transition-colors text-sm font-medium">{t('nav.contact')}</Link>
              </li>
            </ul>
          </div>

          {/* Kolona 3: Suporti & Ligjore */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">{t('footer.support')}</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/termsofservice" className="text-slate-400 hover:text-pink-400 transition-colors text-sm font-medium">{t('footer.terms')}</Link>
              </li>
              <li>
                <Link to="/privacypolicy" className="text-slate-400 hover:text-pink-400 transition-colors text-sm font-medium">{t('footer.privacy')}</Link>
              </li>
              <li>
                <Link to="/cart" className="text-slate-400 hover:text-pink-400 transition-colors text-sm font-medium">{t('footer.my_cart')}</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-4 flex flex-col items-center justify-between border-t border-slate-800 pt-8 md:flex-row">
          <p className="text-slate-500 text-sm">
            &copy; {currentYear} Lemea Flagrance. {t('footer.rights')}
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
