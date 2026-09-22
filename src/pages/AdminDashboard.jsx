import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Layout, Menu, Card, Row, Col, Statistic, Table, Button, Modal,
  Form, Input, Select, InputNumber, Upload, message, Tag, Space,
  Typography, Popconfirm, Avatar, Drawer, ConfigProvider, Empty, Grid,
  Tooltip, Badge, Spin
} from 'antd';
import {
  DashboardOutlined, ShoppingOutlined, OrderedListOutlined, StarOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, UserOutlined,
  UploadOutlined, LogoutOutlined, MenuOutlined, AppstoreOutlined,
  ReloadOutlined, SearchOutlined, FilterOutlined, CheckCircleOutlined,
  WarningOutlined, ClockCircleOutlined, CrownOutlined,
  ArrowUpOutlined, TagOutlined, FireOutlined, EyeOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../redux/authSlice';
import { getImageUrl } from '../utils/imageUtils';
import { getApiBaseUrl } from '../utils/apiBase';
import { fetchProducts as fetchProductsGlobal } from '../redux/productsSlice';
import { useTranslation } from 'react-i18next';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const THEME_PINK = '#ec4899';
const THEME_LIGHT_PINK = '#fce7f3';
const THEME_DARK = '#0f172a';

const statusTagColor = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'delivered' || s === 'completed' || s === 'kryer') return { color: 'success', text: 'Kryer' };
  if (s === 'cancelled' || s === 'canceled' || s === 'anuluar') return { color: 'error', text: 'Anuluar' };
  if (s === 'pending' || s === 'në pritje') return { color: 'warning', text: 'Në pritje' };
  if (s === 'processing' || s === 'shipped' || s === 'në proces') return { color: 'processing', text: 'Në proces' };
  return { color: 'default', text: status || 'N/A' };
};

