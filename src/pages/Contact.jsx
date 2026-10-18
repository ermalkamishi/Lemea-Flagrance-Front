import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined, EnvironmentOutlined, SendOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getApiBaseUrl } from '../utils/apiBase';
import axios from 'axios';

const Contact = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const apiUrl = getApiBaseUrl();
      await axios.post(`${apiUrl}/contact`, values);
      message.success(t('contact.success_msg'));
      form.resetFields();
    } catch (error) {
      console.error('Contact Error:', error);
      message.error(t('checkout.error'));
    } finally {
      setLoading(false);
    }
  };

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
    <div className="bg-slate-50 min-h-screen py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 font-serif">{t('contact.title')}</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 bg-white rounded-[40px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">

          {/* Majtas - Informacioni i Kontaktit */}
          <div className="w-full lg:w-1/3 space-y-8">
            <div className="bg-pink-50 rounded-[40px] p-10 md:p-12 flex flex-col gap-10 h-full relative overflow-hidden shadow-sm border border-pink-100">
              <div className="absolute top-0 right-0 w-48 h-48 bg-pink-200/40 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4"></div>

              <h2 className="text-3xl md:text-4xl font-black text-slate-900 z-10 relative mb-2">{t('contact.info_title')}</h2>

              <div className="flex items-center gap-6 z-10 relative group">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 text-pink-500 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <EnvironmentOutlined className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg mb-1">{t('contact.address_label')}</h3>
                  <p className="text-gray-600 font-medium text-base leading-relaxed">{t('contact.address_val')}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 z-10 relative group">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 text-pink-500 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <MailOutlined className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg mb-1">{t('contact.email_label')}</h3>
                  <p className="text-gray-600 font-medium text-base leading-relaxed break-all">lemea.fragrance@gmail.com</p>
                </div>
              </div>

            </div>
          </div>

          {/* Djathtas - Forma e Kontaktit */}
          <div className="w-full lg:w-2/3">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('contact.form_title')}</h2>

            <Form
              form={form}
              name="contact"
              layout="vertical"
              onFinish={onFinish}
              size="large"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item
                  name="name"
                  label={<span className="font-semibold text-gray-700">{t('contact.name_label')}</span>}
                  rules={[{ required: true, message: t('contact.required_name') }]}
                >
                  <Input placeholder={t('contact.name_placeholder')} className="rounded-xl px-4 py-3 bg-gray-50 border-gray-200 hover:border-pink-300 focus:border-pink-500" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={<span className="font-semibold text-gray-700">{t('contact.email_label')}</span>}
                  rules={[
                    { required: true, message: t('contact.required_email') },
                    { type: 'email', message: t('contact.invalid_email') }
                  ]}
                >
                  <Input placeholder={t('contact.email_placeholder')} className="rounded-xl px-4 py-3 bg-gray-50 border-gray-200 hover:border-pink-300 focus:border-pink-500" />
                </Form.Item>
              </div>

              <Form.Item
                name="subject"
                label={<span className="font-semibold text-gray-700">{t('contact.subject_label')}</span>}
                rules={[{ required: true, message: t('contact.required_subject') }]}
              >
                <Input placeholder={t('contact.subject_placeholder')} className="rounded-xl px-4 py-3 bg-gray-50 border-gray-200 hover:border-pink-300 focus:border-pink-500" />
              </Form.Item>

              <Form.Item
                name="message"
                label={<span className="font-semibold text-gray-700">{t('contact.message_label')}</span>}
                rules={[{ required: true, message: t('contact.required_message') }]}
              >
                <Input.TextArea rows={5} placeholder={t('contact.message_placeholder')} className="rounded-xl px-4 py-3 bg-gray-50 border-gray-200 hover:border-pink-300 focus:border-pink-500" />
              </Form.Item>

              <Form.Item className="mb-0 mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="bg-slate-900 hover:bg-pink-600 text-white font-bold h-14 px-8 rounded-xl w-full md:w-auto flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/30 hover:-translate-y-1 border-none"
                >
                  {t('contact.send_btn')} <SendOutlined />
                </Button>
              </Form.Item>
            </Form>
          </div>

        </div>
      </div>
    </div>
    </>
  );
};

export default Contact;
