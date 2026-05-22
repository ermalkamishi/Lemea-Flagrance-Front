import React, { useState, useEffect } from 'react';
import { Form, Input, Radio, Button, Select, Divider, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SafetyCertificateOutlined, CheckCircleFilled, RocketOutlined, StarFilled } from '@ant-design/icons';
import { submitOrder, resetOrderStatus } from '../redux/ordersSlice';
import { clearCart, selectCartTotals } from '../redux/cartSlice';
import { getImageUrl } from '../utils/imageUtils';
import { GiftOutlined } from '@ant-design/icons';
import { toNumber } from '../utils/numberUtils';

const MACEDONIA_CITIES = [
  'Skopje', 'Bitola', 'Kumanovo', 'Prilep', 'Tetovo', 'Veles', 'Štip', 'Ohrid',
  'Gostivar', 'Strumica', 'Kavadarci', 'Kočani', 'Kičevo', 'Struga', 'Radoviš',
  'Gevgelija', 'Debar', 'Kriva Palanka', 'Sveti Nikole', 'Negotino', 'Delčevo',
  'Vinica', 'Berovo', 'Probištip', 'Valandovo', 'Kruševo', 'Demir Hisar',
  'Demir Kapija', 'Pehčevo', 'Makedonski Brod', 'Makedonska Kamenica'
];

const KOSOVA_CITIES = [
  'Prishtinë', 'Prizren', 'Pejë', 'Gjakovë', 'Mitrovicë', 'Gjilan', 'Ferizaj',
  'Vushtrri', 'Podujeva', 'Suharekë', 'Rahovec', 'Malishevë', 'Skenderaj',
  'Klinë', 'Istog', 'Deçan', 'Dragash', 'Kamenicë', 'Viti', 'Kaçanik',
  'Shtime', 'Lipjan', 'Obiliq', 'Fushë Kosovë', 'Drenas'
];

