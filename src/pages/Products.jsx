import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Select, Input, Checkbox, Slider, Badge, Drawer, Button as AntButton } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addToCart } from '../redux/cartSlice';
import { getImageUrl } from '../utils/imageUtils';
import { toNumber } from '../utils/numberUtils';
import { SearchOutlined, FilterOutlined, ShoppingCartOutlined, FireOutlined, GiftOutlined, CheckCircleFilled } from '@ant-design/icons';
import { getApiBaseUrl } from '../utils/apiBase';

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const allProducts = useSelector(state => state.products.items) || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  const apiUrl = getApiBaseUrl();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    const catParam = params.get('category');
    
    if (search) setSearchTerm(search);
    if (catParam) {
      setCategory(catParam);
    } else {
      setCategory(t('products.categories.all'));
    }
  }, [location.search, t]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${apiUrl}/categories`);
        const data = await res.json();
        setCategories(data);
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    };
    fetchCategories();
  }, [apiUrl]);

  const [category, setCategory] = useState(t('products.categories.all'));
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('trending');
  const [visibleCount, setVisibleCount] = useState(9);
  const [priceRange, setPriceRange] = useState([0, 40000]);
  const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);



  const getCategoryLabel = (catName) => {
    if (!catName || catName === t('products.categories.all')) return catName;
    const keyMap = {
      'Parfume': 'perfumes',
      'Body Mist': 'body_spray',
      'P\u00ebr meshkuj': 'men',
      'Rhode Lipgloss': 'lipgloss'
    };
    const key = keyMap[catName] || catName.toLowerCase().replace(/ /g, '_');
    const translated = t(`home.categories.${key}`);
    return translated !== `home.categories.${key}` ? translated : catName;
  };

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchTerm) result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (category !== t('products.categories.all')) {
      result = result.filter(p => p.category === category);
    }

    if (inStockOnly) result = result.filter(p => p.inStock);

    result = result.filter(
      (p) => toNumber(p.price, 0) >= priceRange[0] && toNumber(p.price, 0) <= priceRange[1],
    );

    if (sortBy === 'price_asc') result.sort((a, b) => toNumber(a.price, 0) - toNumber(b.price, 0));
    if (sortBy === 'price_desc') result.sort((a, b) => toNumber(b.price, 0) - toNumber(a.price, 0));
    if (sortBy === 'trending') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return result;
  }, [searchTerm, category, inStockOnly, sortBy, priceRange, allProducts, t]);

  const handleProductClick = (id) => {
    navigate(`/produktet/${id}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 pt-8 font-sans">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
          <div className="relative z-10 max-w-lg">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 font-serif">{t('products.title')}</h1>
            <p className="text-pink-50 text-lg opacity-90 leading-relaxed">{t('products.subtitle')}</p>
          </div>
          <FireOutlined className="text-[150px] absolute -right-10 opacity-20 rotate-12" />
          <div className="w-64 h-64 bg-white/10 rounded-full absolute -top-20 -left-20 blur-3xl pointer-events-none"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">

        {/* Mobile Filter Button */}
        <div className="lg:hidden flex justify-between items-center mb-6">
          <AntButton
            icon={<FilterOutlined />}
            onClick={() => setIsFilterDrawerVisible(true)}
            className="flex items-center gap-2 h-12 rounded-2xl font-bold border-pink-200 text-pink-600 px-6"
          >
            {t('products.filter_title')}
          </AntButton>
          <div className="text-gray-500 font-medium text-sm">
            {filteredProducts.length} {t('products.all_products')}
          </div>
        </div>

        {/* Sidebar me Filtra (Desktop) */}
        <div className="hidden lg:block w-full lg:w-1/4">
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-gray-800">
              <FilterOutlined className="text-xl text-pink-500" />
              <h3 className="font-bold text-lg">{t('products.filter_title')}</h3>
            </div>

            <div className="mb-6">
              <Input
                size="large"
                placeholder={t('products.search')}
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value === '' && location.search) {
                    navigate('/produktet', { replace: true });
                  }
                }}
                className="rounded-2xl hover:border-pink-300 focus:border-pink-500 py-2"
              />
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">{t('products.category')}</h4>
              <Select
                value={category}
                size="large"
                className="w-full"
                onChange={setCategory}
                options={[
                  { value: t('products.categories.all'), label: t('products.categories.all') },
                  ...categories.map(cat => ({ value: cat.name, label: getCategoryLabel(cat.name) }))
                ]}
              />
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">{t('products.price')}</h4>
              <Slider
                range
                min={0}
                max={40000}
                step={500}
                value={priceRange}
                onChange={(val) => setPriceRange(val)}
                trackStyle={[{ backgroundColor: '#ec4899' }]}
                handleStyle={[{ borderColor: '#ec4899', backgroundColor: '#fff' }, { borderColor: '#ec4899', backgroundColor: '#fff' }]}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2 font-medium">
                <span>{priceRange[0].toLocaleString()} {t('common.currency')}</span>
                <span>{priceRange[1].toLocaleString()} {t('common.currency')}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">{t('products.sort')}</h4>
              <Select
                value={sortBy}
                size="large"
                className="w-full"
                onChange={setSortBy}
                options={[
                  { value: 'trending', label: t('products.sorting.trending') },
                  { value: 'price_asc', label: t('products.sorting.price_asc') },
                  { value: 'price_desc', label: t('products.sorting.price_desc') }
                ]}
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Checkbox checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="text-gray-700 font-medium">
                {t('products.stock_only')}
              </Checkbox>
            </div>
          </div>
        </div>

        {/* Filter Drawer (Mobile) */}
        <Drawer
          title={<span className="font-bold text-lg text-gray-800 flex items-center gap-2"><FilterOutlined className="text-pink-500" /> {t('products.filter_title')}</span>}
          placement="right"
          onClose={() => setIsFilterDrawerVisible(false)}
          open={isFilterDrawerVisible}
          width="85%"
          className="mobile-filter-drawer"
          extra={
            <AntButton type="text" onClick={() => {
              setSearchTerm('');
              setCategory(t('products.categories.all'));
              setPriceRange([0, 40000]);
              setSortBy('trending');
              setInStockOnly(false);
            }} className="text-pink-500 font-bold">
              Të Gjitha
            </AntButton>
          }
        >
          <div className="space-y-8 pb-10">
            <div>
              <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-widest">{t('products.search')}</h4>
              <Input
                size="large"
                placeholder={t('products.search')}
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-2xl py-3"
              />
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-widest">{t('products.category')}</h4>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: t('products.categories.all'), label: t('products.categories.all') }, ...categories.map(cat => ({ value: cat.name, label: getCategoryLabel(cat.name) }))].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setCategory(opt.value)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${category === opt.value ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-widest">{t('products.price')}</h4>
              <div className="px-2">
                <Slider
                  range
                  min={0}
                  max={40000}
                  step={500}
                  value={priceRange}
                  onChange={(val) => setPriceRange(val)}
                  trackStyle={[{ backgroundColor: '#ec4899' }]}
                  handleStyle={[{ borderColor: '#ec4899', backgroundColor: '#fff', width: 24, height: 24 }, { borderColor: '#ec4899', backgroundColor: '#fff', width: 24, height: 24 }]}
                />
              </div>
              <div className="flex justify-between font-bold text-slate-900 mt-4 px-1">
                <span>{priceRange[0].toLocaleString()} {t('common.currency')}</span>
                <span>{priceRange[1].toLocaleString()} {t('common.currency')}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-widest">{t('products.sort')}</h4>
              <div className="space-y-2">
                {[
                  { value: 'trending', label: t('products.sorting.trending') },
                  { value: 'price_asc', label: t('products.sorting.price_asc') },
                  { value: 'price_desc', label: t('products.sorting.price_desc') }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`w-full px-4 py-4 rounded-2xl text-left font-bold flex justify-between items-center ${sortBy === opt.value ? 'bg-pink-50 text-pink-600 border-2 border-pink-500' : 'bg-gray-50 text-gray-600 border-2 border-transparent'}`}
                  >
                    {opt.label}
                    {sortBy === opt.value && <CheckCircleFilled />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="font-bold text-gray-700">{t('products.stock_only')}</span>
              <Checkbox checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="transform scale-150" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t border-gray-100 z-50">
            <AntButton
              type="primary"
              block
              size="large"
              onClick={() => setIsFilterDrawerVisible(false)}
              className="h-14 bg-slate-900 text-white font-bold rounded-2xl border-none text-lg"
            >
              Shiko {filteredProducts.length} Produkte
            </AntButton>
          </div>
        </Drawer>

        {/* Lista e Produkteve */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {t('products.all_products')} <span className="text-pink-500 text-lg font-medium ml-2 bg-pink-50 px-3 py-1 rounded-full">{filteredProducts.length}</span>
            </h2>
          </div>

          {/* Offer Banner */}
          <div className="mb-10 group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-rose-500 to-orange-400 rounded-[35px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-xl flex flex-col md:flex-row items-center p-2">
              <div className="bg-gradient-to-br from-pink-600 to-rose-500 p-8 md:p-10 text-white w-full md:w-3/5 rounded-[28px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShoppingCartOutlined className="text-[120px] -rotate-12" />
                </div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-1.5 rounded-full mb-6 animate-bounce">
                  <span className="text-xs font-bold tracking-widest uppercase">{t('common.offer', 'OFERTË SPECIALE')}</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                  {t('home.hero_slides.offer_title1', '3 Body Mist')} <br />
                  <span className="text-yellow-300">{t('home.hero_slides.offer_title2', 'Vetëm 999 Den')}</span>
                </h3>
                <p className="text-white/90 text-lg font-medium max-w-sm mb-0">
                  {t('products.offer_text', 'Kombino 3 Body Mist-et tuaja të preferuara dhe përfito zbritjen automatikisht në shportë.')}
                </p>
              </div>
              <div className="w-full md:w-2/5 p-8 flex flex-col items-center justify-center text-center">
                <div className="mb-4">
                  <div className="flex -space-x-4 mb-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-16 h-16 rounded-full bg-gray-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                        <GiftOutlined className="text-2xl text-pink-500" />
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setCategory('Body Mist')}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-pink-600 transition-all duration-300 shadow-xl hover:shadow-pink-500/20 active:scale-95"
                >
                  {t('products.choose_now', 'Zgjidh Tani')}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredProducts.slice(0, visibleCount).map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-gray-100/60 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(236,72,153,0.3)] transition-all duration-500 group flex flex-col relative"
              >
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {product.discount && (
                    <Badge count={product.discount} style={{ backgroundColor: '#f43f5e', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  )}
                  {product.isNew && (
                    <Badge count={t('products.new')} style={{ backgroundColor: '#10b981', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  )}
                </div>

                {/* Imazhi */}
                <div
                  className="relative aspect-[4/5] overflow-hidden bg-gray-50 cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {!product.inStock || product.stockQuantity === 0 ? (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-slate-900/90 text-white font-bold px-5 py-2.5 rounded-xl uppercase tracking-wider text-sm shadow-xl">{t('products.out_of_stock')}</span>
                    </div>
                  ) : null}
                </div>

                {/* Info */}
                <div className="p-3 sm:p-6 flex flex-col flex-grow">
                  <span className="text-[10px] sm:text-xs font-bold text-pink-500 uppercase tracking-widest mb-1 sm:mb-2 block">{product.category}</span>
                  <h3
                    className="font-bold text-gray-800 text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-2 cursor-pointer hover:text-pink-600 transition-colors leading-snug"
                    onClick={() => handleProductClick(product.id)}
                  >
                    {currentLang === 'mk' && product.name_mk ? product.name_mk : product.name}
                  </h3>

                  <div className="mt-auto pt-2 sm:pt-4 flex items-end justify-between">
                    <div>
                      {product.oldPrice && (
                        <span className="text-gray-400 line-through text-[10px] sm:text-sm block font-medium mb-0.5">
                          {toNumber(product.oldPrice, 0).toLocaleString()} {t('common.currency')}
                        </span>
                      )}
                      <span className="text-slate-900 font-extrabold text-lg sm:text-2xl tracking-tight">
                        {toNumber(product.price, 0).toLocaleString()} <span className="text-sm sm:text-lg font-bold">{t('common.currency')}</span>
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); dispatch(addToCart(product)); }}
                      disabled={!product.inStock || product.stockQuantity === 0}
                      className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-base sm:text-xl transition-all duration-300 shadow-sm cursor-pointer
                        ${product.inStock && product.stockQuantity > 0 ? 'bg-slate-900 text-white hover:bg-pink-500 hover:shadow-lg hover:shadow-pink-500/30 hover:-translate-y-1 cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                      `}
                    >
                      <ShoppingCartOutlined />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 mt-6">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FilterOutlined className="text-4xl text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{t('products.no_products')}</h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">{t('products.subtitle')}</p>
              <button
                onClick={() => { setSearchTerm(''); setCategory(t('products.categories.all')); setPriceRange([0, 40000]); setInStockOnly(false); }}
                className="mt-8 bg-pink-50 text-pink-600 font-bold px-8 py-3 rounded-xl hover:bg-pink-100 transition-colors"
              >
                {t('products.clear_filters')}
              </button>
            </div>
          )}

          {visibleCount < filteredProducts.length && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisibleCount(v => v + 6)}
                className="bg-transparent border-[3px] border-slate-900 text-slate-900 px-10 py-3.5 rounded-full font-bold text-lg cursor-pointer hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                {t('products.load_more')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
