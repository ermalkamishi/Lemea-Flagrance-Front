import { Form, Input, Button, message } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, SendOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const onFinish = (values) => {
    console.log('Success:', values);
    message.success(t('contact.success_msg'));
    form.resetFields();
  };

  return (
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
            <div className="bg-pink-50 rounded-3xl p-8 flex flex-col gap-8 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/50 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

              <h2 className="text-2xl font-bold text-slate-900 z-10 relative">{t('contact.info_title')}</h2>

              <div className="flex items-start gap-4 z-10 relative">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-pink-500 shadow-sm">
                  <EnvironmentOutlined className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{t('contact.address_label')}</h3>
                  <p className="text-gray-600">{t('contact.address_val')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 z-10 relative">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-pink-500 shadow-sm">
                  <MailOutlined className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{t('contact.email_label')}</h3>
                  <p className="text-gray-600">lemea.fragrance@gmail.com</p>
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
  );
};

export default Contact;
