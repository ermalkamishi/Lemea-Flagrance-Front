import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { loginUser } from '../redux/authSlice';
import { message } from 'antd';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  }, [user, status, error, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-[30px] p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 font-serif mb-2">{t('auth.login_title')}</h2>
          <p className="text-gray-500">{t('auth.login_subtitle')}</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              placeholder="emri@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {status === 'loading' ? t('auth.logging_in') : t('auth.login_btn')}
          </button>
        </form>
        <div className="mt-8 text-center text-sm text-gray-500">
          {t('auth.no_account')}{' '}
          <Link to="/register" className="font-bold text-pink-500 hover:text-pink-600">
            {t('auth.register_here')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
