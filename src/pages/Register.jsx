import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { registerUser } from '../redux/authSlice';
import { message } from 'antd';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { status, error, user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    if (status === 'failed' && error) {
      message.error(error);
    }
    if (status === 'succeeded' && !user) {
      message.success(t('auth.success_register'));
      navigate('/login');
    }
  }, [user, status, error, navigate, t]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-[30px] p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 font-serif mb-2">{t('auth.register_title')}</h2>
          <p className="text-gray-500">{t('auth.register_subtitle')}</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.firstName')}</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                placeholder={t('auth.firstName')}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.lastName')}</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                placeholder={t('auth.lastName')}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              placeholder="emri@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-50 mt-4"
          >
            {status === 'loading' ? t('auth.registering') : t('auth.register_btn')}
          </button>
        </form>
        <div className="mt-8 text-center text-sm text-gray-500">
          {t('auth.have_account')}{' '}
          <Link to="/login" className="font-bold text-pink-500 hover:text-pink-600">
            {t('auth.login_here')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
