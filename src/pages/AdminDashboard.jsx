import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Layout, Menu, Card, Row, Col, Statistic, Table, Button, Modal,
  Form, Input, Select, InputNumber, Upload, message, Tag, Space,
  Typography, Popconfirm, Avatar, Drawer, ConfigProvider, Empty, Grid,
} from 'antd';
import {
  DashboardOutlined, ShoppingOutlined, OrderedListOutlined, StarOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, UserOutlined,
  UploadOutlined, LogoutOutlined, MenuOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getImageUrl } from '../utils/imageUtils';
import { getApiBaseUrl } from '../utils/apiBase';
import { fetchProducts as fetchProductsGlobal } from '../redux/productsSlice';
import { useTranslation } from 'react-i18next';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const THEME_LIGHT_PINK = '#fff0f6';
const THEME_PINK = '#ff85c0';

const statusTagColor = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'delivered' || s === 'completed') return 'success';
  if (s === 'cancelled' || s === 'canceled') return 'error';
  if (s === 'pending' || s === 'processing' || s === 'shipped') return 'processing';
  return 'default';
};

// ─── Sidebar ────────────────────────────────────────────────────────────────
function AdminSidebar({ activeTab, menuItems, onMenuSelect, onShopNavigate }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(180deg, #fff 0%, #fff 80%, #fff0f6 100%)' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #fce7f3' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, background: THEME_PINK,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(255,133,192,0.4)', flexShrink: 0,
          }}>
            <ShoppingOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', lineHeight: 1.2 }}>Lemea</div>
            <div style={{ fontWeight: 700, fontSize: 10, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div style={{ flex: 1, padding: '12px 12px 0' }}>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => onMenuSelect(key)}
          style={{ border: 'none', background: 'transparent' }}
          items={menuItems}
        />
      </div>

      {/* Bottom button */}
      <div style={{ padding: 16 }}>
        <Button
          block
          icon={<LogoutOutlined />}
          onClick={onShopNavigate}
          style={{ borderRadius: 12, height: 44, borderColor: '#fce7f3', color: '#64748b' }}
        >
          {t('admin.back_to_shop')}
        </Button>
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
    if (activeTab === 'overview') return t('admin.overview');
    if (activeTab === 'products') return t('admin.inventory');
    if (activeTab === 'categories') return t('admin.categories');
    return t('admin.orders');
  }, [activeTab, t]);

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (e) { console.error(e); }
  }, [token, apiUrl]);

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
    } catch (e) { console.error(e); }
  }, [token, apiUrl]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/categories`);
      setCategories(res.data);
    } catch (e) { console.error(e); }
  }, [apiUrl]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      message.error('Access denied. Admins only.');
      navigate('/');
      return;
    }
    fetchStats();
    fetchProducts();
    fetchOrders();
    fetchCategories();
  }, [user, navigate, fetchStats, fetchProducts, fetchOrders, fetchCategories]);

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

      // Image goes to Cloudinary via NestJS
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
        message.success(t('admin.product_updated'));
      } else {
        await axios.post(`${apiUrl}/products`, formData, config);
        message.success(t('admin.product_added'));
      }

      setIsProductModalVisible(false);
      setFileList([]);
      fetchProducts();
      dispatch(fetchProductsGlobal());
      fetchStats();
    } catch (err) {
      console.error(err);
      message.error(t('admin.save_failed'));
    } finally {
      setSubmittingProduct(false);
    }
  }, [editingProduct, fileList, token, apiUrl, fetchProducts, fetchStats]);

  // ── Delete product ────────────────────────────────────────────────────────
  const handleDeleteProduct = useCallback(async (id) => {
    try {
      await axios.delete(`${apiUrl}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success(t('admin.product_deleted'));
      fetchProducts();
      fetchStats();
    } catch {
      message.error(t('admin.delete_failed'));
    }
  }, [token, apiUrl, fetchProducts, fetchStats]);

  // ── Category handlers ─────────────────────────────────────────────────────
  const handleCategorySubmit = useCallback(async (values) => {
    try {
      if (editingCategory) {
        await axios.patch(`${apiUrl}/categories/${editingCategory.id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success(t('admin.category_updated'));
      } else {
        await axios.post(`${apiUrl}/categories`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success(t('admin.category_added'));
      }
      setIsCategoryModalVisible(false);
      fetchCategories();
    } catch {
      message.error(t('admin.save_failed'));
    }
  }, [editingCategory, token, apiUrl, fetchCategories]);

  const handleDeleteCategory = useCallback(async (id) => {
    try {
      await axios.delete(`${apiUrl}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success(t('admin.category_deleted'));
      fetchCategories();
    } catch {
      message.error(t('admin.delete_failed'));
    }
  }, [token, apiUrl, fetchCategories, t]);

  // ── Menu items ────────────────────────────────────────────────────────────
  const menuItems = [
    { key: 'overview', icon: <DashboardOutlined />, label: t('admin.overview') },
    { key: 'products', icon: <ShoppingOutlined />, label: t('admin.inventory') },
    { key: 'categories', icon: <AppstoreOutlined />, label: t('admin.categories') },
    { key: 'orders', icon: <OrderedListOutlined />, label: t('admin.orders') },
  ];

  // ── Table columns ─────────────────────────────────────────────────────────
  const productColumns = useMemo(() => [
    {
      title: 'Imazhi',
      dataIndex: 'image',
      width: 72,
      render: (img) => (
        <Avatar
          shape="square"
          size={isCompact ? 44 : 52}
          src={getImageUrl(img)}
          style={{ borderRadius: 10, border: '1px solid #fce7f3' }}
        />
      ),
    },
    {
      title: 'Emri',
      dataIndex: 'name',
      ellipsis: true,
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: 'Brendi',
      dataIndex: 'brand',
      width: 110,
      responsive: ['md'],
      render: (b) => <Text type="secondary">{b || '—'}</Text>,
    },
    {
      title: t('products.price'),
      dataIndex: 'price',
      width: 120,
      render: (p) => <Text strong style={{ color: THEME_PINK }}>{Number(p)?.toLocaleString()} {t('common.currency')}</Text>,
    },
    {
      title: 'Sasia',
      dataIndex: 'stockQuantity',
      width: 80,
      responsive: ['sm'],
      render: (q) => <Text>{q ?? 0}</Text>,
    },
    {
      title: 'Kategoria',
      dataIndex: 'category',
      width: 130,
      responsive: ['md'],
      render: (c) => c ? <Tag color="pink">{c}</Tag> : '—',
    },
    {
      title: 'Veprimet',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: '#94a3b8' }}
            onClick={() => openProductModal(record)}
          />
          <Popconfirm
            title="A jeni i sigurt që doni ta fshini?"
            okText="Po, fshij"
            cancelText="Anulo"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDeleteProduct(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ], [isCompact, openProductModal, handleDeleteProduct]);

  const orderColumns = useMemo(() => [
    {
      title: 'ID', dataIndex: 'id', width: 100,
      render: (id) => <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>#{String(id).slice(-8)}</Text>,
    },
    {
      title: 'Klienti',
      render: (_, r) => <Text strong>{r.firstName} {r.lastName}</Text>,
    },
    {
      title: 'Data', dataIndex: 'createdAt', width: 120, responsive: ['md'],
      render: (d) => <Text type="secondary">{new Date(d).toLocaleDateString('sq-AL')}</Text>,
    },
    {
      title: t('checkout.total'), dataIndex: 'totalAmount', width: 110, align: 'right',
      render: (t_val) => <Text strong style={{ color: THEME_PINK }}>{t_val != null ? `${Number(t_val).toLocaleString()} ${t('common.currency')}` : '—'}</Text>,
    },
    {
      title: 'Statusi', dataIndex: 'status', width: 120,
      render: (s) => (
        <Tag color={statusTagColor(s)} style={{ borderRadius: 20, border: 0, fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>
          {s}
        </Tag>
      ),
    },
  ], []);

  const statCards = [
    { label: t('admin.revenue'), val: stats?.totalRevenue, icon: <DollarOutlined />, color: '#7c3aed', suffix: ` ${t('common.currency')}` },
    { label: t('admin.orders'), val: stats?.totalOrders, icon: <OrderedListOutlined />, color: THEME_PINK, suffix: '' },
    { label: t('admin.inventory'), val: stats?.totalProducts, icon: <ShoppingOutlined />, color: '#0d9488', suffix: '' },
    { label: t('review_page.title'), val: stats?.totalReviews, icon: <StarOutlined />, color: '#ea580c', suffix: '' },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: THEME_PINK, borderRadiusLG: 16, fontFamily: 'inherit' },
        components: {
          Menu: { itemSelectedBg: THEME_LIGHT_PINK, itemHoverBg: '#fff5f8', itemSelectedColor: THEME_PINK },
          Card: { headerBg: 'transparent' },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff0f6 0%, #f8fafc 50%, #f5f3ff 100%)' }}>

        {/* Desktop Sidebar — fixed position */}
        {screens.lg && (
          <Sider
            width={260}
            theme="light"
            style={{
              position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100,
              background: '#fff', borderRight: '1px solid #fce7f3',
              boxShadow: '4px 0 20px rgba(255,133,192,0.08)',
              overflow: 'hidden',
            }}
          >
            <AdminSidebar
              activeTab={activeTab}
              menuItems={menuItems}
              onMenuSelect={(key) => { setActiveTab(key); setMobileMenuOpen(false); }}
              onShopNavigate={() => navigate('/')}
            />
          </Sider>
        )}

        {/* Mobile Drawer */}
        <Drawer
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={260}
          styles={{ body: { padding: 0 } }}
        >
          <AdminSidebar
            activeTab={activeTab}
            menuItems={menuItems}
            onMenuSelect={(key) => { setActiveTab(key); setMobileMenuOpen(false); }}
            onShopNavigate={() => navigate('/')}
          />
        </Drawer>

        {/* Main content — pushed right on desktop */}
        <Layout style={{ marginLeft: screens.lg ? 260 : 0, background: 'transparent', minHeight: '100vh' }}>

          {/* Header */}
          <Header style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 1px 12px rgba(15,23,42,0.06)',
            height: 72, padding: '0 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {!screens.lg && (
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setMobileMenuOpen(true)}
                  style={{ fontSize: 18, color: '#64748b' }}
                />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', lineHeight: 1.2 }}>{pageTitle}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Paneli i administrimit Lemea</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {screens.sm && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{user?.firstName}</div>
                  <div style={{ fontWeight: 700, fontSize: 10, color: THEME_PINK, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Super Admin</div>
                </div>
              )}
              <Avatar
                size={isCompact ? 36 : 44}
                src={user?.avatar}
                icon={<UserOutlined />}
                style={{ border: `2px solid #fce7f3`, background: '#fff0f6', color: THEME_PINK }}
              />
            </div>
          </Header>

          {/* Page Content */}
          <Content style={{ padding: isCompact ? '20px 16px' : '32px 32px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>

            {/* ── Overview ── */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.8)' }}>
                  <Title level={3} style={{ margin: 0, fontSize: 20, color: '#0f172a' }}>
                    {t('admin.welcome')}{user?.firstName ? `, ${user.firstName}` : ''}!
                  </Title>
                  <Paragraph style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14 }}>
                    {t('admin.stats_subtitle', 'Shiko shifrat, porositë e fundit dhe shto produkte të reja.')}
                  </Paragraph>
                </div>

                <Row gutter={[16, 16]}>
                  {statCards.map((item, i) => (
                    <Col xs={24} sm={12} xl={6} key={i}>
                      <Card bordered={false} style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.9)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Statistic
                            title={<span style={{ color: '#94a3b8', fontSize: 13 }}>{item.label}</span>}
                            value={item.val ?? '—'}
                            suffix={item.suffix}
                            valueStyle={{ fontWeight: 800, fontSize: 24, color: '#0f172a' }}
                          />
                          <div style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: `${item.color}18`, color: item.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                          }}>
                            {item.icon}
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} xl={16}>
                    <Card
                      title={<span style={{ fontWeight: 700, fontSize: 16 }}>Porositë e fundit</span>}
                      bordered={false}
                      style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.9)' }}
                    >
                      <Table
                        dataSource={orders.slice(0, 5)}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        scroll={{ x: 'max-content' }}
                        locale={{ emptyText: <Empty description="Nuk ka porosi" /> }}
                        columns={orderColumns}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} xl={8}>
                    <Card bordered={false} style={{ borderRadius: 20, border: '1px solid #fce7f3', background: 'linear-gradient(135deg, #fff 0%, #fff0f6 100%)', height: '100%' }}>
                      <div style={{ padding: 8 }}>
                        <div style={{ background: THEME_PINK, color: '#fff', borderRadius: 20, padding: '2px 12px', fontSize: 10, fontWeight: 700, display: 'inline-block', marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>E re</div>
                        <Title level={5} style={{ margin: '0 0 8px', color: '#0f172a' }}>Shto produkt</Title>
                        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20 }}>
                          Shto artikuj të rinj në dyqan — inventari përditësohet menjëherë.
                        </Text>
                        <Button
                          block type="primary" size="large"
                          icon={<PlusOutlined />}
                          style={{ background: THEME_PINK, border: 'none', borderRadius: 12, height: 48, fontWeight: 600 }}
                          onClick={() => openProductModal(null)}
                        >
                          Shto tani
                        </Button>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {/* ── Products ── */}
            {activeTab === 'products' && (
              <Card
                bordered={false}
                style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.9)' }}
                title={<span style={{ fontWeight: 700, fontSize: 16 }}>Inventari i produkteve</span>}
                extra={
                  <Button
                    type="primary" icon={<PlusOutlined />}
                    style={{ background: THEME_PINK, border: 'none', borderRadius: 10, fontWeight: 600 }}
                    onClick={() => openProductModal(null)}
                  >
                    Shto produkt
                  </Button>
                }
              >
                <Table
                  columns={productColumns}
                  dataSource={products}
                  rowKey="id"
                  size={isCompact ? 'small' : 'middle'}
                  scroll={{ x: 'max-content' }}
                  locale={{ emptyText: <Empty description="Nuk ka produkte" style={{ padding: '48px 0' }} /> }}
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                />
              </Card>
            )}

            {/* ── Categories ── */}
            {activeTab === 'categories' && (
              <Card
                bordered={false}
                style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.9)' }}
                title={<span style={{ fontWeight: 700, fontSize: 16 }}>Menaxho Kategorite</span>}
                extra={
                  <Button
                    type="primary" icon={<PlusOutlined />}
                    style={{ background: THEME_PINK, border: 'none', borderRadius: 10, fontWeight: 600 }}
                    onClick={() => { setEditingCategory(null); categoryForm.resetFields(); setIsCategoryModalVisible(true); }}
                  >
                    Shto kategori
                  </Button>
                }
              >
                <Table
                  dataSource={categories}
                  rowKey="id"
                  size={isCompact ? 'small' : 'middle'}
                  scroll={{ x: 'max-content' }}
                  locale={{ emptyText: <Empty description="Nuk ka kategori" /> }}
                  columns={[
                    { title: 'Emri', dataIndex: 'name', render: (t) => <Text strong>{t}</Text> },
                    { title: 'Përshkrimi', dataIndex: 'description', ellipsis: true, responsive: ['sm'], render: (t) => <Text type="secondary">{t || '—'}</Text> },
                    {
                      title: 'Krijuar më', dataIndex: 'createdAt', width: 140, responsive: ['md'],
                      render: (d) => <Text type="secondary">{new Date(d).toLocaleDateString('sq-AL')}</Text>,
                    },
                    {
                      title: 'Veprimet', fixed: 'right', width: 100,
                      render: (_, record) => (
                        <Space size={4}>
                          <Button type="text" icon={<EditOutlined />} style={{ color: '#94a3b8' }}
                            onClick={() => { setEditingCategory(record); categoryForm.setFieldsValue(record); setIsCategoryModalVisible(true); }}
                          />
                          <Popconfirm
                            title="A jeni i sigurt?"
                            okText="Po, fshij"
                            cancelText="Anulo"
                            okButtonProps={{ danger: true }}
                            onConfirm={() => handleDeleteCategory(record.id)}
                          >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                />
              </Card>
            )}

            {/* ── Orders ── */}
            {activeTab === 'orders' && (
              <Card
                bordered={false}
                style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.9)' }}
                title={<span style={{ fontWeight: 700, fontSize: 16 }}>Të gjitha porositë</span>}
              >
                <Table
                  columns={orderColumns}
                  dataSource={orders}
                  rowKey="id"
                  size={isCompact ? 'small' : 'middle'}
                  scroll={{ x: 640 }}
                  pagination={{ pageSize: isCompact ? 8 : 12, showSizeChanger: !isCompact }}
                  locale={{ emptyText: <Empty description="Nuk ka porosi" /> }}
                />
              </Card>
            )}
          </Content>
        </Layout>

        {/* ── Product Modal ── */}
        <Modal
          title={
            <span style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>
              {editingProduct ? t('admin.edit_product') : t('admin.add_product')}
            </span>
          }
          open={isProductModalVisible}
          onCancel={() => { setIsProductModalVisible(false); setFileList([]); }}
          onOk={() => form.submit()}
          okText={t('admin.save')}
          cancelText={t('checkout.back_products')}
          confirmLoading={submittingProduct}
          okButtonProps={{ style: { background: THEME_PINK, border: 'none', fontWeight: 600, height: 40 } }}
          cancelButtonProps={{ style: { borderRadius: 10, height: 40 } }}
          centered
          width="min(calc(100vw - 24px), 580px)"
          destroyOnHidden
        >
          <Form form={form} layout="vertical" onFinish={handleProductSubmit} style={{ paddingTop: 16 }}>

            <Form.Item name="name" label={`${t('admin.product_name')} (SQ)`} rules={[{ required: true, message: t('admin.name_req') }]}>
              <Input style={{ height: 44, borderRadius: 10 }} placeholder="p.sh. Lattafa Khamrah" />
            </Form.Item>

            <Form.Item name="name_mk" label={`${t('admin.product_name')} (MK)`}>
              <Input style={{ height: 44, borderRadius: 10 }} placeholder="Петар Пан" />
            </Form.Item>

            <Form.Item name="brand" label={t('product_details.specs.brand')}>
              <Input style={{ height: 44, borderRadius: 10 }} placeholder="p.sh. Lattafa" />
            </Form.Item>

            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item name="price" label={`${t('products.price')} (${t('common.currency')})`} rules={[{ required: true, message: t('admin.name_req') }]}>
                  <InputNumber style={{ width: '100%', borderRadius: 10 }} min={0} placeholder="3500" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="oldPrice" label={`${t('admin.old_price')} (${t('admin.optional')})`}>
                  <InputNumber style={{ width: '100%', borderRadius: 10 }} min={0} placeholder="4000" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item name="quantity" label={t('admin.stock')}>
                  <InputNumber style={{ width: '100%', borderRadius: 10 }} min={0} placeholder="10" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="category" label={t('products.category')}>
                  <Select
                    style={{ height: 44 }}
                    placeholder={t('checkout.placeholder_city')}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={categories.map((cat) => ({ value: cat.name, label: cat.name }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label={`${t('product_details.tabs.description')} (SQ)`}>
              <Input.TextArea rows={3} style={{ borderRadius: 10 }} placeholder="..." />
            </Form.Item>

            <Form.Item name="description_mk" label={`${t('product_details.tabs.description')} (MK)`}>
              <Input.TextArea rows={3} style={{ borderRadius: 10 }} placeholder="..." />
            </Form.Item>

            <Form.Item label={t('admin.product_image')}>
              {editingProduct?.image && fileList.length === 0 && (
                <div style={{ marginBottom: 12 }}>
                  <img
                    src={getImageUrl(editingProduct.image)}
                    alt="current"
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid #fce7f3' }}
                  />
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                    {t('admin.replace_hint')}
                  </div>
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
                <Button icon={<UploadOutlined />} style={{ borderRadius: 10, borderStyle: 'dashed', width: '100%', height: 48 }}>
                  {t('admin.upload_new')}
                </Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        {/* ── Category Modal ── */}
        <Modal
          title={
            <span style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>
              {editingCategory ? t('admin.edit_product') : t('admin.add_product')}
            </span>
          }
          open={isCategoryModalVisible}
          onCancel={() => setIsCategoryModalVisible(false)}
          onOk={() => categoryForm.submit()}
          okText={t('admin.save')}
          cancelText={t('checkout.back_products')}
          okButtonProps={{ style: { background: THEME_PINK, border: 'none', fontWeight: 600, height: 40 } }}
          cancelButtonProps={{ style: { borderRadius: 10, height: 40 } }}
          centered
          width="min(calc(100vw - 24px), 440px)"
          destroyOnHidden
        >
          <Form form={categoryForm} layout="vertical" onFinish={handleCategorySubmit} style={{ paddingTop: 16 }}>
            <Form.Item name="name" label={t('admin.cat_name')} rules={[{ required: true, message: t('admin.name_req') }]}>
              <Input style={{ height: 44, borderRadius: 10 }} placeholder="..." />
            </Form.Item>
            <Form.Item name="description" label={t('product_details.tabs.description')}>
              <Input.TextArea rows={3} style={{ borderRadius: 10 }} placeholder="..." />
            </Form.Item>
          </Form>
        </Modal>

      </Layout>
    </ConfigProvider>
  );
};

export default AdminDashboard;