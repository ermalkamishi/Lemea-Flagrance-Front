import React, { useState } from 'react';
import { Form, Rate, Input, Button, message, Result } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiBase';
import { StarFilled, SendOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const ReviewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post(`${getApiBaseUrl()}/reviews`, values);
      
      setSubmitted(true);
      message.success(t('review_page.success_msg'));
      
      // Auto redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3500);
      
    } catch (error) {
      console.error('Review submission failed:', error);
      message.error(t('review_page.error_msg'));
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = () => {
    message.warning(t('review_page.required_rating'));
  };

  if (submitted) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-white p-4 overflow-hidden relative">
        {/* Background glow elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-100 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-50" />
        
        <div className="relative z-10 w-full max-w-2xl">
          <Result
            status="success"
            title={
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-serif tracking-tight">
                  {t('review_page.success_msg')}
                </h1>
                <div className="flex justify-center gap-1 text-2xl text-yellow-400">
                  <StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled />
                </div>
              </div>
            }
            subTitle={
              <div className="mt-6 space-y-2">
                <p className="text-xl text-gray-500 font-medium">{t('review_page.subtitle')}</p>
                <p className="text-sm text-pink-500 font-bold animate-pulse uppercase tracking-widest mt-8">
                  {t('review_page.redirecting')}
                </p>
              </div>
            }
            extra={[
              <Button 
                type="primary" 
                key="home" 
                onClick={() => navigate('/')}
                className="bg-slate-900 hover:bg-pink-500 h-16 px-12 rounded-2xl border-none font-bold text-lg shadow-xl hover:shadow-pink-500/20 transition-all"
              >
                {t('checkout.back_home')}
              </Button>
            ]}
            className="p-12 md:p-20"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 font-sans">
      <div className="max-w-xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-pink-500 transition-colors font-medium group"
        >
          <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" /> {t('checkout.back_home')}
        </button>

        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <StarFilled className="text-4xl text-pink-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 font-serif">{t('review_page.title')}</h1>
            <p className="text-gray-500 text-lg">
              {t('review_page.subtitle')}
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="name"
              label={<span className="font-bold text-gray-700">{t('review_page.name_label')}</span>}
              rules={[{ required: true, message: t('review_page.required_name') }]}
            >
              <Input 
                placeholder={t('review_page.name_placeholder')} 
                className="rounded-xl px-4 py-3 bg-gray-50 border-gray-200 hover:border-pink-300 focus:border-pink-500" 
              />
            </Form.Item>

            <Form.Item
              name="rating"
              label={<span className="font-bold text-gray-700">{t('review_page.rating_label')}</span>}
              rules={[{ required: true, message: t('review_page.required_rating') }]}
            >
              <Rate 
                className="text-4xl text-yellow-400 block" 
                character={<StarFilled />}
              />
            </Form.Item>

            <Form.Item
              name="comment"
              label={<span className="font-bold text-gray-700">{t('review_page.comment_label')}</span>}
            >
              <Input.TextArea 
                rows={4} 
                placeholder={t('review_page.comment_placeholder')} 
                className="rounded-xl px-4 py-3 bg-gray-50 border-gray-200 hover:border-pink-300 focus:border-pink-500" 
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full bg-slate-900 hover:bg-pink-500 text-white h-16 rounded-2xl font-bold text-lg mt-6 shadow-lg hover:shadow-pink-500/20 transition-all border-none flex items-center justify-center gap-3"
            >
              {t('review_page.submit_btn')} <SendOutlined />
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
