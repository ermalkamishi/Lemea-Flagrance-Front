import { HeartOutlined, StarOutlined, SafetyCertificateOutlined, SmileOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import AboutImg from '../assets/Victoria_Secret_LoveSpell_About.jpeg';

const Aboutus = () => {
  const { t } = useTranslation();
  const values = [
    { icon: <HeartOutlined />, title: t('about.values.passion_title'), desc: t('about.values.passion_desc') },
    { icon: <StarOutlined />, title: t('about.values.quality_title'), desc: t('about.values.quality_desc') },
    { icon: <SafetyCertificateOutlined />, title: t('about.values.security_title'), desc: t('about.values.security_desc') },
    { icon: <SmileOutlined />, title: t('about.values.happy_title'), desc: t('about.values.happy_desc') }
  ];

  return (
    <>
      <Helmet>
        <title>Rreth Nesh | Lemea Fragrance</title>
        <meta name="description" content="Mëso më shumë rreth Lemea Fragrance — misioni ynë, vlerat tona dhe angazhimi ynë ndaj cilësisë dhe autenticitetit të parfumeve." />
        <meta property="og:title" content="Rreth Nesh | Lemea Fragrance" />
        <meta property="og:description" content="Mëso më shumë rreth Lemea Fragrance — misioni ynë, vlerat tona dhe angazhimi ynë ndaj cilësisë dhe autenticitetit." />
        <meta property="og:url" content="https://www.lemeafragrance.shop/rreth-nesh" />
        <link rel="canonical" href="https://www.lemeafragrance.shop/rreth-nesh" />
      </Helmet>
    <div className="bg-slate-50 min-h-screen py-16 px-4">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto text-center mb-16 md:mb-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-800 mb-4 md:mb-6">{t('about.title')}</h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed px-4">
          {t('about.subtitle')}
        </p>
      </div>

      {/* Grid i Vlerave */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {values.map((v, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-pink-100 shadow-sm hover:shadow-xl hover:shadow-pink-100 transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-4xl text-pink-500 mb-4">{v.icon}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{v.title}</h3>
            <p className="text-gray-500 text-sm">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* Seksioni i Dyfishtë (Foto + Tekst) */}
      <div className="max-w-6xl mx-auto bg-white rounded-[3rem] overflow-hidden shadow-sm flex flex-col md:flex-row items-center border border-pink-50 mb-20">
        <div className="md:w-1/2 p-12 lg:p-16">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-800 mb-6">{t('about.detail_title')}</h2>
          <p className="text-gray-600 mb-6 leading-relaxed text-base">
            {t('about.detail_desc')}
          </p>
          <ul className="space-y-3 text-gray-700 text-base">
            <li>✓ {t('about.list_1')}</li>
            <li>✓ {t('about.list_2')}</li>
            <li>✓ {t('about.list_3')}</li>
          </ul>
        </div>
        <div className="md:w-1/2 h-80 md:h-[32rem] bg-white relative">
          {/* Këtu mund të vendosësh një foto të bukur të produkteve */}
          <img src={AboutImg} alt="About" className="w-full h-full object-contain p-4" />
        </div>
      </div>
    </div>
    </>
  );
};

export default Aboutus;
