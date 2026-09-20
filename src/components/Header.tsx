import { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Search,
  ShoppingCart,
  User as UserIcon,
  Menu,
  X,
  Scale,
  Bell,
  LogOut,
  ShieldAlert,
  Package,
  Wrench,
  Layers,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';

interface HeaderProps {
  currentRoute?: string;
  currentPath?: string;
  navigate: (route: string) => void;
}

export function Header({ currentRoute, currentPath, navigate }: HeaderProps) {
  const activeRoute = currentRoute || currentPath || '/';
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, openCart } = useCart();
  const { compareItems } = useCompare();
  const { settings } = useSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Autocomplete suggestions debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await api.searchSuggestions(searchQuery.trim());
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search & notifications
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      if (user) {
        const res = await api.getNotifications();
        setNotifications(res.items);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      // benign
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectSuggestion = (prodId: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/products/${prodId}`);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Categories', path: '/categories' },
    { label: 'Project Kits', path: '/project-kits' },
    { label: 'Build My Project', path: '/build-my-project', badge: 'ECE Tool' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Announcement Bar for Store Pickup Notice & Quick Contact */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Local Store Pickup Available: Shop Counter Ready in 30 Mins</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{settings.openingHours}</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Order Desk: {settings.phone}</span>
            </a>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-0.5 rounded text-[11px] flex items-center space-x-1 transition-colors"
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Admin Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo & Branding */}
          <div
            id="brand-logo"
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                {settings.shopName.split(' ')[0]}{' '}
                <span className="text-cyan-600">{settings.shopName.split(' ')[1] || 'Electronics'}</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
                ECE & Component Store
              </div>
            </div>
          </div>

          {/* Search Bar with Autocomplete */}
          <div ref={searchRef} className="relative flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                placeholder="Search electronic components, ICs, sensors, modules, SKU (e.g. LM358, ESP32)..."
                className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-cyan-600 focus:bg-white text-slate-900 pl-11 pr-24 py-2 rounded-xl text-sm transition-all focus:outline-hidden focus:ring-3 focus:ring-cyan-500/20"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                Search
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                <div className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
                  <span>Matching Components</span>
                  <span>{suggestions.length} results</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item.id)}
                      className="px-3 py-2.5 hover:bg-cyan-50/70 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 bg-slate-100"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                            <span className="font-mono text-cyan-700">{item.sku}</span>
                            <span>•</span>
                            <span>{item.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-slate-900 whitespace-nowrap ml-2">
                        {settings.currency}{item.price}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  onClick={() => {
                    setShowSuggestions(false);
                    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
                  }}
                  className="px-3 py-2 text-center text-xs font-medium text-cyan-600 hover:text-cyan-700 cursor-pointer bg-slate-50"
                >
                  View all search results for &ldquo;{searchQuery}&rdquo; →
                </div>
              </div>
            )}
          </div>

          {/* Right Controls (Compare, Notifications, User Profile, Cart) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Compare Button */}
            <button
              id="header-compare-btn"
              onClick={() => navigate('/compare')}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Product Comparison"
            >
              <Scale className="w-5 h-5" />
              {compareItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-blue-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {compareItems.length}
                </span>
              )}
            </button>

            {/* Notifications (for logged-in user or admin) */}
            {user && (
              <div ref={notifRef} className="relative">
                <button
                  id="header-notif-btn"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    loadNotifications();
                  }}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                    <div className="px-4 py-3 bg-slate-50 flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-900">Notifications & Alerts</div>
                      <button
                        onClick={async () => {
                          await api.markAllNotificationsRead();
                          loadNotifications();
                        }}
                        className="text-[11px] font-medium text-cyan-600 hover:text-cyan-800"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              api.markNotificationRead(n.id);
                              if (n.linkUrl) navigate(n.linkUrl);
                              setNotificationsOpen(false);
                            }}
                            className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                              !n.read ? 'bg-cyan-50/50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{n.title}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.createdAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Button */}
            <button
              id="header-cart-btn"
              onClick={openCart}
              className="relative flex items-center space-x-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 px-3 py-2 rounded-xl transition-all font-semibold text-sm border border-cyan-200"
            >
              <ShoppingCart className="w-5 h-5 text-cyan-700" />
              <span className="hidden sm:inline">Cart</span>
              <span className="w-5 h-5 bg-cyan-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-xs">
                {itemCount}
              </span>
            </button>

            {/* Profile / Login Menu */}
            {user ? (
              <div className="relative group">
                <button
                  id="header-user-menu-btn"
                  onClick={() => navigate(isAdmin ? '/admin' : '/profile')}
                  className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Hover Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{user.role.toLowerCase()}</div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="w-full text-left px-3 py-2 text-xs text-amber-700 font-semibold hover:bg-amber-50 flex items-center space-x-2"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile & Orders</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => navigate('/login')}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="header-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Links Bar (Desktop) */}
      <nav className="border-t border-slate-100 bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 py-1">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/' ? activeRoute === '/' : activeRoute.startsWith(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all relative flex items-center space-x-1.5 ${
                    isActive
                      ? 'text-cyan-700 bg-cyan-50/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 pl-10 pr-4 py-2 rounded-xl text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Mobile Nav Links */}
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/' ? activeRoute === '/' : activeRoute.startsWith(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                    isActive ? 'bg-cyan-50 text-cyan-800' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {isAdmin && (
              <button
                onClick={() => {
                  navigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3.5 py-2.5 rounded-xl text-sm font-bold bg-amber-50 text-amber-900 flex items-center space-x-2"
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Store Admin Portal</span>
              </button>
            )}

            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user.name})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-900 hover:bg-slate-50 flex items-center space-x-2"
              >
                <UserIcon className="w-4 h-4 text-slate-600" />
                <span>Customer Login / Register</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
