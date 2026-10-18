import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Kushtet e Shërbimit | Lemea Flagrance</title>
        <meta name="description" content="Kushtet e shërbimit të Lemea Flagrance — të drejtat dhe detyrimet tuaja si klient gjatë blerjeve online." />
        <meta property="og:title" content="Kushtet e Shërbimit | Lemea Flagrance" />
        <meta property="og:url" content="https://lemeaflagrance.shop/termsofservice" />
        <link rel="canonical" href="https://lemeaflagrance.shop/termsofservice" />
      </Helmet>
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border-t-8 border-pink-600">
        <div className="p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
            {t('legal.terms_title')} - <span className="text-pink-600">Lemea</span>
          </h1>

          <div className="space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 uppercase tracking-wide">{t('legal.terms_sec1_title')}</h2>
              <p>
                {t('legal.terms_sec1_p1')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 uppercase tracking-wide">{t('legal.terms_sec2_title')}</h2>
              <p>
                {t('legal.terms_sec2_p1')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 uppercase tracking-wide">{t('legal.terms_sec3_title')}</h2>
              <p>
                {t('legal.terms_sec3_p1')}
              </p>
            </section>

            <section className="bg-pink-50 p-6 rounded-lg border-l-4 border-pink-600">
              <h2 className="text-xl font-semibold text-pink-700 mb-3 uppercase tracking-wide">{t('legal.terms_sec4_title')}</h2>
              <p>
                {t('legal.terms_sec4_p1')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 uppercase tracking-wide">{t('legal.terms_sec5_title')}</h2>
              <p>
                {t('legal.terms_sec5_p1')}
              </p>
            </section>

            <section className="pt-8 border-t">
              <p className="font-medium text-gray-900 italic">
                {t('contact.subtitle')}: 
                <a href="mailto:lemea.fragrance@gmail.com" className="ml-2 text-pink-600 hover:underline">
                  lemea.fragrance@gmail.com
                </a>
              </p>
              <p className="text-xs text-gray-500 mt-4">{t('contact.location_label')}: Shkup, Maqedonia e Veriut</p>
            </section>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default TermsOfService;