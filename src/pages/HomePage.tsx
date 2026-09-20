import { useState, useEffect } from 'react';
import {
  Cpu,
  Search,
  ArrowRight,
  ShieldCheck,
  Store,
  FileText,
  Users,
  Sparkles,
  Zap,
  Layers,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Product, Category, ProjectKit } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';

interface HomePageProps {
  navigate: (path: string) => void;
}

export function HomePage({ navigate }: HomePageProps) {
  const { settings } = useSettings();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [projectKits, setProjectKits] = useState<ProjectKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [cats, featRes, popRes, kits] = await Promise.all([
          api.getCategories(),
          api.getProducts({ featured: true, limit: 8 }),
          api.getProducts({ popular: true, limit: 8 }),
          api.getProjectKits(),
        ]);

        setCategories(cats);
        setFeaturedProducts(featRes.products || []);
        setPopularProducts(popRes.products || []);
        setProjectKits(kits);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Subtle engineering grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official ECE Hardware & Component Supplier</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            {settings.shopName}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {settings.tagline}. High-grade ICs, microcontrollers, sensors, IoT modules, and ready-to-assemble project kits for engineering students, hobbyists, and lab researchers.
          </p>

          {/* Hero Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <form
              onSubmit={handleHeroSearchSubmit}
              className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-2xl shadow-cyan-900/40 border border-slate-200"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" />
              <input
                id="hero-search-input"
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search by part name or SKU (e.g. LM358, ESP32, SG90, 555 Timer)..."
                className="w-full bg-transparent px-3 py-2 text-slate-900 text-sm focus:outline-hidden placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shrink-0"
              >
                Search Store
              </button>
            </form>
          </div>

          {/* Quick CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/products')}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-md"
            >
              <span>Browse All Components</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/build-my-project')}
              className="px-5 py-2.5 rounded-xl bg-blue-900/60 hover:bg-blue-800/80 border border-blue-500/40 text-blue-200 text-xs font-bold flex items-center space-x-2 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Build My Project (ECE Tool)</span>
            </button>
            <button
              onClick={() => navigate('/project-kits')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-2 transition-all"
            >
              <span>Explore Project Kits</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <Store className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-white">Shop Pickup Counter</div>
                <div className="text-[11px] text-slate-400">Ready in 30 mins, 0 fee</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="font-bold text-white">100% Genuine ICs</div>
                <div className="text-[11px] text-slate-400">Tested & verified stock</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <div className="font-bold text-white">Full PDF Datasheets</div>
                <div className="text-[11px] text-slate-400">Pinouts & technical specs</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-white">Student Project Desk</div>
                <div className="text-[11px] text-slate-400">Custom guidance & kits</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES BROWSER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Component Categories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore 20+ specialized electronics divisions for your hardware design
            </p>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-800 flex items-center space-x-1"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.slice(0, 12).map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/products?category=${cat.id}`)}
              className="group bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/5 transition-all cursor-pointer flex flex-col items-center text-center space-y-2"
            >
              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 group-hover:bg-cyan-50 transition-colors">
                <img
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=150&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform"
                />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-500">
                  {cat.productCount || 0} Products
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Featured Components
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hand-picked development boards, high-demand ICs, and sensor modules
            </p>
          </div>
          <button
            onClick={() => navigate('/products?featured=true')}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-800 flex items-center space-x-1"
          >
            <span>View More</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* 4. "BUILD MY PROJECT" CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>ECE Student Project Generator</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Don&apos;t know all the components you need for your project?
            </h3>
            <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">
              Use our intelligent <strong>Build My Project</strong> tool. Select your domain—Robotics, IoT, Home Automation, or Embedded Systems—and inspect the exact circuit components needed, with a single-click <strong>&ldquo;Add All to Cart&rdquo;</strong> button!
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/build-my-project')}
                className="px-5 py-3 bg-white hover:bg-blue-50 text-blue-950 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all shadow-md active:scale-95"
              >
                <span>Launch Project Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual project tags */}
          <div className="w-full lg:w-auto grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <div className="text-xs font-bold">Line Following Robot</div>
              <div className="text-[11px] text-blue-300 mt-0.5">Arduino • Dual IR • L298N</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <div className="text-xs font-bold">IoT Weather Station</div>
              <div className="text-[11px] text-blue-300 mt-0.5">ESP32 • LCD I2C • Cloud</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <div className="text-xs font-bold">Obstacle Avoider Rover</div>
              <div className="text-[11px] text-blue-300 mt-0.5">Ultrasonic • Servo • Chassis</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <div className="text-xs font-bold">Smart Home Relays</div>
              <div className="text-[11px] text-blue-300 mt-0.5">Optocoupler • 230V Mains</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. POPULAR & LAB ESSENTIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Popular Lab & Workshop Essentials
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              High-turnover components trusted by local Pune colleges and maker labs
            </p>
          </div>
          <button
            onClick={() => navigate('/products?popular=true')}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-800 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* 6. PROJECT KITS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Complete Project Starter Kits
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Boxed packs containing all matched sensors, controllers, and jumpers in one package
            </p>
          </div>
          <button
            onClick={() => navigate('/project-kits')}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-800 flex items-center space-x-1"
          >
            <span>Browse All Kits</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projectKits.slice(0, 3).map((kit) => (
            <div
              key={kit.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-slate-100 p-4 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={kit.imageUrl}
                    alt={kit.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                  <div className="absolute top-3 left-3 bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {kit.difficulty} Level
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-cyan-800 uppercase tracking-wide">
                      {kit.category}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 mt-0.5">{kit.name}</h3>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {kit.description}
                  </p>

                  {/* Components summary */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs">
                    <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1.5">
                      Included In Kit:
                    </div>
                    <div className="space-y-1">
                      {kit.components.slice(0, 3).map((c) => (
                        <div key={c.productId} className="flex items-center space-x-1.5 text-slate-600 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{c.productName} (x{c.quantity})</span>
                        </div>
                      ))}
                      {kit.components.length > 3 && (
                        <div className="text-[10px] text-cyan-700 font-semibold pl-5">
                          + {kit.components.length - 3} more parts
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-3">
                <div className="pt-3">
                  <div className="text-lg font-extrabold text-slate-900">
                    {settings.currency}{kit.price}
                  </div>
                  {kit.originalPrice && (
                    <div className="text-xs text-slate-400 line-through">
                      {settings.currency}{kit.originalPrice}
                    </div>
                  )}
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    onClick={() => navigate('/project-kits')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={async () => {
                      await addToCart(kit.id, 1, true);
                    }}
                    className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Add Kit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. PHYSICAL SHOP VISIT & CONTACT HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 text-slate-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/40 text-emerald-400 text-xs font-bold">
                <Store className="w-3.5 h-3.5" />
                <span>Visit Our Physical Store</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Experience Kishan Electronics In Person
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                Need components urgently for your college semester project or company prototyping demo? Visit our shop counter for instant in-person testing, hands-on advice, and immediate pickup.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Shop Address</div>
                    <div className="text-slate-400 mt-0.5">{settings.address}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Store Hours</div>
                    <div className="text-slate-400 mt-0.5">{settings.openingHours}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-4 text-center">
              <div className="text-sm font-bold text-white">Direct Store Connect</div>
              <div className="space-y-2">
                <a
                  href={`tel:${settings.phone}`}
                  className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {settings.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Enquiry</span>
                </a>
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Google Maps Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