const Checkout = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const cartItems = useSelector((state) => state.cart.items);
  const { subtotal, discount, total, count } = useSelector(selectCartTotals);
  const { user } = useSelector((state) => state.auth);
  const { status: orderStatus, currentOrder, error: orderError } = useSelector((state) => state.orders);

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Watch selected city to calculate dynamic delivery fee
  const selectedCity = Form.useWatch('city', form);

  let shippingFee = 0;
  let shippingFeeLabel = null;

  if (selectedCity) {
    if (MACEDONIA_CITIES.includes(selectedCity)) {
      shippingFee = 150;
      shippingFeeLabel = <span className="font-bold text-slate-900 text-lg">150 {t('common.currency')}</span>;
    } else if (KOSOVA_CITIES.includes(selectedCity)) {
      shippingFee = 300; // 5 Euros represented as 300 Denars in the system
      shippingFeeLabel = <span className="font-bold text-slate-900 text-lg">310 {t('common.currency')} (5 €)</span>;
    } else {
      shippingFeeLabel = <span className="font-bold text-emerald-500 uppercase tracking-wider text-sm bg-emerald-100 px-2.5 py-1 rounded-md">{t('checkout.free')}</span>;
    }
  } else {
    shippingFeeLabel = <span className="text-gray-400 text-sm italic">{t('checkout.select_city_shipping', 'Zgjidhni qytetin për transport')}</span>;
  }

  // Pre-fill form with logged-in user's data
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user, form]);

  // Watch for successful order submission
  useEffect(() => {
    if (orderStatus === 'succeeded' && currentOrder) {
      setIsSuccess(true);
      dispatch(clearCart());
      dispatch(resetOrderStatus());
    }
    if (orderStatus === 'failed' && orderError) {
      message.error(orderError || t('checkout.error'));
    }
  }, [orderStatus, orderError, currentOrder, dispatch, t]);



  const onFinish = (values) => {
    let finalShippingFee = 0;
    if (values.city) {
      if (MACEDONIA_CITIES.includes(values.city)) {
        finalShippingFee = 150;
      } else if (KOSOVA_CITIES.includes(values.city)) {
        finalShippingFee = 300;
      }
    }

    const orderPayload = {
      userId: user?.id || user?.sub || null,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      city: values.city,
      address: values.address,
      paymentMethod: 'cod',
      totalAmount: total + finalShippingFee,
      items: cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        price: toNumber(item.price, 0),
        quantity: item.quantity,
        image: item.image,
      })),
    };
    dispatch(submitOrder(orderPayload));
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center max-w-2xl w-full">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircleFilled className="text-[60px] text-emerald-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-serif mb-6">{t('checkout.success_title')}</h1>
          <p className="text-xl text-gray-500 mb-10 leading-relaxed">
            {t('checkout.success_msg')}
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center mt-4">
            <Button
              className="!bg-gradient-to-r !from-slate-900 !to-slate-800 !hover:from-pink-600 !hover:to-rose-500 !text-white !border-none !h-16 !px-10 !rounded-2xl !font-bold !text-lg !shadow-xl !hover:shadow-pink-500/30 !hover:-translate-y-1 !transition-all !duration-300 flex items-center justify-center gap-3"
              onClick={() => navigate('/')}
            >
              <RocketOutlined className="text-xl" /> {t('checkout.back_home')}
            </Button>
            <Button
              className="!bg-white !border-2 !border-pink-500 !text-pink-600 !h-16 !px-10 !rounded-2xl !font-bold !text-lg !shadow-md !hover:shadow-lg !hover:bg-pink-50 !hover:border-pink-600 !transition-all !duration-300 flex items-center justify-center gap-3"
              onClick={() => navigate('/vleresim')}
            >
              <StarFilled className="text-xl" /> {t('review_page.title')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 font-sans">
        <h2 className="text-3xl font-bold text-slate-900 mb-6 font-serif">{t('checkout.empty')}</h2>
        <Button
          size="large"
          className="bg-slate-900 hover:bg-pink-500 text-white border-none rounded-xl h-14 px-8 font-bold text-lg transition-colors shadow-lg"
          onClick={() => navigate('/produktet')}
        >
          {t('checkout.back_products')}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-slate-900 font-serif mb-3">{t('checkout.title')}</h1>
          <p className="text-gray-500 text-lg">{t('checkout.subtitle')}</p>
          {user && (
            <p className="mt-2 text-sm text-emerald-600 font-medium">
              ✓ {t('checkout.logged_in_as')} {user.firstName} {user.lastName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Forma */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-lg shadow-sm border border-pink-200">1</span>
                {t('checkout.shipping')}
              </h2>

              <Form form={form} layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <Form.Item label={<span className="font-bold text-gray-700">{t('checkout.firstName')}</span>} name="firstName" rules={[{ required: true, message: t('checkout.required_field') }]}>
                    <Input placeholder={t('checkout.placeholder_fname')} className="rounded-xl px-4 py-3 bg-gray-50 border-gray-200 hover:border-pink-300 focus:border-pink-500 text-lg" />
                  </Form.Item>
                  <Form.Item label={<span className="font-bold text-gray-700">{t('checkout.lastName')}</span>} name="lastName" rules={[{ required: true, message: t('checkout.required_field') }]}>
                    <Input placeholder={t('checkout.placeholder_lname')} className="rounded-xl px-4 py-3 bg-gray-50 border-gray-200 hover:border-pink-300 focus:border-pink-500 text-lg" />
                  </Form.Item>
                </div>

                <Form.Item
                  label={<span className="font-bold text-gray-700">{t('checkout.phone')}</span>}
                  name="phone"
                  rules={[
                    { required: true, message: t('checkout.required_field') },
                    {
                      pattern: /^(?:(?:\+389|0)?7[0125678]\d{6}|(?:\+383|0)?4[3-9]\d{6})$/,
                      message: t('checkout.invalid_phone', 'Ju lutem shënoni një numër valid mobil MK ose KS (p.sh. 07XXXXXXXX ose 04XXXXXXXX)')
                    }
                  ]}
                >
                  <Input placeholder="+389 7X XXX XXX / +383 4X XXX XXX" className="rounded-xl px-4 py-3 bg-gray-50 border-gray-200 hover:border-pink-300 focus:border-pink-500 text-lg" />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <Form.Item label={<span className="font-bold text-gray-700">{t('checkout.city')}</span>} name="city" rules={[{ required: true, message: t('checkout.required_field') }]}>
                    <Select
                      showSearch
                      placeholder={t('checkout.placeholder_city')}
                      className="rounded-xl h-14 text-lg"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={[
                        {
                          label: '🇲🇰 Maqedonia e Veriut', options: [
                            { value: 'Skopje', label: 'Shkup (Skopje)' },
                            { value: 'Bitola', label: 'Manastir (Bitola)' },
                            { value: 'Kumanovo', label: 'Kumanovë (Kumanovo)' },
                            { value: 'Prilep', label: 'Prillep (Prilep)' },
                            { value: 'Tetovo', label: 'Tetovë (Tetovo)' },
                            { value: 'Veles', label: 'Veles' },
                            { value: 'Štip', label: 'Shtip (Štip)' },
                            { value: 'Ohrid', label: 'Ohër (Ohrid)' },
                            { value: 'Gostivar', label: 'Gostivar' },
                            { value: 'Strumica', label: 'Strumicë (Strumica)' },
                            { value: 'Kavadarci', label: 'Kavadarci' },
                            { value: 'Kočani', label: 'Koçan (Kočani)' },
                            { value: 'Kičevo', label: 'Kërçovë (Kičevo)' },
                            { value: 'Struga', label: 'Strugë (Struga)' },
                            { value: 'Radoviš', label: 'Radovish (Radoviš)' },
                            { value: 'Gevgelija', label: 'Gevgeli (Gevgelija)' },
                            { value: 'Debar', label: 'Dibër (Debar)' },
                            { value: 'Kriva Palanka', label: 'Kriva Pallankë' },
                            { value: 'Sveti Nikole', label: 'Shën Nikollë' },
                            { value: 'Negotino', label: 'Negotinë (Negotino)' },
                            { value: 'Delčevo', label: 'Delçevë (Delčevo)' },
                            { value: 'Vinica', label: 'Vinicë (Vinica)' },
                            { value: 'Berovo', label: 'Berovë (Berovo)' },
                            { value: 'Probištip', label: 'Probistip' },
                            { value: 'Valandovo', label: 'Valandovë (Valandovo)' },
                            { value: 'Kruševo', label: 'Krushevë (Kruševo)' },
                            { value: 'Demir Hisar', label: 'Demir Hisar' },
                            { value: 'Demir Kapija', label: 'Demir Kapija' },
                            { value: 'Pehčevo', label: 'Pehçevë (Pehčevo)' },
                            { value: 'Makedonski Brod', label: 'Makedonski Brod' },
                            { value: 'Makedonska Kamenica', label: 'Kamenicë Maqedonase' },
                          ]
                        },
                        {
                          label: '🇽🇰 Kosovë', options: [
                            { value: 'Prishtinë', label: 'Prishtinë' },
                            { value: 'Prizren', label: 'Prizren' },
                            { value: 'Pejë', label: 'Pejë' },
                            { value: 'Gjakovë', label: 'Gjakovë' },
                            { value: 'Mitrovicë', label: 'Mitrovicë' },
                            { value: 'Gjilan', label: 'Gjilan' },
                            { value: 'Ferizaj', label: 'Ferizaj' },
                            { value: 'Vushtrri', label: 'Vushtrri' },
                            { value: 'Podujeva', label: 'Podujeva' },
                            { value: 'Suharekë', label: 'Suharekë' },
                            { value: 'Rahovec', label: 'Rahovec' },
                            { value: 'Malishevë', label: 'Malishevë' },
                            { value: 'Skenderaj', label: 'Skenderaj' },
                            { value: 'Klinë', label: 'Klinë' },
                            { value: 'Istog', label: 'Istog' },
                            { value: 'Deçan', label: 'Deçan' },
                            { value: 'Dragash', label: 'Dragash' },
                            { value: 'Kamenicë', label: 'Kamenicë' },
                            { value: 'Viti', label: 'Viti' },
                            { value: 'Kaçanik', label: 'Kaçanik' },
                            { value: 'Shtime', label: 'Shtime' },
                            { value: 'Lipjan', label: 'Lipjan' },
                            { value: 'Obiliq', label: 'Obiliq' },
                            { value: 'Fushë Kosovë', label: 'Fushë Kosovë' },
                            { value: 'Drenas', label: 'Drenas' },
                          ]
                        },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label={<span className="font-bold text-gray-700">{t('checkout.address')}</span>} name="address" rules={[{ required: true, message: t('checkout.required_field') }]}>
                    <Input placeholder={t('checkout.placeholder_address')} className="rounded-xl px-4 py-3 bg-gray-50 border-gray-200 hover:border-pink-300 focus:border-pink-500 text-lg" />
                  </Form.Item>
                </div>

                <Divider className="my-10 border-gray-100" />

                <h2 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-4">
                  <span className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-lg shadow-sm border border-pink-200">1</span>
                  {t('checkout.payment')}
                </h2>

                <Form.Item name="paymentMethod" initialValue="cod">
                  <Radio.Group className="w-full">
                    <div className="border-[3px] border-pink-500 bg-pink-50/50 p-6 rounded-2xl flex items-center cursor-pointer transition-colors shadow-sm">
                      <Radio value="cod" className="payment-radio font-bold text-slate-900 text-xl w-full">
                        <div className="flex items-center justify-between w-full">
                          <span>{t('checkout.cod')}</span>
                          <SafetyCertificateOutlined className="text-pink-500 text-3xl drop-shadow-sm" />
                        </div>
                      </Radio>
                    </div>
                  </Radio.Group>
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={orderStatus === 'loading'}
                  className="w-full bg-slate-900 hover:bg-pink-500 text-white font-extrabold text-xl h-20 rounded-2xl mt-10 transition-all duration-300 shadow-xl hover:shadow-pink-500/30 hover:-translate-y-1 border-none flex items-center justify-center gap-3 uppercase tracking-wide cursor-pointer"
                >
                  {t('checkout.confirm')} <RocketOutlined className="text-2xl" />
                </Button>
              </Form>
            </div>
          </div>

          {/* Përmbledhja */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white p-6 md:p-8 rounded-[40px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-28">
              <div className="flex items-center justify-between lg:block">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-0 lg:mb-8 font-serif">{t('checkout.summary')}</h2>
                <button
                  onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                  className="lg:hidden text-pink-500 font-bold flex items-center gap-1 bg-pink-50 px-3 py-1 rounded-full text-sm"
                >
                  {isSummaryExpanded ? t('common.hide', 'Fshih') : t('common.show', 'Shfaq')} {count} {t('common.items', 'Produkte')}
                </button>
              </div>

              <div className={`${isSummaryExpanded ? 'block mt-8' : 'hidden lg:block'}`}>
                <div className="space-y-6 mb-8 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item) => {
                    return (
                      <div key={item.id} className="flex gap-5 items-center">
                        <div className="relative">
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-20 h-20 rounded-2xl object-cover border border-gray-100 shadow-sm" />
                          <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center border-[3px] border-white shadow-sm">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">{item.brand || item.category}</span>
                          <h4 className="font-bold text-base text-slate-900 line-clamp-2 mt-0.5 mb-1 leading-snug">{item.name}</h4>
                          <span className="text-pink-600 font-extrabold text-lg">{item.price.toLocaleString()} {t('common.currency')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Divider className="my-8 border-gray-100" />
              </div>

              <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex justify-between text-gray-600 text-lg">
                  <span className="font-medium">{t('checkout.subtotal')}</span>
                  <span className="font-bold text-slate-900">{subtotal.toLocaleString()} {t('common.currency')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-pink-600 text-lg">
                    <span className="font-medium flex items-center gap-2">
                      <GiftOutlined /> {t('common.discount', 'Zbritja (3 për 999)')}
                    </span>
                    <span className="font-bold">-{discount.toLocaleString()} {t('common.currency')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 text-lg">
                  <span className="font-medium">{t('checkout.shipping_cost')}</span>
                  {shippingFeeLabel}
                </div>
              </div>

              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-slate-900">{t('checkout.total')}</span>
                <div className="text-right">
                  <span className="text-4xl font-black text-pink-600 tracking-tight">
                    {(total + shippingFee).toLocaleString()} <span className="text-2xl">{t('common.currency')}</span>
                  </span>
                  {selectedCity && KOSOVA_CITIES.includes(selectedCity) && (
                    <div className="text-xs text-gray-500 font-bold mt-1">
                      (Përafërsisht {Math.round((total + shippingFee) / 61.5)} €)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;