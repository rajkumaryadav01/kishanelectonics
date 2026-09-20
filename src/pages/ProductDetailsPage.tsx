import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Check,
  Scale,
  FileText,
  MessageSquare,
  Star,
  ShieldCheck,
  Store,
  Truck,
  Plus,
  Minus,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  Info,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailsPageProps {
  productId: string;
  navigate: (path: string) => void;
}

export function ProductDetailsPage({ productId, navigate }: ProductDetailsPageProps) {
  const { addToCart } = useCart();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { settings } = useSettings();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'reviews' | 'qa'>('specs');

  // Review submission form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  // Question submission form
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [qaMsg, setQaMsg] = useState('');

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const data = await api.getProduct(productId);
        setProduct(data);
        setSelectedImage(0);
        setQuantity(1);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    window.scrollTo(0, 0);
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xs text-slate-500">Loading component specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Component not found</h2>
        <p className="text-xs text-slate-500">The product you are looking for may have been retired or moved.</p>
        <button
          onClick={() => navigate('/products')}
          className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold"
        >
          Browse All Products
        </button>
      </div>
    );
  }

  const inCompare = isInCompare(product.id);
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= (product.lowStockThreshold || 10);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'];

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
    } catch (err: any) {
      alert(err.message || 'Could not add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingReview(true);
    try {
      await api.submitReview(product.id, { rating, comment: comment.trim() });
      setReviewMsg('Thank you! Your verified review has been published.');
      setComment('');
      const updated = await api.getProduct(product.id);
      setProduct(updated);
    } catch (err: any) {
      setReviewMsg(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setSubmittingQuestion(true);
    try {
      await api.submitQuestion(product.id, newQuestion.trim());
      setQaMsg('Your question was submitted! Kishan Electronics staff will reply shortly.');
      setNewQuestion('');
      const updated = await api.getProduct(product.id);
      setProduct(updated);
    } catch (err: any) {
      setQaMsg(err.message || 'Failed to submit question.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // WhatsApp enquiry pre-filled text
  const whatsappText = encodeURIComponent(
    `Hello Kishan Electronics! I am interested in ordering/enquiring about:
- Product: ${product.name}
- SKU: ${product.sku}
- Price: ${settings.currency}${product.price}
Could you please confirm current in-store counter availability?`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center space-x-1.5 text-xs text-slate-500">
        <button onClick={() => navigate('/')} className="hover:text-slate-800">Home</button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <button onClick={() => navigate('/products')} className="hover:text-slate-800">Products</button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <button
          onClick={() => navigate(`/products?category=${product.categoryId}`)}
          className="hover:text-slate-800"
        >
          {product.categoryName}
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-900 font-bold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Top Grid (Gallery & Core Buy Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square bg-slate-100/70 rounded-2xl border border-slate-200 p-6 flex items-center justify-center overflow-hidden">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply transition-all duration-300"
            />
            {product.discountPercent && product.discountPercent > 0 ? (
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                {product.discountPercent}% OFF
              </span>
            ) : null}
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-xl border-2 p-1 bg-slate-50 shrink-0 transition-all ${
                    selectedImage === idx
                      ? 'border-cyan-600 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Brand, SKU & Category tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-extrabold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md">
                {product.brand}
              </span>
              <span className="font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                SKU: {product.sku}
              </span>
              {product.modelNumber && (
                <span className="text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  Model: {product.modelNumber}
                </span>
              )}
              <span className="text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                {product.categoryName}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-slate-800">{product.rating}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">{product.reviewCount} customer reviews</span>
            </div>

            {/* Pricing Area */}
            <div className="flex items-baseline space-x-3 pt-2">
              <span className="text-3xl font-black text-slate-900">
                {settings.currency}{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-slate-400 line-through font-semibold">
                  {settings.currency}{product.originalPrice}
                </span>
              )}
              <span className="text-xs text-slate-500">
                (Inclusive of all local shop taxes)
              </span>
            </div>

            {/* In-Store Stock Availability Badge */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                {isOutOfStock ? (
                  <>
                    <span className="w-3 h-3 rounded-full bg-rose-600"></span>
                    <div>
                      <span className="font-bold text-rose-700">Currently Out of Stock</span>
                      <p className="text-[11px] text-slate-500">Restocking in progress</p>
                    </div>
                  </>
                ) : isLowStock ? (
                  <>
                    <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
                    <div>
                      <span className="font-bold text-amber-800">
                        Low Stock at Shop Counter (Only {product.stockQuantity} remaining)
                      </span>
                      <p className="text-[11px] text-slate-500">Order online to reserve before it sells out</p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <div>
                      <span className="font-bold text-emerald-800">
                        In Stock ({product.stockQuantity} units available)
                      </span>
                      <p className="text-[11px] text-slate-500">Available for immediate shop pickup or dispatch</p>
                    </div>
                  </>
                )}
              </div>

              {/* Compare toggle */}
              <button
                onClick={() => (inCompare ? removeFromCompare(product.id) : addToCompare(product))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                  inCompare
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:border-blue-600 hover:text-blue-600'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{inCompare ? 'Compared' : 'Compare'}</span>
              </button>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center space-x-2 border border-slate-300 rounded-xl p-1 bg-white">
                  <button
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    disabled={quantity >= product.stockQuantity || isOutOfStock}
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  id="product-details-add-cart-btn"
                  disabled={isOutOfStock || addingToCart}
                  onClick={handleAddToCart}
                  className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98 ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                </button>

                <button
                  id="product-details-buy-now-btn"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all border ${
                    isOutOfStock
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-md'
                  }`}
                >
                  <span>Buy / Reserve Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Direct WhatsApp Enquiry Button */}
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappText}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Enquire On WhatsApp About This Part</span>
              </a>
            </div>
          </div>

          {/* Guarantee highlights */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Store className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>Free Store Pickup Counter</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Genuine Silicon Tested</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Tabs & Information Sections */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-6 py-3.5 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'specs'
                ? 'border-cyan-600 text-cyan-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Info className="w-4 h-4 text-cyan-600" />
            <span>Technical Specifications</span>
          </button>
          <button
            onClick={() => setActiveTab('desc')}
            className={`px-6 py-3.5 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'desc'
                ? 'border-cyan-600 text-cyan-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-600" />
            <span>Description & Applications</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3.5 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'reviews'
                ? 'border-cyan-600 text-cyan-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500" />
            <span>Customer Reviews ({product.reviewCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-6 py-3.5 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'qa'
                ? 'border-cyan-600 text-cyan-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-cyan-600" />
            <span>Q&A / Technical Enquiries ({(product.questions || []).length})</span>
          </button>
        </div>

        {/* Tab 1: Technical Specifications Table & Datasheet PDF */}
        {activeTab === 'specs' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  ECE Technical Parameters & Pin Specifications
                </h3>
                <p className="text-xs text-slate-500">
                  Lab verified electrical and thermal properties for circuit schematic design
                </p>
              </div>

              {/* Datasheet Download Button */}
              {product.datasheetUrl && (
                <a
                  href={product.datasheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-2 transition-colors shrink-0 shadow-xs"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download Official PDF Datasheet</span>
                </a>
              )}
            </div>

            {/* Specifications Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-slate-100 border border-slate-100 rounded-xl">
                  {Object.entries(product.specifications || {}).map(([key, val], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="px-4 py-3 font-semibold text-slate-600 w-1/3 border-r border-slate-100">
                        {key}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-slate-900">
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Full Description, Features, Applications */}
        {activeTab === 'desc' && (
          <div className="p-6 sm:p-8 space-y-6 text-xs text-slate-700 leading-relaxed">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 mb-2">Product Overview</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900 mb-2">Key Features</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.applications && product.applications.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900 mb-2">Typical Applications</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
                  {product.applications.map((app, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0 mt-1.5"></span>
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="p-6 sm:p-8 space-y-8">
            {/* Reviews List */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Verified Customer Feedback</h3>
              {(product.reviews || []).length === 0 ? (
                <p className="text-xs text-slate-500">No reviews yet. Be the first to review this component!</p>
              ) : (
                <div className="space-y-3">
                  {product.reviews?.map((r) => (
                    <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{r.userName}</span>
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${
                                idx < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">{r.comment}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a Review */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Leave a Review</h4>
              {reviewMsg && (
                <div className="p-3 bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs rounded-xl font-medium">
                  {reviewMsg}
                </div>
              )}
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-semibold text-slate-700">Rating:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your practical experience with this component..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                  rows={3}
                  required
                />

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 4: Q&A */}
        {activeTab === 'qa' && (
          <div className="p-6 sm:p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Questions & Answers</h3>
              {(product.questions || []).length === 0 ? (
                <p className="text-xs text-slate-500">Have a technical question about pinouts or voltage tolerances? Ask below!</p>
              ) : (
                <div className="space-y-4">
                  {product.questions?.map((q) => (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-start space-x-2">
                        <span className="font-bold text-cyan-800 text-xs shrink-0">Q:</span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-900">{q.question}</p>
                          <span className="text-[10px] text-slate-400">Asked by {q.userName}</span>
                        </div>
                      </div>

                      {q.answer ? (
                        <div className="flex items-start space-x-2 pl-4 border-l-2 border-cyan-500 pt-1">
                          <span className="font-bold text-emerald-700 text-xs shrink-0">A:</span>
                          <div>
                            <p className="text-xs text-slate-700">{q.answer}</p>
                            <span className="text-[10px] text-emerald-700 font-semibold">Answered by Kishan Electronics Counter</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 pl-4 italic">
                          Awaiting answer from shop technicians.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ask a Question Form */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Ask a Component Question</h4>
              {qaMsg && (
                <div className="p-3 bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs rounded-xl font-medium">
                  {qaMsg}
                </div>
              )}
              <form onSubmit={handleQuestionSubmit} className="space-y-3">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. Can this sensor operate on 3.3V logic or does it require a 5V level shifter?"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingQuestion}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  {submittingQuestion ? 'Submitting...' : 'Submit Question'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Related Products Grid */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Frequently Bought Together & Related Components
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {product.relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} navigate={navigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
