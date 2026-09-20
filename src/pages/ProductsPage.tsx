import { useState, useEffect } from 'react';
import {
  Filter,
  X,
  Search,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Package,
} from 'lucide-react';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';

interface ProductsPageProps {
  navigate: (path: string) => void;
  initialParams?: {
    category?: string;
    search?: string;
    featured?: boolean;
    popular?: boolean;
  };
}

export function ProductsPage({ navigate, initialParams = {} }: ProductsPageProps) {
  const { settings } = useSettings();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters State
  const [search, setSearch] = useState(initialParams.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialParams.category || 'all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Load Categories once
  useEffect(() => {
    async function loadCats() {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error(err);
      }
    }
    loadCats();
  }, []);

  // Fetch filtered products
  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      try {
        const params: any = {
          sortBy,
          inStockOnly,
          maxPrice,
          limit: 100,
        };

        if (search.trim()) params.search = search.trim();
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
        if (selectedBrand && selectedBrand !== 'all') params.brand = selectedBrand;
        if (initialParams.featured) params.featured = true;
        if (initialParams.popular) params.popular = true;

        const res = await api.getProducts(params);
        setProducts(res.products || []);
        setTotalCount(res.total || 0);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchFiltered, 150);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedBrand, inStockOnly, sortBy, maxPrice, initialParams.featured, initialParams.popular]);

  // Extract unique brands from loaded products
  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort();

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setInStockOnly(false);
    setMaxPrice(3000);
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Search Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Electronics & ECE Components
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {totalCount} verified items available at Kishan Electronics
          </p>
        </div>

        {/* Quick Search & Mobile Filter Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components or SKU..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-4 py-2 rounded-xl text-xs focus:bg-white focus:border-cyan-600 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 shrink-0"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block space-y-5 bg-white p-5 rounded-2xl border border-slate-200 h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-800">
              <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
              <span>Catalog Filters</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-cyan-600 hover:text-cyan-800 font-semibold flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Category
            </label>
            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-50 font-bold text-cyan-800'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-50 font-bold text-cyan-800'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                    {cat.productCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          {uniqueBrands.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Brand / Manufacturer
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2 focus:outline-hidden"
              >
                <option value="all">All Brands ({uniqueBrands.length})</option>
                {uniqueBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range Slider */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span className="uppercase tracking-wider">Max Price</span>
              <span className="text-cyan-800 font-extrabold">
                {settings.currency}{maxPrice}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="3500"
              step="20"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{settings.currency}20</span>
              <span>{settings.currency}3500+</span>
            </div>
          </div>

          {/* Stock Availability Toggle */}
          <div className="pt-3 border-t border-slate-100">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4 accent-cyan-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-700">
                In Stock at Store Only
              </span>
            </label>
          </div>
        </div>

        {/* Main Products Grid */}
        <div className="md:col-span-3 space-y-4">
          {/* Sorting Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-500">
              Showing <span className="font-bold text-slate-900">{products.length}</span> components
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-medium">Sort By:</span>
              <select
                id="products-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
              >
                <option value="featured">Featured First</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Customer Rating</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Additions</option>
              </select>
            </div>
          </div>

          {/* Products Grid / Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse p-4 space-y-4"
                >
                  <div className="h-40 bg-slate-100 rounded-xl"></div>
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-100 rounded mt-4"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-slate-900">No components match your filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range, searching by alternative model numbers, or resetting your filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-5 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="font-extrabold text-sm text-slate-900">Filters</div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">Category</div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* In Stock */}
              <div>
                <label className="flex items-center space-x-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-cyan-600 w-4 h-4 accent-cyan-600"
                  />
                  <span>In Stock at Store Only</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 bg-cyan-600 text-white rounded-xl text-xs font-bold shadow-md"
            >
              Apply Filters ({totalCount} Products)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
