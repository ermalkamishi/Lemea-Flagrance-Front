import React from 'react';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './NotFound.css';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>404 – Faqja nuk u gjet | Lemea Flagrance</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-lg mx-auto">
        
        {/* Numri 404 me efekt Gradient Rozë */}
        <h1 className="text-9xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-pink-600 floating-animation">
          404
        </h1>
        
        <h2 className="text-3xl font-semibold text-gray-800 mt-4 mb-2">
          {t('not_found.title')}
        </h2>
        
        <p className="text-gray-500 mb-8 text-lg">
          {t('not_found.desc')}
        </p>
        
        {/* Butoni për t'u kthyer mbrapsht */}
        <Link to="/">
          <Button 
            type="primary" 
            size="large" 
            icon={<HomeOutlined />}
            className="bg-pink-500 hover:bg-pink-600 border-none h-12 px-8 rounded-full shadow-lg shadow-pink-200 text-base font-medium transition-transform hover:-translate-y-1"
          >
            {t('not_found.back_home')}
          </Button>
        </Link>
        
      </div>
    </div>
    </>
  );
};

export default NotFound;