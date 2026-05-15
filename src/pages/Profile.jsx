import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, Avatar, List, Tag, Empty, Spin } from 'antd';
import { UserOutlined, ShoppingOutlined, LogoutOutlined } from '@ant-design/icons';
import { logout } from '../redux/authSlice';
import { getImageUrl } from '../utils/imageUtils';
import { getApiBaseUrl } from '../utils/apiBase';

const Profile = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  if (!user) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 font-serif">{t('profile.title')}</h1>
          <p className="text-gray-500">{t('profile.welcome')}, {user.firstName}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="md:col-span-1">
            <Card className="rounded-3xl shadow-sm border-gray-100 overflow-hidden">
              <div className="flex flex-col items-center text-center p-4">
                <Avatar size={80} icon={<UserOutlined />} className="bg-pink-100 text-pink-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-900">{user.firstName} {user.lastName}</h2>
                <p className="text-gray-500 text-sm mb-6">{user.email}</p>
                <button
                  onClick={() => dispatch(logout())}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors font-semibold"
                >
                  <LogoutOutlined /> {t('profile.logout')}
                </button>
              </div>
            </Card>
          </div>

          {/* Orders History */}
          <div className="md:col-span-2">
            <Card title={<div className="flex items-center gap-2"><ShoppingOutlined className="text-pink-500" /><span>{t('profile.orders')}</span></div>} className="rounded-3xl shadow-sm border-gray-100">
              {loading ? (
                <div className="flex justify-center py-12"><Spin size="large" /></div>
              ) : orders.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={orders}
                  renderItem={(order) => (
                    <List.Item className="border-b border-gray-50 last:border-0 py-6">
                      <div className="w-full">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">{t('profile.order_id')} #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString(i18n.language === 'sq' ? 'sq-AL' : 'mk-MK')}</p>
                          </div>
                          <Tag color={order.status === 'delivered' ? 'success' : 'processing'} className="rounded-full px-3 py-0.5 border-none font-bold uppercase text-[10px]">
                            {order.status}
                          </Tag>
                        </div>
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <img src={getImageUrl(item.image)} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</p>
                                <p className="text-xs text-gray-400">{item.quantity} x {item.price.toLocaleString()} {t('common.currency')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">{t('profile.total')}:</span>
                          <span className="text-lg font-black text-pink-600">{order.totalAmount.toLocaleString()} {t('common.currency')}</span>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description={t('profile.no_orders')} className="py-12" />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
