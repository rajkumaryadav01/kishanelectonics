import { useState, useEffect } from 'react';
import {
  User,
  Package,
  Heart,
  MapPin,
  Clock,
  Trash2,
  Plus,
  ArrowRight,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';
import { Order, Product } from '../types';

interface ProfilePageProps {
  navigate: (path: string) => void;
}

export function ProfilePage({ navigate }: ProfilePageProps) {
  const { user, token, logout, addresses, addAddress, deleteAddress, setDefaultAddress } = useAuth();
  const { settings } = useSettings();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Address modal form
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [houseShopNo, setHouseShopNo] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [pinCode, setPinCode] = useState('411001');

  useEffect(() => {
    if (token) {
      setLoadingOrders(true);
      Promise.all([api.getUserOrders(), api.getWishlist()])
        .then(([ordRes, wishRes]) => {
          setOrders(ordRes);
          setWishlist(wishRes.products || []);
        })
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    }
  }, [token]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
        <p className="text-xs text-slate-500">
          Sign in to view your past orders, manage delivery addresses, and track in-store counter pickups.
        </p>
        <div className="pt-2">
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseShopNo || !street || !city || !pinCode) return;
    try {
      await addAddress({
        houseShopNo: houseShopNo.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
        isDefault: addresses.length === 0,
      });
      setShowAddAddr(false);
      setHouseShopNo('');
      setStreet('');
    } catch (err: any) {
      alert(err.message || 'Failed to save address');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900">{user.name}</h1>
              {user.role === 'ADMIN' && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.email} • {user.phone}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {user.role === 'ADMIN' && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Admin Dashboard
            </button>
          )}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-3.5 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs text-xs font-bold gap-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'orders'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'addresses'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({addresses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'wishlist'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlist.length})</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="text-center py-8 text-xs text-slate-500">Loading order history...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-900">No orders placed yet</div>
              <p className="text-xs text-slate-500">Explore the catalogue and pick up components from our shop.</p>
              <button
                onClick={() => navigate('/products')}
                className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold"
              >
                Browse Components
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-sm text-slate-900">#{ord.id}</span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800">
                        {ord.orderStatus}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {ord.orderType}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      Placed on {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} items
                    </div>

                    <div className="text-xs font-bold text-slate-800">
                      Total: {settings.currency}{ord.total}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/orders/${ord.id}`)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors self-start sm:self-auto"
                  >
                    <span>Track Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Manage Delivery Locations</h3>
            <button
              onClick={() => setShowAddAddr(true)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 relative shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-cyan-600" />
                    <span className="text-xs font-bold text-slate-900">
                      {addr.houseShopNo}
                    </span>
                  </div>
                  {addr.isDefault && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {addr.street}, {addr.city}, {addr.state} - {addr.pinCode}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-cyan-600 hover:underline font-semibold"
                    >
                      Make Default
                    </button>
                  )}
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-rose-600 hover:text-rose-800 p-1 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Address Modal */}
          {showAddAddr && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <form onSubmit={handleSaveAddress} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <h3 className="text-base font-bold text-slate-900">Add New Address</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700">Room / Shop / Flat No *</label>
                    <input
                      type="text"
                      required
                      value={houseShopNo}
                      onChange={(e) => setHouseShopNo(e.target.value)}
                      placeholder="e.g. Lab #2, Electronics Block"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Street / Area *</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. Near Shivajinagar Bus Stand"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs mt-1"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700">PIN Code</label>
                      <input
                        type="text"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddr(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {wishlist.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-900">Your wishlist is empty</div>
              <p className="text-xs text-slate-500">Save components here to quickly check stock or purchase later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {wishlist.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => navigate(`/products/${prod.id}`)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all cursor-pointer space-y-2"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-full h-32 object-contain bg-slate-50 rounded-xl p-2"
                  />
                  <div className="font-bold text-xs text-slate-900 truncate">{prod.name}</div>
                  <div className="text-xs font-black text-slate-900">
                    {settings.currency}{prod.price}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