// ─── Sidebar ────────────────────────────────────────────────────────────────
function AdminSidebar({ activeTab, menuItems, onMenuSelect, onShopNavigate, onLogout, ordersCount, productsCount }) {
  const { t } = useTranslation();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#ffffff',
      borderRight: '1px solid #f1f5f9'
    }}>
      {/* Brand Header */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(236,72,153,0.3)', flexShrink: 0,
          }}>
            <ShoppingOutlined style={{ color: '#fff', fontSize: 22 }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: THEME_DARK, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Lemea
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{
                background: '#fce7f3', color: '#db2777', fontWeight: 700,
                fontSize: 10, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                ADMIN PANEL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div style={{ flex: 1, padding: '16px 12px 0', overflowY: 'auto' }}>
        <div style={{ padding: '0 12px 8px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          MENAXHIMI
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => onMenuSelect(key)}
          style={{ border: 'none', background: 'transparent' }}
          items={menuItems.map(item => ({
            ...item,
            style: {
              borderRadius: 12,
              marginBottom: 4,
              fontWeight: activeTab === item.key ? 700 : 500,
              fontSize: 14,
            }
          }))}
        />
      </div>

      {/* System Quick Status & Back to Shop */}
      <div style={{ padding: 16, borderTop: '1px solid #f8fafc', background: '#fafafa' }}>
        <div style={{
          background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12,
          padding: '12px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Sistemi Online</span>
          </div>
          <Tag color="pink" style={{ border: 0, fontSize: 10, fontWeight: 700, borderRadius: 8 }}>v1.2</Tag>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button
            block
            icon={<ShoppingOutlined />}
            onClick={onShopNavigate}
            style={{
              borderRadius: 12, height: 40,
              borderColor: '#fce7f3', color: '#64748b',
              fontWeight: 600, transition: 'all 0.2s ease',
              background: '#fff'
            }}
            className="hover:border-pink-300 hover:text-pink-600"
          >
            {t('admin.back_to_shop', 'Kthehu te Dyqani')}
          </Button>

          <Button
            block
            danger
            icon={<LogoutOutlined />}
            onClick={onLogout}
            style={{
              borderRadius: 12, height: 40,
              fontWeight: 600, transition: 'all 0.2s ease',
            }}
          >
            {t('nav.logout', 'Dil (Logout)')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const isCompact = !screens.md;

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter states
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [productStockFilter, setProductStockFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Product modal
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Category modal
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();

  const apiUrl = getApiBaseUrl();

  const pageTitle = useMemo(() => {
    if (activeTab === 'overview') return t('admin.overview', 'Përmbledhja');
    if (activeTab === 'products') return t('admin.inventory', 'Inventari i Produkteve');
    if (activeTab === 'categories') return t('admin.categories', 'Kategoritë');
    return t('admin.orders', 'Porositë');
  }, [activeTab, t]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    message.info('Ju keni dalë me sukses nga paneli i administratorit.');
    navigate('/login');
  }, [dispatch, navigate]);

  const handleAuthError = useCallback((err) => {
    if (err?.response?.status === 401) {
      message.error('Seanca juaj ka skaduar! Ju lutem kyçuni përsëri.');
      dispatch(logout());
      navigate('/login');
    }
  }, [dispatch, navigate]);

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (e) {
      console.error(e);
      handleAuthError(e);
    }
  }, [token, apiUrl, handleAuthError]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/products`);
      setProducts(res.data);
    } catch (e) { console.error(e); }
  }, [apiUrl]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (e) {
      console.error(e);
      handleAuthError(e);
    }
  }, [token, apiUrl, handleAuthError]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/categories`);
      setCategories(res.data);
    } catch (e) { console.error(e); }
  }, [apiUrl]);

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchStats(), fetchProducts(), fetchOrders(), fetchCategories()]);
      message.success('Të dhënat u rifreskuan me sukses');
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      message.error('Qasje e refuzuar. Vetëm për administratorët.');
      navigate('/');
      return;
    }
    fetchStats();
    fetchProducts();
    fetchOrders();
    fetchCategories();
  }, [user, navigate, fetchStats, fetchProducts, fetchOrders, fetchCategories]);

  // ── Filtered Data Memoization ─────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !productSearchQuery ||
        p.name?.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(productSearchQuery.toLowerCase());

      const matchesCategory = !productCategoryFilter || p.category === productCategoryFilter;

      let matchesStock = true;
      const stock = p.stockQuantity ?? 0;
      if (productStockFilter === 'instock') matchesStock = stock > 0;
      if (productStockFilter === 'outstock') matchesStock = stock === 0;
      if (productStockFilter === 'low') matchesStock = stock > 0 && stock < 5;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, productSearchQuery, productCategoryFilter, productStockFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = !orderSearchQuery ||
        String(o.id).toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        `${o.firstName} ${o.lastName}`.toLowerCase().includes(orderSearchQuery.toLowerCase());

      const matchesStatus = orderStatusFilter === 'all' ||
        (o.status || '').toLowerCase() === orderStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearchQuery, orderStatusFilter]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => (p.stockQuantity ?? 0) < 5);
  }, [products]);

  // ── Open product modal ────────────────────────────────────────────────────
  const openProductModal = useCallback((product = null) => {
    setEditingProduct(product);
    setFileList([]);
    if (product) {
      form.setFieldsValue({
        name: product.name,
        name_mk: product.name_mk,
        price: Number(product.price),
        oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
        quantity: product.stockQuantity,
        category: product.category,
        brand: product.brand,
        description: product.description,
        description_mk: product.description_mk,
        rating: product.rating ? Number(product.rating) : 0,
        reviewsCount: product.reviewsCount ? Number(product.reviewsCount) : 0,
      });
    } else {
      form.resetFields();
    }
    setIsProductModalVisible(true);
  }, [form]);

  // ── Submit product (create or update) ─────────────────────────────────────
  const handleProductSubmit = useCallback(async (values) => {
    setSubmittingProduct(true);
    try {
      const formData = new FormData();

      formData.append('name', values.name);
      formData.append('price', values.price);

      if (values.oldPrice !== undefined && values.oldPrice !== null && values.oldPrice !== '') {
        formData.append('oldPrice', values.oldPrice);
        const pct = Math.round((1 - values.price / values.oldPrice) * 100);
        if (pct > 0) formData.append('discount', `-${pct}%`);
      }
      if (values.quantity !== undefined && values.quantity !== null) {
        formData.append('stockQuantity', values.quantity);
        formData.append('inStock', values.quantity > 0 ? 'true' : 'false');
      }
      if (values.category) formData.append('category', values.category);
      if (values.brand) formData.append('brand', values.brand);
      if (values.description) formData.append('description', values.description);
      if (values.name_mk) formData.append('name_mk', values.name_mk);
      if (values.description_mk) formData.append('description_mk', values.description_mk);
      if (values.rating !== undefined && values.rating !== null) formData.append('rating', values.rating);
      if (values.reviewsCount !== undefined && values.reviewsCount !== null) formData.append('reviewsCount', values.reviewsCount);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editingProduct) {
        await axios.patch(`${apiUrl}/products/${editingProduct.id}`, formData, config);
        message.success(t('admin.product_updated', 'Produkt u përditësua me sukses!'));
      } else {
        await axios.post(`${apiUrl}/products`, formData, config);
        message.success(t('admin.product_added', 'Produkti u shtua me sukses!'));
      }

      setIsProductModalVisible(false);
      setFileList([]);
      fetchProducts();
      dispatch(fetchProductsGlobal());
      fetchStats();
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
        handleAuthError(err);
      } else {
        message.error(t('admin.save_failed', 'Dështoi ruajtja e produktit'));
      }
    } finally {
      setSubmittingProduct(false);
    }
  }, [editingProduct, fileList, token, apiUrl, fetchProducts, fetchStats, dispatch, handleAuthError, t]);

  // ── Delete product ────────────────────────────────────────────────────────
  const handleDeleteProduct = useCallback(async (id) => {
    try {
      await axios.delete(`${apiUrl}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success(t('admin.product_deleted', 'Produkti u fshi me sukses'));
      fetchProducts();
      fetchStats();
    } catch {
      message.error(t('admin.delete_failed', 'Dështoi fshirja'));
    }
  }, [token, apiUrl, fetchProducts, fetchStats, t]);

  // ── Category handlers ─────────────────────────────────────────────────────
  const handleCategorySubmit = useCallback(async (values) => {
    try {
      if (editingCategory) {
        await axios.patch(`${apiUrl}/categories/${editingCategory.id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success(t('admin.category_updated', 'Kategoria u përditësua'));
      } else {
        await axios.post(`${apiUrl}/categories`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success(t('admin.category_added', 'Kategoria u shtua'));
      }
      setIsCategoryModalVisible(false);
      fetchCategories();
    } catch {
      message.error(t('admin.save_failed', 'Dështoi ruajtja'));
    }
  }, [editingCategory, token, apiUrl, fetchCategories, t]);

  const handleDeleteCategory = useCallback(async (id) => {
    try {
      await axios.delete(`${apiUrl}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success(t('admin.category_deleted', 'Kategoria u fshi'));
      fetchCategories();
    } catch {
      message.error(t('admin.delete_failed', 'Dështoi fshirja'));
    }
  }, [token, apiUrl, fetchCategories, t]);

  // ── Menu items ────────────────────────────────────────────────────────────
  const menuItems = [
    {
      key: 'overview',
      icon: <DashboardOutlined style={{ fontSize: 18 }} />,
      label: t('admin.overview', 'Përmbledhja')
    },
    {
      key: 'products',
      icon: <ShoppingOutlined style={{ fontSize: 18 }} />,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span>{t('admin.inventory', 'Inventari')}</span>
          <Badge count={products.length} overflowCount={999} style={{ backgroundColor: '#ec4899', fontSize: 10 }} />
        </div>
      )
    },
    {
      key: 'categories',
      icon: <AppstoreOutlined style={{ fontSize: 18 }} />,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span>{t('admin.categories', 'Kategoritë')}</span>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{categories.length}</span>
        </div>
      )
    },
    {
      key: 'orders',
      icon: <OrderedListOutlined style={{ fontSize: 18 }} />,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span>{t('admin.orders', 'Porositë')}</span>
          <Badge count={orders.length} overflowCount={999} style={{ backgroundColor: '#06b6d4', fontSize: 10 }} />
        </div>
      )
    },
  ];

  // ── Product Table Columns ──────────────────────────────────────────────────
  const productColumns = useMemo(() => [
    {
      title: 'Produkt',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, overflow: 'hidden',
            border: '1px solid #f1f5f9', background: '#f8fafc', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <img
              src={getImageUrl(record.image)}
              alt={record.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div>
            <Text strong style={{ color: THEME_DARK, fontSize: 14, display: 'block', lineHeight: 1.3 }}>
              {record.name}
            </Text>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              {record.brand && (
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '1px 6px', borderRadius: 6 }}>
                  {record.brand}
                </span>
              )}
              {record.category && (
                <span style={{ fontSize: 11, color: '#db2777', fontWeight: 600, background: '#fce7f3', padding: '1px 6px', borderRadius: 6 }}>
                  {record.category}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t('products.price', 'Çmimi'),
      dataIndex: 'price',
      width: 140,
      render: (p, record) => (
        <div>
          <div style={{ fontWeight: 700, color: '#db2777', fontSize: 15 }}>
            {Number(p)?.toLocaleString()} {t('common.currency', 'DEN')}
          </div>
          {record.oldPrice && (
            <div style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'line-through' }}>
              {Number(record.oldPrice)?.toLocaleString()} {t('common.currency', 'DEN')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Stoku',
      dataIndex: 'stockQuantity',
      width: 130,
      responsive: ['sm'],
      render: (q) => {
        const stock = q ?? 0;
        if (stock === 0) {
          return <Tag color="error" style={{ borderRadius: 12, border: 0, fontWeight: 700 }}>Jashtë stokut (0)</Tag>;
        }
        if (stock < 5) {
          return <Tag color="warning" style={{ borderRadius: 12, border: 0, fontWeight: 700 }}>Ulët ({stock})</Tag>;
        }
        return <Tag color="success" style={{ borderRadius: 12, border: 0, fontWeight: 700 }}>Në stok ({stock})</Tag>;
      },
    },
    {
      title: 'Vlerësimi',
      dataIndex: 'rating',
      width: 110,
      responsive: ['md'],
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <StarOutlined style={{ color: '#f59e0b', fontSize: 14 }} />
          <Text strong style={{ fontSize: 13 }}>{r ? Number(r).toFixed(1) : '5.0'}</Text>
        </div>
      ),
    },
    {
      title: 'Veprimet',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Edito">
            <Button
              type="text"
              icon={<EditOutlined style={{ fontSize: 16, color: '#64748b' }} />}
              style={{ background: '#f8fafc', borderRadius: 8 }}
              onClick={() => openProductModal(record)}
            />
          </Tooltip>
          <Tooltip title="Fshij">
            <Popconfirm
              title="A jeni i sigurt që doni ta fshini?"
              okText="Po, fshij"
              cancelText="Anulo"
              okButtonProps={{ danger: true, style: { borderRadius: 8 } }}
              cancelButtonProps={{ style: { borderRadius: 8 } }}
              onConfirm={() => handleDeleteProduct(record.id)}
            >
              <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: 16 }} />} style={{ background: '#fef2f2', borderRadius: 8 }} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ], [t, openProductModal, handleDeleteProduct]);

  // ── Order Table Columns ────────────────────────────────────────────────────
  const orderColumns = useMemo(() => [
    {
      title: 'ID Porosisë',
      dataIndex: 'id',
      width: 120,
      render: (id) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: 6 }}>
          #{String(id).slice(-8)}
        </span>
      ),
    },
    {
      title: 'Klienti',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size={34} style={{ background: '#fce7f3', color: '#db2777', fontWeight: 700, fontSize: 13 }}>
            {r.firstName?.[0] || 'U'}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: 14, color: THEME_DARK, display: 'block', lineHeight: 1.2 }}>
              {r.firstName} {r.lastName}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r.city || r.phone || '—'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Data',
      dataIndex: 'createdAt',
      width: 130,
      responsive: ['md'],
      render: (d) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {new Date(d).toLocaleDateString('sq-AL', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
      ),
    },
    {
      title: t('checkout.total', 'Shuma'),
      dataIndex: 'totalAmount',
      width: 130,
      align: 'right',
      render: (t_val) => (
        <Text strong style={{ color: '#db2777', fontSize: 15 }}>
          {t_val != null ? `${Number(t_val).toLocaleString()} ${t('common.currency', 'DEN')}` : '—'}
        </Text>
      ),
    },
    {
      title: 'Statusi',
      dataIndex: 'status',
      width: 120,
      render: (s) => {
        const { color, text } = statusTagColor(s);
        return (
          <Tag color={color} style={{ borderRadius: 20, border: 0, fontWeight: 700, fontSize: 11, padding: '2px 10px' }}>
            {text}
          </Tag>
        );
      },
    },
  ], [t]);

  // ── Stat Cards Config ──────────────────────────────────────────────────────
  const statCards = [
    {
      label: t('admin.revenue', 'Të ardhurat totale'),
      val: stats?.totalRevenue ? `${Number(stats.totalRevenue).toLocaleString()} ${t('common.currency', 'DEN')}` : '0 DEN',
      badgeText: '+14% këtë muaj',
      badgeColor: '#10b981',
      icon: <DollarOutlined />,
      bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    },
    {
      label: t('admin.orders', 'Gjithsej Porosi'),
      val: stats?.totalOrders ?? '0',
      badgeText: 'Porosi aktive',
      badgeColor: '#ec4899',
      icon: <OrderedListOutlined />,
      bgGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    },
    {
      label: t('admin.inventory', 'Produkte në Inventar'),
      val: stats?.totalProducts ?? '0',
      badgeText: lowStockProducts.length > 0 ? `${lowStockProducts.length} stok i ulët` : 'Stok optimal',
      badgeColor: lowStockProducts.length > 0 ? '#f59e0b' : '#06b6d4',
      icon: <ShoppingOutlined />,
      bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    },
    {
      label: t('review_page.title', 'Vlerësimet e Dyqanit'),
      val: stats?.totalReviews ?? '0',
      badgeText: '4.9 ★ Pozitive',
      badgeColor: '#f59e0b',
      icon: <StarOutlined />,
      bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: THEME_PINK,
          borderRadiusLG: 16,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        },
        components: {
          Menu: {
            itemSelectedBg: THEME_LIGHT_PINK,
            itemHoverBg: '#fff1f2',
            itemSelectedColor: '#db2777',
            itemColor: '#475569',
          },
          Card: {
            headerBg: 'transparent',
          },
          Table: {
            headerBg: '#f8fafc',
            headerColor: '#475569',
            rowHoverBg: '#fff1f2',
          },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>

        {/* Desktop Sidebar — fixed left */}
        {screens.lg && (
          <Sider
            width={270}
            theme="light"
            style={{
              position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100,
              boxShadow: '2px 0 16px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
            }}
          >
            <AdminSidebar
              activeTab={activeTab}
              menuItems={menuItems}
              onMenuSelect={(key) => { setActiveTab(key); setMobileMenuOpen(false); }}
              onShopNavigate={() => navigate('/')}
              onLogout={handleLogout}
              ordersCount={orders.length}
              productsCount={products.length}
            />
          </Sider>
        )}

        {/* Mobile Drawer */}
        <Drawer
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={270}
          styles={{ body: { padding: 0 } }}
        >
          <AdminSidebar
            activeTab={activeTab}
            menuItems={menuItems}
            onMenuSelect={(key) => { setActiveTab(key); setMobileMenuOpen(false); }}
            onShopNavigate={() => navigate('/')}
            onLogout={handleLogout}
            ordersCount={orders.length}
            productsCount={products.length}
          />
        </Drawer>

        {/* Main Content Area */}
        <Layout style={{ marginLeft: screens.lg ? 270 : 0, background: 'transparent', minHeight: '100vh' }}>

          {/* Sticky Top Header */}
          <Header style={{
            position: 'sticky', top: 0, zIndex: 90,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid #f1f5f9',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            height: 72, padding: '0 28px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {!screens.lg && (
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setMobileMenuOpen(true)}
                  style={{ fontSize: 18, color: '#475569', borderRadius: 8 }}
                />
              )}
              <div>
                <div style={{ fontWeight: 800, fontSize: 19, color: THEME_DARK, lineHeight: 1.2 }}>
                  {pageTitle}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                  Paneli zyrtar i administrimit Lemea Fragrance
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Refresh Button */}
              <Tooltip title="Rifresko të dhënat">
                <Button
                  type="text"
                  icon={<ReloadOutlined spin={refreshing} />}
                  onClick={handleRefreshAll}
                  style={{ color: '#64748b', borderRadius: 10, background: '#f8fafc' }}
                />
              </Tooltip>

              {/* Admin Profile Info */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#f8fafc', padding: '6px 14px', borderRadius: 30,
                border: '1px solid #f1f5f9'
              }}>
                <Avatar
                  size={36}
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: '#fff', fontWeight: 700 }}
                />
                {screens.sm && (
                  <div style={{ textAlign: 'left', paddingRight: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: THEME_DARK, lineHeight: 1.1 }}>
                      {user?.firstName || 'Master'}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#db2777', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Super Admin
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Header>

          {/* Body Content */}
          <Content style={{ padding: isCompact ? '20px 16px' : '28px 32px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Hero Greeting Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
                  borderRadius: 20, padding: '24px 28px',
                  border: '1px solid #fce7f3',
                  boxShadow: '0 4px 20px rgba(236,72,153,0.05)',
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <CrownOutlined style={{ color: '#ec4899', fontSize: 20 }} />
                      <Title level={3} style={{ margin: 0, fontSize: 22, color: THEME_DARK, fontWeight: 800 }}>
                        {t('admin.welcome', 'Mirë se erdhe përsëri')}{user?.firstName ? `, ${user.firstName}` : ''}! 👋
                      </Title>
                    </div>
                    <Paragraph style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                      Këtu mund të monitoroni porositë live, të menaxhoni inventarin dhe të kontrolloni statistikat.
                    </Paragraph>
                  </div>

                  <Space size={12}>
                    <Button
                      type="primary" size="large"
                      icon={<PlusOutlined />}
                      style={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                        border: 'none', borderRadius: 12, fontWeight: 700, height: 44,
                        boxShadow: '0 4px 14px rgba(236,72,153,0.3)'
                      }}
                      onClick={() => openProductModal(null)}
                    >
                      Shto Produkt të Ri
                    </Button>
                  </Space>
                </div>

                {/* 4 Stat Cards */}
                <Row gutter={[16, 16]}>
                  {statCards.map((item, i) => (
                    <Col xs={24} sm={12} xl={6} key={i}>
                      <Card
                        bordered={false}
                        style={{
                          borderRadius: 20, background: '#ffffff',
                          border: '1px solid #f1f5f9',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                              {item.label}
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 24, color: THEME_DARK, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                              {item.val}
                            </div>
                            <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 4, background: `${item.badgeColor}15`, color: item.badgeColor, padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                              {item.badgeText}
                            </div>
                          </div>

                          <div style={{
                            width: 50, height: 50, borderRadius: 16,
                            background: item.bgGradient, color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)'
                          }}>
                            {item.icon}
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Main Tables Row */}
                <Row gutter={[20, 20]}>
                  {/* Recent Orders */}
                  <Col xs={24} xl={16}>
                    <Card
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '4px 0' }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: THEME_DARK }}>
                            Porositë e Fundit
                          </span>
                          <Button
                            type="link"
                            style={{ color: '#ec4899', fontWeight: 700, padding: 0 }}
                            onClick={() => setActiveTab('orders')}
                          >
                            Shiko të gjitha ({orders.length}) →
                          </Button>
                        </div>
                      }
                      bordered={false}
                      style={{ borderRadius: 20, background: '#ffffff', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}
                    >
                      <Table
                        dataSource={orders.slice(0, 6)}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        scroll={{ x: 'max-content' }}
                        locale={{ emptyText: <Empty description="Nuk ka porosi të fundit" /> }}
                        columns={orderColumns}
                      />
                    </Card>
                  </Col>

                  {/* Low Stock & Quick Info */}
                  <Col xs={24} xl={8}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                      {/* Low Stock Alert Card */}
                      <Card
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <WarningOutlined style={{ color: '#f59e0b', fontSize: 18 }} />
                            <span style={{ fontWeight: 800, fontSize: 15, color: THEME_DARK }}>
                              Cilësimet e Stokut Ulët ({lowStockProducts.length})
                            </span>
                          </div>
                        }
                        bordered={false}
                        style={{ borderRadius: 20, background: '#ffffff', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}
                      >
                        {lowStockProducts.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '24px 0', color: '#10b981' }}>
                            <CheckCircleOutlined style={{ fontSize: 28, marginBottom: 8 }} />
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Gjithçka në stok!</div>
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>Të gjitha produktet kanë stok të mjaftueshëm.</div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {lowStockProducts.slice(0, 4).map((item) => (
                              <div
                                key={item.id}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                  padding: '10px 12px', background: '#fff1f2', borderRadius: 12, border: '1px solid #fce7f3'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
                                  />
                                  <div>
                                    <Text strong style={{ fontSize: 13, color: THEME_DARK, display: 'block' }}>{item.name}</Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>Stoku: {item.stockQuantity ?? 0}</Text>
                                  </div>
                                </div>
                                <Button
                                  size="small"
                                  type="primary"
                                  style={{ background: '#ec4899', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700 }}
                                  onClick={() => openProductModal(item)}
                                >
                                  Fillo Stokun
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>

                      {/* Add Product Promo Box */}
                      <Card
                        bordered={false}
                        style={{
                          borderRadius: 20,
                          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                          color: '#fff',
                          boxShadow: '0 8px 24px rgba(15,23,42,0.15)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <FireOutlined style={{ color: '#ec4899', fontSize: 18 }} />
                          <span style={{ fontWeight: 800, fontSize: 14, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            VEPRIM I SHPEJTË
                          </span>
                        </div>
                        <Title level={4} style={{ color: '#fff', margin: '0 0 6px', fontSize: 17, fontWeight: 800 }}>
                          Krijo Artikull të Ri
                        </Title>
                        <Paragraph style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
                          Publikoni parfume apo produkte të reja me çmime e zbritje me një klikim.
                        </Paragraph>
                        <Button
                          block
                          type="primary"
                          icon={<PlusOutlined />}
                          style={{
                            background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                            border: 'none', borderRadius: 12, height: 44, fontWeight: 700
                          }}
                          onClick={() => openProductModal(null)}
                        >
                          Shto tani
                        </Button>
                      </Card>

                    </div>
                  </Col>
                </Row>

              </div>
            )}

            {/* ── PRODUCTS TAB ── */}
            {activeTab === 'products' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Card
                  bordered={false}
                  style={{ borderRadius: 20, background: '#ffffff', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}
                >
                  {/* Toolbar */}
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
                    gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f8fafc'
                  }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, flex: 1 }}>
                      <Input
                        placeholder="Kërko produkt ose brend..."
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        allowClear
                        style={{ width: isCompact ? '100%' : 260, borderRadius: 10, height: 40 }}
                      />

                      <Select
                        placeholder="Filtro sipas kategorisë"
                        value={productCategoryFilter || undefined}
                        onChange={(val) => setProductCategoryFilter(val || '')}
                        allowClear
                        style={{ width: isCompact ? '100%' : 200, height: 40 }}
                        options={categories.map((c) => ({ value: c.name, label: c.name }))}
                      />

                      <Select
                        value={productStockFilter}
                        onChange={(val) => setProductStockFilter(val)}
                        style={{ width: isCompact ? '100%' : 170, height: 40 }}
                        options={[
                          { value: 'all', label: 'Të gjitha stoket' },
                          { value: 'instock', label: 'Në stok' },
                          { value: 'low', label: 'Stok i ulët (<5)' },
                          { value: 'outstock', label: 'Jashtë stokut (0)' },
                        ]}
                      />
                    </div>

                    <Button
                      type="primary" icon={<PlusOutlined />}
                      style={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                        border: 'none', borderRadius: 12, fontWeight: 700, height: 40
                      }}
                      onClick={() => openProductModal(null)}
                    >
                      Shto produkt
                    </Button>
                  </div>

                  {/* Table */}
                  <Table
                    columns={productColumns}
                    dataSource={filteredProducts}
                    rowKey="id"
                    size={isCompact ? 'small' : 'middle'}
                    scroll={{ x: 750 }}
                    locale={{ emptyText: <Empty description="Nuk u gjet asnjë produkt" style={{ padding: '48px 0' }} /> }}
                    pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
                  />
                </Card>
              </div>
            )}

            {/* ── CATEGORIES TAB ── */}
            {activeTab === 'categories' && (
              <Card
                bordered={false}
                style={{ borderRadius: 20, background: '#ffffff', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontWeight: 800, fontSize: 17, color: THEME_DARK }}>Menaxho Kategoritë</span>
                    <Button
                      type="primary" icon={<PlusOutlined />}
                      style={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                        border: 'none', borderRadius: 10, fontWeight: 700
                      }}
                      onClick={() => { setEditingCategory(null); categoryForm.resetFields(); setIsCategoryModalVisible(true); }}
                    >
                      Shto kategori
                    </Button>
                  </div>
                }
              >
                <Table
                  dataSource={categories}
                  rowKey="id"
                  size={isCompact ? 'small' : 'middle'}
                  scroll={{ x: 'max-content' }}
                  locale={{ emptyText: <Empty description="Nuk ka kategori" /> }}
                  columns={[
                    {
                      title: 'Emri i Kategorisë',
                      dataIndex: 'name',
                      render: (t) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Tag color="pink" style={{ borderRadius: 8, fontWeight: 700, fontSize: 13, padding: '3px 10px' }}>
                            {t}
                          </Tag>
                        </div>
                      )
                    },
                    { title: 'Përshkrimi', dataIndex: 'description', ellipsis: true, responsive: ['sm'], render: (t) => <Text type="secondary">{t || '—'}</Text> },
                    {
                      title: 'Krijuar më', dataIndex: 'createdAt', width: 150, responsive: ['md'],
                      render: (d) => <Text type="secondary">{new Date(d).toLocaleDateString('sq-AL')}</Text>,
                    },
                    {
                      title: 'Veprimet', fixed: 'right', width: 100,
                      render: (_, record) => (
                        <Space size={6}>
                          <Tooltip title="Edito">
                            <Button
                              type="text" icon={<EditOutlined style={{ color: '#64748b' }} />}
                              style={{ background: '#f8fafc', borderRadius: 8 }}
                              onClick={() => { setEditingCategory(record); categoryForm.setFieldsValue(record); setIsCategoryModalVisible(true); }}
                            />
                          </Tooltip>
                          <Tooltip title="Fshij">
                            <Popconfirm
                              title="A jeni i sigurt?"
                              okText="Po, fshij"
                              cancelText="Anulo"
                              okButtonProps={{ danger: true, style: { borderRadius: 8 } }}
                              cancelButtonProps={{ style: { borderRadius: 8 } }}
                              onConfirm={() => handleDeleteCategory(record.id)}
                            >
                              <Button type="text" danger icon={<DeleteOutlined />} style={{ background: '#fef2f2', borderRadius: 8 }} />
                            </Popconfirm>
                          </Tooltip>
                        </Space>
                      ),
                    },
                  ]}
                />
              </Card>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
              <Card
                bordered={false}
                style={{ borderRadius: 20, background: '#ffffff', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}
              >
                {/* Toolbar */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f8fafc'
                }}>
                  <Input
                    placeholder="Kërko sipas ID ose Emrit të Klientit..."
                    prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    allowClear
                    style={{ width: isCompact ? '100%' : 300, borderRadius: 10, height: 40 }}
                  />

                  <Select
                    value={orderStatusFilter}
                    onChange={(val) => setOrderStatusFilter(val)}
                    style={{ width: isCompact ? '100%' : 180, height: 40 }}
                    options={[
                      { value: 'all', label: 'Të gjitha statuset' },
                      { value: 'pending', label: 'Në pritje' },
                      { value: 'processing', label: 'Në proces' },
                      { value: 'completed', label: 'Kryer' },
                      { value: 'cancelled', label: 'Anuluar' },
                    ]}
                  />
                </div>

                <Table
                  columns={orderColumns}
                  dataSource={filteredOrders}
                  rowKey="id"
                  size={isCompact ? 'small' : 'middle'}
                  scroll={{ x: 680 }}
                  pagination={{ pageSize: 10, showSizeChanger: true }}
                  locale={{ emptyText: <Empty description="Nuk u gjet asnjë porosi" /> }}
                />
              </Card>
            )}

          </Content>
        </Layout>

        {/* ── PRODUCT MODAL ── */}
        <Modal
          title={
            <div style={{ paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: THEME_DARK }}>
                {editingProduct ? 'Edito Produktin' : 'Shto Produkt të Ri'}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>
                Plotësoni të dhënat e parfumit ose artikullit për dyqanin.
              </div>
            </div>
          }
          open={isProductModalVisible}
          onCancel={() => { setIsProductModalVisible(false); setFileList([]); }}
          onOk={() => form.submit()}
          okText={t('admin.save', 'Ruaj Produktin')}
          cancelText="Anulo"
          confirmLoading={submittingProduct}
          okButtonProps={{
            style: {
              background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
              border: 'none', fontWeight: 700, height: 42, borderRadius: 10
            }
          }}
          cancelButtonProps={{ style: { borderRadius: 10, height: 42 } }}
          centered
          width="min(calc(100vw - 24px), 620px)"
          destroyOnHidden
        >
          <Form form={form} layout="vertical" onFinish={handleProductSubmit} style={{ paddingTop: 16 }}>

            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item name="name" label="Emri i Produktit (SQ)" rules={[{ required: true, message: 'Ju lutem shënoni emrin' }]}>
                  <Input style={{ height: 42, borderRadius: 10 }} placeholder="p.sh. Lattafa Khamrah" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="name_mk" label="Emri i Produktit (MK)">
                  <Input style={{ height: 42, borderRadius: 10 }} placeholder="p.sh. Латафа Хамрах" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item name="brand" label="Brendi">
                  <Input style={{ height: 42, borderRadius: 10 }} placeholder="p.sh. Lattafa / Victoria's Secret" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="category" label="Kategoria">
                  <Select
                    style={{ height: 42 }}
                    placeholder="Zgjidh kategorinë"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={categories.map((cat) => ({ value: cat.name, label: cat.name }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item name="price" label={`Çmimi i zbritur (${t('common.currency', 'DEN')})`} rules={[{ required: true, message: 'Shënoni çmimin' }]}>
                  <InputNumber style={{ width: '100%', borderRadius: 10, height: 42 }} min={0} placeholder="3500" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="oldPrice" label={`Çmimi i vjetër (${t('common.currency', 'DEN')})`}>
                  <InputNumber style={{ width: '100%', borderRadius: 10, height: 42 }} min={0} placeholder="4200" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col xs={24} sm={8}>
                <Form.Item name="quantity" label="Sasia në Stok">
                  <InputNumber style={{ width: '100%', borderRadius: 10, height: 42 }} min={0} placeholder="10" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="rating" label="Vlerësimi (0 - 5)">
                  <InputNumber style={{ width: '100%', borderRadius: 10, height: 42 }} min={0} max={5} step={0.1} placeholder="4.8" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="reviewsCount" label="Numri i Vlerësimeve">
                  <InputNumber style={{ width: '100%', borderRadius: 10, height: 42 }} min={0} placeholder="86" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Përshkrimi i Produktit (SQ)">
              <Input.TextArea rows={3} style={{ borderRadius: 10 }} placeholder="Shkruani përshkrimin e parfumit..." />
            </Form.Item>

            <Form.Item name="description_mk" label="Përshkrimi i Produktit (MK)">
              <Input.TextArea rows={3} style={{ borderRadius: 10 }} placeholder="Опис на македонски..." />
            </Form.Item>

            <Form.Item label="Foto e Produktit">
              {editingProduct?.image && fileList.length === 0 && (
                <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src={getImageUrl(editingProduct.image)}
                    alt="current"
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10, border: '1px solid #f1f5f9' }}
                  />
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    Fotoja ekzistuese. Ngarkoni një të re nëse dëshironi ta zëvendësoni.
                  </span>
                </div>
              )}
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                fileList={fileList}
                onChange={({ fileList: fl }) => setFileList(fl)}
                accept="image/*"
                listType="picture"
              >
                <Button icon={<UploadOutlined />} style={{ borderRadius: 10, borderStyle: 'dashed', width: '100%', height: 44 }}>
                  Klikoni për të zgjedhur foto të re
                </Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        {/* ── CATEGORY MODAL ── */}
        <Modal
          title={
            <div style={{ paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: THEME_DARK }}>
                {editingCategory ? 'Edito Kategorinë' : 'Shto Kategori të Re'}
              </div>
            </div>
          }
          open={isCategoryModalVisible}
          onCancel={() => setIsCategoryModalVisible(false)}
          onOk={() => categoryForm.submit()}
          okText={t('admin.save', 'Ruaj')}
          cancelText="Anulo"
          okButtonProps={{
            style: {
              background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
              border: 'none', fontWeight: 700, height: 40, borderRadius: 10
            }
          }}
          cancelButtonProps={{ style: { borderRadius: 10, height: 40 } }}
          centered
          width="min(calc(100vw - 24px), 460px)"
          destroyOnHidden
        >
          <Form form={categoryForm} layout="vertical" onFinish={handleCategorySubmit} style={{ paddingTop: 16 }}>
            <Form.Item name="name" label="Emri i Kategorisë (SQ)" rules={[{ required: true, message: 'Shënoni emrin' }]}>
              <Input style={{ height: 42, borderRadius: 10 }} placeholder="p.sh. Parfume për Femra" />
            </Form.Item>
            <Form.Item name="name_mk" label="Emri i Kategorisë (MK)">
              <Input style={{ height: 42, borderRadius: 10 }} placeholder="p.sh. Парфеми за жени" />
            </Form.Item>
            <Form.Item name="description" label="Përshkrimi (SQ)">
              <Input.TextArea rows={3} style={{ borderRadius: 10 }} placeholder="..." />
            </Form.Item>
            <Form.Item name="description_mk" label="Përshkrimi (MK)">
              <Input.TextArea rows={3} style={{ borderRadius: 10 }} placeholder="..." />
            </Form.Item>
          </Form>
        </Modal>

      </Layout>
    </ConfigProvider>
  );
};

export default AdminDashboard;