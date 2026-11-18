import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Form, Input, message, ConfigProvider } from 'antd';
import {
  MailOutlined,
  EnvironmentOutlined,
  SendOutlined,
  InstagramOutlined,
  TikTokOutlined,
  FacebookOutlined,
  CopyOutlined,
  CheckCircleFilled,
  LoadingOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getApiBaseUrl } from '../utils/apiBase';
import axios from 'axios';
import { CONTACT_EMAIL, SOCIAL } from '../config/social';

const INSTAGRAM_URL = SOCIAL.instagram.url;
const INSTAGRAM_HANDLE = SOCIAL.instagram.handle;
const TIKTOK_URL = SOCIAL.tiktok.url;
const TIKTOK_HANDLE = SOCIAL.tiktok.handle;
const FACEBOOK_URL = SOCIAL.facebook.url;
const FACEBOOK_NAME = SOCIAL.facebook.handle;
const MESSAGE_MAX = 2000;

// Brand theme for the form only (pink focus/borders, rounded inputs)
const formTheme = {
  token: {
    colorPrimary: '#ec4899',
    borderRadius: 14,
    controlHeightLG: 50,
    fontSizeLG: 15,
    colorBorder: '#e5e7eb',
    colorBgContainer: '#f9fafb',
  },
};

const Contact = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const topicsRaw = t('contact.topics', { returnObjects: true });
  const topics = Array.isArray(topicsRaw) ? topicsRaw : [];

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const apiUrl = getApiBaseUrl();
      await axios.post(`${apiUrl}/contact`, values);
      form.resetFields();
      setSelectedTopic(null);
      setSent(true);
    } catch (error) {
      console.error('Contact Error:', error);
      // 429 = rate limit: show the server's friendly message ("try again in a few minutes")
      const serverMsg = error?.response?.status === 429 ? error.response.data?.message : null;
      message.error(serverMsg || t('checkout.error'));
    } finally {
      setLoading(false);
    }
  };

  const pickTopic = (topic) => {
    setSelectedTopic(topic);
    form.setFieldsValue({ subject: topic });
    form.validateFields(['subject']).catch(() => {});
  };

  const copyEmail = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      message.success(t('contact.copied'));
    } catch {
      // Clipboard not available (old browser / insecure context): ignore silently
    }
  };

  const infoItems = [
    {
      key: 'email',
      icon: <MailOutlined />,
      label: t('contact.email_label'),
      value: (() => {
        const [user, domain] = CONTACT_EMAIL.split('@');
        return <>{user}@<wbr />{domain}</>;
      })(),
      hint: t('contact.email_hint'),
      href: `mailto:${CONTACT_EMAIL}`,
      action: (
        <button
          type="button"
          onClick={copyEmail}
          className="shrink-0 text-xs font-bold text-pink-600 bg-white hover:bg-pink-100 border border-pink-100 rounded-lg px-2.5 py-1.5 flex items-center gap-1 transition-colors cursor-pointer"
          aria-label={t('contact.copy_email')}
        >
          <CopyOutlined /> <span className="hidden sm:inline">{t('contact.copy_email')}</span>
        </button>
      ),
    },
    {
      key: 'instagram',
      icon: <InstagramOutlined />,
      label: t('contact.instagram_label'),
      value: INSTAGRAM_HANDLE,
      hint: t('contact.instagram_hint'),
      href: INSTAGRAM_URL,
      external: true,
    },
    {
      key: 'tiktok',
      icon: <TikTokOutlined />,
      label: t('contact.tiktok_label'),
      value: TIKTOK_HANDLE,
      hint: t('contact.tiktok_hint'),
      href: TIKTOK_URL,
      external: true,
    },
    {
      key: 'facebook',
      icon: <FacebookOutlined />,
      label: t('contact.facebook_label'),
      value: FACEBOOK_NAME,
      hint: t('contact.facebook_hint'),
      href: FACEBOOK_URL,
      external: true,
    },
    {
      key: 'location',
      icon: <EnvironmentOutlined />,
      label: t('contact.address_label'),
      value: t('contact.address_val'),
      hint: t('contact.location_hint'),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Kontakti | Lemea Flagrance</title>
        <meta name="description" content="Na kontakto për çdo pyetje rreth porosive, produkteve ose dorëzimeve. Jemi këtu për të ndihmuar!" />
        <meta property="og:title" content="Kontakti | Lemea Flagrance" />
        <meta property="og:description" content="Na kontakto për çdo pyetje rreth porosive, produkteve ose dorëzimeve. Jemi këtu për të ndihmuar!" />
        <meta property="og:url" content="https://lemeaflagrance.shop/kontakti" />
        <link rel="canonical" href="https://lemeaflagrance.shop/kontakti" />
      </Helmet>
      <div className="bg-slate-50 min-h-screen py-12 md:py-16 font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-10 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 font-serif">{t('contact.title')}</h1>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto">{t('contact.subtitle')}</p>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] gap-6 lg:gap-8 bg-white rounded-[32px] p-4 sm:p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">

            {/* Left: contact info */}
            <aside className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-900 via-slate-800 to-pink-900 p-6 sm:p-8 text-white flex flex-col">
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-pink-500/30 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-rose-400/20 rounded-full blur-3xl pointer-events-none"></div>

              <h2 className="relative text-2xl md:text-3xl font-black mb-6">{t('contact.info_title')}</h2>

              <ul className="relative space-y-3">
                {infoItems.map((item) => {
                  const content = (
                    <>
                      <span className="w-11 h-11 rounded-xl bg-white/10 group-hover:bg-pink-500 flex items-center justify-center shrink-0 text-lg text-pink-300 group-hover:text-white transition-colors">
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">{item.label}</span>
                        <span className="block font-semibold text-white [overflow-wrap:anywhere] sm:[overflow-wrap:normal]">{item.value}</span>
                        <span className="block text-xs text-slate-400 mt-0.5">{item.hint}</span>
                      </span>
                      {item.action}
                    </>
                  );
                  const cls = 'group flex items-center gap-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-3 transition-colors';
                  return (
                    <li key={item.key}>
                      {item.href ? (
                        <a
                          href={item.href}
                          className={`${cls} cursor-pointer`}
                          style={{ color: 'inherit' }}
                          {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {content}
                        </a>
                      ) : (
                        <div className={cls}>{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Right: form or success state */}
            <section className="py-2 lg:py-4 lg:pr-4">
              {sent ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
                    <CheckCircleFilled className="text-5xl text-emerald-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">{t('contact.success_title')}</h2>
                  <p className="text-gray-500 max-w-md mb-8">{t('contact.success_text')}</p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="font-bold text-pink-600 hover:text-pink-700 flex items-center gap-2 cursor-pointer"
                  >
                    {t('contact.send_another')} <ArrowRightOutlined />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-900 mb-5">{t('contact.form_title')}</h2>

                  <ConfigProvider theme={formTheme}>
                    <Form
                      form={form}
                      name="contact"
                      layout="vertical"
                      onFinish={onFinish}
                      size="large"
                      requiredMark={false}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        <Form.Item
                          name="name"
                          label={<span className="font-semibold text-gray-700">{t('contact.name_label')}</span>}
                          rules={[{ required: true, whitespace: true, message: t('contact.required_name') }]}
                        >
                          <Input placeholder={t('contact.name_placeholder')} autoComplete="name" maxLength={100} />
                        </Form.Item>

                        <Form.Item
                          name="email"
                          label={<span className="font-semibold text-gray-700">{t('contact.email_label')}</span>}
                          rules={[
                            { required: true, message: t('contact.required_email') },
                            { type: 'email', message: t('contact.invalid_email') },
                          ]}
                        >
                          <Input placeholder={t('contact.email_placeholder')} type="email" autoComplete="email" maxLength={150} />
                        </Form.Item>
                      </div>

                      {/* Quick topic chips fill the subject field */}
                      {topics.length > 0 && (
                        <div className="mb-3">
                          <span className="block font-semibold text-gray-700 mb-2">{t('contact.topic_label')}</span>
                          <div className="flex flex-wrap gap-2">
                            {topics.map((topic) => {
                              const active = selectedTopic === topic;
                              return (
                                <button
                                  key={topic}
                                  type="button"
                                  onClick={() => pickTopic(topic)}
                                  aria-pressed={active}
                                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                                    active
                                      ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/25'
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-600'
                                  }`}
                                >
                                  {topic}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <Form.Item
                        name="subject"
                        label={<span className="font-semibold text-gray-700">{t('contact.subject_label')}</span>}
                        rules={[{ required: true, whitespace: true, message: t('contact.required_subject') }]}
                      >
                        <Input
                          placeholder={t('contact.subject_placeholder')}
                          maxLength={150}
                          onChange={(e) => setSelectedTopic(topics.includes(e.target.value) ? e.target.value : null)}
                        />
                      </Form.Item>

                      <Form.Item
                        name="message"
                        label={<span className="font-semibold text-gray-700">{t('contact.message_label')}</span>}
                        rules={[{ required: true, whitespace: true, message: t('contact.required_message') }]}
                      >
                        <Input.TextArea
                          autoSize={{ minRows: 5, maxRows: 10 }}
                          placeholder={t('contact.message_placeholder')}
                          maxLength={MESSAGE_MAX}
                          showCount
                        />
                      </Form.Item>

                      <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full md:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-pink-600 disabled:opacity-70 disabled:cursor-wait text-white font-bold h-13 px-8 py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5 cursor-pointer"
                      >
                        {t('contact.send_btn')} {loading ? <LoadingOutlined /> : <SendOutlined />}
                      </button>
                    </Form>
                  </ConfigProvider>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
