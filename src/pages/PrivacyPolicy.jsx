import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <header className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{t('legal.privacy_title')}</h1>
          <p className="text-gray-500 text-lg">{t('legal.privacy_subtitle')}</p>
        </header>

        <div className="space-y-10 text-gray-600 leading-relaxed">
          <section>
            <p className="mb-6">{t('legal.privacy_intro')}</p>
            <p>{t('legal.privacy_data')}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">{t('legal.privacy_sec1_title')}</h2>
            <p>{t('legal.privacy_sec1_p1')}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">{t('legal.privacy_sec2_title')}</h2>
            <p>{t('legal.privacy_sec2_p1')}</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>{t('legal.privacy_sec2_li1')}</li>
              <li>{t('legal.privacy_sec2_li2')}</li>
              <li>{t('legal.privacy_sec2_li3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">{t('legal.privacy_sec3_title')}</h2>
            <p>{t('legal.privacy_sec3_p1')}</p>
          </section>

          <section className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{t('legal.privacy_sec4_title')}</h2>
            <p>{t('legal.privacy_sec4_p1')}</p>
          </section>

          <section>
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
              <Link to="/contact">
                <Button type="primary" className="rounded-xl h-12 px-8 font-bold bg-pink-600 border-none">
                  {t('nav.contact')}
                </Button>
              </Link>
              <Link to="/">
                <Button className="rounded-xl h-12 px-8 font-bold text-gray-600 border-gray-200">
                  {t('checkout.back_home')}
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;