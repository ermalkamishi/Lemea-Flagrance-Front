import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Badge, Drawer, Button, Input, Avatar, Dropdown, Space } from 'antd';
import { ShoppingCartOutlined, MenuOutlined, SearchOutlined, UserOutlined, GlobalOutlined, DownOutlined, CheckOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { logout } from '../redux/authSlice';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const showDrawer = () => setIsMobileMenuOpen(true);
  const closeDrawer = () => setIsMobileMenuOpen(false);

  const cartItems = useSelector((state) => state.cart.items);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleSearch = (e) => {
    if (e && e.target && typeof e.target.blur === 'function') {
      e.target.blur();
    }
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    if (searchQuery.trim()) {
      navigate(`/produktet?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      closeDrawer();
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const supportedLangs = ['SQ', 'MK'];
  const rawLang = (i18n.language || 'sq').split('-')[0].toUpperCase();
  const currentLang = supportedLangs.includes(rawLang) ? rawLang : 'SQ';

  const langMenuItems = [
    {
      key: 'sq',
      label: (
        <div className="flex items-center justify-between min-w-[80px] font-bold py-1">
          <span>SQ</span>
          {currentLang === 'SQ' && <CheckOutlined className="text-pink-500" />}
        </div>
      ),
      onClick: () => changeLanguage('sq'),
    },
    {
      key: 'mk',
      label: (
        <div className="flex items-center justify-between min-w-[80px] font-bold py-1">
          <span>MK</span>
          {currentLang === 'MK' && <CheckOutlined className="text-pink-500" />}
        </div>
      ),
      onClick: () => changeLanguage('mk'),
    },
  ];

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.products'), path: '/produktet' },
    { name: t('nav.about'), path: '/rreth-nesh' },
    { name: t('nav.contact'), path: '/kontakti' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Menuja për Celular & Logo */}
          <div className="flex items-center md:hidden">
            <Button
              type="text"
              icon={<MenuOutlined className="text-xl text-gray-700" />}
              onClick={showDrawer}
            />
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <Link to="/" className="flex items-center gap-2 group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 sm:w-7 sm:h-7 text-pink-500 group-hover:text-pink-600 transition-colors"
              >
                <path d="M10 4h4M12 4v6M8 10h8l2 10H6l2-10zM12 14v4" />
              </svg>
              <span className="font-serif text-xl sm:text-2xl font-bold text-gray-800 tracking-wider">
                Lemea
              </span>
            </Link>
          </div>

          {/* Navigimi për Desktop */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-base font-medium transition-colors duration-200 ${isActive
                    ? 'text-pink-500 border-b-2 border-pink-500 pb-1'
                    : 'text-gray-600 hover:text-pink-400'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Kërkimi & Shporta për Desktop */}
          <div className="flex items-center gap-2 lg:gap-4">

            {/* Language Switcher */}
            <Dropdown
              menu={{ items: langMenuItems }}
              placement="bottomRight"
              trigger={['click']}
              overlayClassName="lang-dropdown"
            >
              <Button
                type="text"
                className="flex items-center gap-1.5 px-3 h-10 rounded-xl border border-gray-100 hover:bg-gray-50 bg-white shadow-sm transition-all"
              >
                <GlobalOutlined className="text-gray-500 text-lg" />
                <span className="font-bold text-gray-700">{currentLang}</span>
                <DownOutlined className="text-[10px] text-gray-400" />
              </Button>
            </Dropdown>

            {/* Shiriti i Kërkimit (Vetëm në Desktop/Tablet) */}
            <div className="hidden md:block w-40 lg:w-56 header-search">
              <Input
                placeholder={t('nav.products') + "..."}
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
              />
            </div>

            {/* Profili/Login */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  {user.role === 'admin' && (
                    <Link to="/admin" className="hidden lg:inline-block px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-pink-500 transition-all uppercase tracking-widest">
                      {t('nav.admin')}
                    </Link>
                  )}
                  <Link to="/profili" className="flex items-center gap-2 group">
                    <Avatar size="small" icon={<UserOutlined />} className="bg-pink-100 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all" />
                    <span className="hidden lg:block text-sm font-medium text-gray-700 group-hover:text-pink-500 transition-colors">{t('nav.profile')}, {user.firstName}</span>
                  </Link>
                  <div className="hidden lg:block p-2 rounded-full hover:bg-pink-50 transition-colors duration-200 cursor-pointer" onClick={() => dispatch(logout())}>
                    <span className="text-xs text-pink-500 font-bold ml-1">{t('nav.logout')}</span>
                  </div>
                </div>
              ) : (
                <Link to="/login">
                  <div className="p-2 rounded-full hover:bg-pink-50 transition-colors duration-200 cursor-pointer flex items-center gap-1">
                    <UserOutlined className="text-xl text-gray-700 hover:text-pink-500 transition-colors" />
                    <span className="hidden lg:block text-sm font-medium text-gray-700">{t('nav.login')}</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Shporta */}
            <Link to="/cart">
              <Badge count={cartItemCount} showZero color="#ec4899">
                <div className="p-2 rounded-full hover:bg-pink-50 transition-colors duration-200 cursor-pointer">
                  <ShoppingCartOutlined className="text-2xl text-gray-700 hover:text-pink-500 transition-colors" />
                </div>
              </Badge>
            </Link>

          </div>

        </div>
      </div>

      {/* Mobile Sticky Search Bar (Always visible under header on mobile for best UX) */}
      <div className="block md:hidden px-4 pb-3 pt-1 border-t border-gray-100/70 bg-white/95">
        <Input
          placeholder={t('nav.search_placeholder', 'Kërko produkte, marka...')}
          prefix={<SearchOutlined className="text-pink-500 text-base mr-1.5" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onPressEnter={handleSearch}
          allowClear
          className="rounded-2xl border-pink-200/80 bg-slate-50 hover:bg-white focus:bg-white text-sm shadow-inner py-2"
        />
      </div>

      {/* Menuja anësore për Celular */}
      <Drawer
        title={<span className="font-serif text-xl font-bold text-gray-800">Lemea</span>}
        placement="left"
        onClose={closeDrawer}
        open={isMobileMenuOpen}
        width={280}
        className="mobile-drawer"
      >
        <div className="flex flex-col h-full pt-2">

          {/* Linket e Navigimit */}
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={closeDrawer}
                className={({ isActive }) =>
                  `text-lg font-medium p-3 rounded-lg transition-colors ${isActive
                    ? 'bg-pink-50 text-pink-500'
                    : 'text-gray-700 hover:bg-pink-50 hover:text-pink-400'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={closeDrawer}
              className="mt-4 block rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-pink-500"
            >
              {t('nav.admin')}
            </Link>
          )}

          {/* Auth links in mobile drawer */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            {user ? (
              <div className="space-y-2">
                <Link to="/profili" onClick={closeDrawer} className="block text-lg font-medium p-3 rounded-lg text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors">
                  {t('nav.profile')} <span className="text-pink-500 font-bold">{user.firstName}</span>
                </Link>
                <button
                  onClick={() => { dispatch(logout()); closeDrawer(); }}
                  className="w-full text-left text-lg font-medium p-3 rounded-lg text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <NavLink to="/login" onClick={closeDrawer} className="block text-lg font-medium p-3 rounded-lg text-gray-700 hover:bg-pink-50 hover:text-pink-400 transition-colors">
                  {t('nav.login')}
                </NavLink>
                <NavLink to="/register" onClick={closeDrawer} className="block text-lg font-bold p-3 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors text-center">
                  {t('nav.register')}
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};

export default Header;