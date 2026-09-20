import { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Layers,
  Settings as SettingsIcon,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Search,
  Filter,
  Save,
  Store,
  Upload,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';
import { Product, Order, Category, OrderStatus } from '../types';

interface AdminPageProps {
  navigate: (path: string) => void;
}

export function AdminPage({ navigate }: AdminPageProps) {
  const { user, isAdmin } = useAuth();
  const { settings, updateSettings } = useSettings();

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'categories' | 'settings'>('analytics');
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter in Admin
  const [productSearch, setProductSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  // Product Add/Edit Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<{
    name: string;
    sku: string;
    categoryId: string;
    categoryName: string;
    brand: string;
    price: number;
    originalPrice: number;
    stockQuantity: number;
    lowStockThreshold: number;
    description: string;
    datasheetUrl: string;
    images: string[];
    specifications: Record<string, string>;
  }>({
    name: '',
    sku: '',
    categoryId: 'cat-ics',
    categoryName: 'ICs & Semiconductors',
    brand: '',
    price: 0,
    originalPrice: 0,
    stockQuantity: 50,
    lowStockThreshold: 10,
    description: '',
    datasheetUrl: '',
    images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80'],
    specifications: { 'Operating Voltage': '5V', 'Package': 'DIP-8' },
  });

  // Shop Settings Form
  const [shopSettingsForm, setShopSettingsForm] = useState({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      if (!isAdmin) return;
      setLoading(true);
      try {
        const [statsData, prodsData, ordersData, catsData] = await Promise.all([
          api.admin.getStats(),
          api.admin.getProducts(),
          api.admin.getOrders(),
          api.getCategories(),
        ]);

        setStats(statsData);
        setProducts(prodsData);
        setOrders(ordersData);
        setCategories(catsData);
        setShopSettingsForm(settings);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [isAdmin, settings]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-500">
          You must be signed in with an administrative staff account to access Kishan Electronics back-office.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  // Handle Order Status Update
  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.admin.updateOrderStatus(orderId, newStatus);
      const updatedOrders = await api.admin.getOrders();
      setOrders(updatedOrders);
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // Handle Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.admin.updateProduct(editingProduct.id, productForm);
      } else {
        await api.admin.createProduct(productForm);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      const prods = await api.admin.getProducts();
      setProducts(prods);
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this component from Kishan Electronics catalog?')) return;
    try {
      await api.admin.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Open Edit Product Modal
  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      sku: prod.sku,
      categoryId: prod.categoryId,
      categoryName: prod.categoryName || 'ICs & Semiconductors',
      brand: prod.brand,
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price,
      stockQuantity: prod.stockQuantity,
      lowStockThreshold: prod.lowStockThreshold || 10,
      description: prod.description,
      datasheetUrl: prod.datasheetUrl || '',
      images: prod.images || [],
      specifications: (prod.specifications as Record<string, string>) || {},
    });
    setShowProductModal(true);
  };

  // Open Add Product Modal
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      sku: `KE-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: categories[0]?.id || 'cat-ics',
      categoryName: categories[0]?.name || 'ICs & Semiconductors',
      brand: 'Kishan Electronics',
      price: 50,
      originalPrice: 60,
      stockQuantity: 100,
      lowStockThreshold: 15,
      description: 'High-quality engineering component with verified pinouts.',
      datasheetUrl: 'https://www.ti.com/lit/ds/symlink/ne555.pdf',
      images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80'],
      specifications: { 'Operating Voltage': '5V DC', 'Pin Count': '8 Pins' },
    });
    setShowProductModal(true);
  };

  // Handle Shop Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(shopSettingsForm);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update shop settings');
    }
  };

  const filteredProducts = products.filter((p) =>
    productSearch ? p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()) : true
  );

  const filteredOrders = orders.filter((o) =>
    orderFilter === 'all' ? true : o.orderStatus === orderFilter || o.orderType === orderFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 text-xs font-bold mb-2">
            <Store className="w-3.5 h-3.5" />
            <span>Kishan Electronics Back-Office</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Admin & Store Operations Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage live in-store inventory, prepare customer counter pickup orders, and configure shop parameters
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={openAddProduct}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Component</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs text-xs font-bold gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2.5 rounded-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Overview & Metrics</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'orders'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Orders Management ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'products'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products & Stock ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 rounded-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'settings'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Shop & Contact Settings</span>
        </button>
      </div>

      {/* Tab 1: Analytics & Metrics */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Volume</div>
              <div className="text-2xl font-black text-slate-900">
                {settings.currency}{stats.totalRevenue?.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">Across store pickups & couriers</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders Logged</div>
              <div className="text-2xl font-black text-slate-900">{stats.totalOrders}</div>
              <div className="text-[11px] text-cyan-600 font-semibold">{stats.pendingOrders} awaiting fulfillment</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catalog SKUs</div>
              <div className="text-2xl font-black text-slate-900">{stats.totalProducts}</div>
              <div className="text-[11px] text-slate-500">Across {categories.length} ECE divisions</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Low Stock Warnings</div>
              <div className="text-2xl font-black text-rose-600">{stats.lowStockProducts}</div>
              <div className="text-[11px] text-rose-500 font-semibold">Requires wholesale re-order</div>
            </div>
          </div>

          {/* Low Stock Warning Box */}
          {stats.lowStockList && stats.lowStockList.length > 0 && (
            <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Low Inventory Alerts ({stats.lowStockList.length} SKUs below threshold)</span>
                </div>
              </div>
              <div className="overflow-x-auto bg-white rounded-2xl border border-rose-100">
                <table className="w-full text-xs text-left">
                  <thead className="bg-rose-50/50 text-rose-900 border-b border-rose-100 font-bold">
                    <tr>
                      <th className="py-2.5 px-4">Component Name</th>
                      <th className="py-2.5 px-4">SKU</th>
                      <th className="py-2.5 px-4">Remaining Counter Stock</th>
                      <th className="py-2.5 px-4">Threshold</th>
                      <th className="py-2.5 px-4 text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.lowStockList.map((p: any) => (
                      <tr key={p.id} className="hover:bg-rose-50/30">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{p.name}</td>
                        <td className="py-2.5 px-4 font-mono text-cyan-800">{p.sku}</td>
                        <td className="py-2.5 px-4 font-extrabold text-rose-600">{p.stockQuantity} pcs</td>
                        <td className="py-2.5 px-4 text-slate-500">{p.lowStockThreshold} pcs</td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => openEditProduct(p)}
                            className="text-cyan-800 hover:underline font-bold"
                          >
                            Update Stock →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700">Filter Orders:</span>
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-lg px-3 py-1.5 text-xs focus:outline-hidden"
              >
                <option value="all">All Orders ({orders.length})</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready for Pickup / Shipped">Ready for Pickup / Shipped</option>
                <option value="Delivered / Collected">Delivered / Collected</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Pickup">Pickup Only</option>
                <option value="Delivery">Delivery Only</option>
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-900">{filteredOrders.length}</span> orders
            </div>
          </div>

          <div className="space-y-4">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-black text-sm text-slate-900">#{ord.id}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          ord.orderStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : ord.orderStatus === 'Delivered / Collected'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-cyan-100 text-cyan-800'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {ord.orderType}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      Customer: <strong className="text-slate-800">{ord.customerName}</strong> ({ord.customerPhone} • {ord.customerEmail})
                    </div>
                  </div>

                  {/* Status update select */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-600">Update Status:</span>
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleOrderStatusChange(ord.id, e.target.value as OrderStatus)}
                      className="bg-slate-50 border border-slate-300 text-slate-900 font-bold rounded-xl px-3 py-1.5 text-xs focus:outline-hidden"
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready for Pickup / Shipped">Ready for Pickup / Shipped</option>
                      <option value="Delivered / Collected">Delivered / Collected</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Ordered Items summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
                      <span className="font-bold text-slate-900 truncate">{item.productName}</span>
                      <span className="text-slate-500">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
                  <div>
                    Placed on: {new Date(ord.createdAt).toLocaleString()} | Payment: <strong className="text-slate-800">{ord.paymentMethod}</strong> ({ord.paymentStatus})
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    Grand Total: {settings.currency}{ord.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Products Management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by component name or SKU..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-4 py-2 rounded-xl text-xs focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={openAddProduct}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Component</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Component</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-9 h-9 object-contain bg-slate-50 rounded-lg p-0.5 border border-slate-100"
                          />
                          <span className="font-bold text-slate-900">{prod.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-800 font-semibold">{prod.sku}</td>
                      <td className="py-3 px-4 text-slate-600">{prod.categoryName}</td>
                      <td className="py-3 px-4 text-slate-600">{prod.brand}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{settings.currency}{prod.price}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            prod.stockQuantity <= (prod.lowStockThreshold || 10)
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {prod.stockQuantity} pcs
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditProduct(prod)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-cyan-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Shop Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs max-w-3xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">Physical Store & System Settings</h2>
              <p className="text-xs text-slate-500">Configure public shop address, contact phones, and fulfillment rates</p>
            </div>
            {settingsSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings Saved!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700">Shop Name</label>
                <input
                  type="text"
                  value={shopSettingsForm.shopName}
                  onChange={(e) => setShopSettingsForm({ ...shopSettingsForm, shopName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Tagline</label>
                <input
                  type="text"
                  value={shopSettingsForm.tagline}
                  onChange={(e) => setShopSettingsForm({ ...shopSettingsForm, tagline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  value={shopSettingsForm.phone}
                  onChange={(e) => setShopSettingsForm({ ...shopSettingsForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">WhatsApp Number</label>
                <input
                  type="text"
                  value={shopSettingsForm.whatsappNumber}
                  onChange={(e) => setShopSettingsForm({ ...shopSettingsForm, whatsappNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700">Physical Store Address</label>
                <input
                  type="text"
                  value={shopSettingsForm.address}
                  onChange={(e) => setShopSettingsForm({ ...shopSettingsForm, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Store Hours</label>
                <input
                  type="text"
                  value={shopSettingsForm.openingHours}
                  onChange={(e) => setShopSettingsForm({ ...shopSettingsForm, openingHours: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Standard Delivery Fee (₹)</label>
                <input
                  type="number"
                  value={shopSettingsForm.deliveryFee}
                  onChange={(e) => setShopSettingsForm({ ...shopSettingsForm, deliveryFee: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold flex items-center space-x-2 transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {editingProduct ? `Edit Component: ${editingProduct.name}` : 'Add New ECE Component'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700">Component Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                    placeholder="e.g. ESP32 Wi-Fi + Bluetooth Dev Module"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">SKU Number *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Category *</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => {
                      const sel = categories.find((c) => c.id === e.target.value);
                      setProductForm({
                        ...productForm,
                        categoryId: e.target.value,
                        categoryName: sel ? sel.name : productForm.categoryName,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Brand / Manufacturer *</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">In-Store Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Low Stock Alert Level</label>
                  <input
                    type="number"
                    value={productForm.lowStockThreshold}
                    onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700">Datasheet PDF URL</label>
                  <input
                    type="url"
                    value={productForm.datasheetUrl}
                    onChange={(e) => setProductForm({ ...productForm, datasheetUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                    placeholder="https://..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700">Image URL</label>
                  <input
                    type="url"
                    value={productForm.images[0] || ''}
                    onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700">Technical Description & Pinouts</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-1 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Save Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
