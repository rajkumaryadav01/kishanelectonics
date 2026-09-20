import { useState } from 'react';
import { ShoppingCart, Check, Scale, Eye, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import { useSettings } from '../context/SettingsContext';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
}

export function ProductCard({ product, navigate }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { settings } = useSettings();

  const [adding, setAdding] = useState(false);
  const inCompare = isInCompare(product.id);

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= (product.lowStockThreshold || 10);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    setAdding(true);
    try {
      await addToCart(product.id, 1);
    } catch (err: any) {
      alert(err.message || 'Failed to add item to cart.');
    } finally {
      setAdding(false);
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80';

  // Extract up to 2 key specifications for quick badge display
  const keySpecs = Object.entries(product.specifications || {}).slice(0, 2);

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => navigate(`/products/${product.id}`)}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer relative"
    >
      {/* Top Media Container */}
      <div className="relative aspect-4/3 bg-slate-100/60 overflow-hidden flex items-center justify-center p-4">
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.discountPercent && product.discountPercent > 0 ? (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              {product.discountPercent}% OFF
            </span>
          ) : null}

          {product.isFeatured && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              Featured
            </span>
          )}
        </div>

        {/* Compare Toggle Button */}
        <button
          onClick={handleCompareToggle}
          title={inCompare ? 'Remove from compare' : 'Add to compare'}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all shadow-xs z-10 ${
            inCompare
              ? 'bg-blue-600 text-white'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-blue-600'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
        </button>

        {/* Stock Status Bar */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] font-medium">
          {isOutOfStock ? (
            <span className="bg-rose-100/90 text-rose-700 px-2 py-0.5 rounded-md font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
              <span>Out of Stock</span>
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-100/90 text-amber-800 px-2 py-0.5 rounded-md font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              <span>Only {product.stockQuantity} left</span>
            </span>
          ) : (
            <span className="bg-emerald-100/90 text-emerald-800 px-2 py-0.5 rounded-md font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>In Stock</span>
            </span>
          )}

          <span className="font-mono text-slate-500 bg-white/80 px-1.5 py-0.5 rounded text-[9px]">
            {product.sku}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-semibold text-cyan-800 truncate max-w-[130px]">{product.brand}</span>
            <span className="text-slate-400 truncate max-w-[100px]">{product.categoryName}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-cyan-700 transition-colors">
            {product.name}
          </h3>

          {/* Key Specs Pills */}
          {keySpecs.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {keySpecs.map(([k, v]) => (
                <span
                  key={k}
                  className="inline-block bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-mono truncate max-w-[180px]"
                >
                  <span className="text-slate-400">{k}:</span> {v}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-extrabold text-slate-900 leading-none">
              {settings.currency}{product.price}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-slate-400 line-through mt-0.5">
                {settings.currency}{product.originalPrice}
              </div>
            )}
          </div>

          <button
            id={`add-to-cart-${product.id}`}
            disabled={isOutOfStock || adding}
            onClick={handleAddToCart}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : adding ? 'Adding...' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
