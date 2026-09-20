import { useState, useEffect } from 'react';
import { Scale, X, ShoppingCart, Check, Trash2, ArrowLeft, Plus } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';
import { Product } from '../types';

interface ComparePageProps {
  navigate: (path: string) => void;
}

export function ComparePage({ navigate }: ComparePageProps) {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const { settings } = useSettings();

  const [specKeys, setSpecKeys] = useState<string[]>([]);

  useEffect(() => {
    // Collect union of all specification keys across compared products
    const keySet = new Set<string>();
    compareItems.forEach((p) => {
      Object.keys(p.specifications || {}).forEach((k) => keySet.add(k));
    });
    setSpecKeys(Array.from(keySet).sort());
  }, [compareItems]);

  if (compareItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No components in comparison</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Add up to 4 components from the catalogue or product pages to view side-by-side electrical specifications, pinouts, and prices.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-colors"
        >
          Browse Components
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => navigate('/products')}
            className="text-xs text-cyan-600 hover:text-cyan-800 font-bold flex items-center space-x-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Component Technical Comparison ({compareItems.length} of 4)
          </h1>
        </div>

        <button
          onClick={clearCompare}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Comparison</span>
        </button>
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="p-4 w-44 font-bold text-slate-500 uppercase tracking-wider">
                Specification
              </th>
              {compareItems.map((prod) => (
                <th key={prod.id} className="p-4 min-w-[220px] align-top">
                  <div className="relative space-y-2">
                    <button
                      onClick={() => removeFromCompare(prod.id)}
                      className="absolute -top-2 -right-2 p-1 text-slate-400 hover:text-rose-600"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-24 h-24 object-contain mx-auto bg-slate-50 p-2 rounded-xl border border-slate-100"
                    />
                    <div className="font-extrabold text-sm text-slate-900 text-center line-clamp-2">
                      {prod.name}
                    </div>
                    <div className="text-center font-mono text-[11px] text-cyan-800">{prod.sku}</div>
                    <div className="text-center text-base font-black text-slate-900">
                      {settings.currency}{prod.price}
                    </div>
                    <button
                      disabled={prod.stockQuantity <= 0}
                      onClick={() => addToCart(prod.id, 1)}
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold flex items-center justify-center space-x-1.5 shadow-xs"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{prod.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Brand */}
            <tr className="hover:bg-slate-50">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Brand</td>
              {compareItems.map((p) => (
                <td key={p.id} className="p-4 font-semibold text-slate-800">
                  {p.brand}
                </td>
              ))}
            </tr>

            {/* In-Store Stock */}
            <tr className="hover:bg-slate-50">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">In-Store Stock</td>
              {compareItems.map((p) => (
                <td key={p.id} className="p-4">
                  {p.stockQuantity > 0 ? (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      In Stock ({p.stockQuantity} available)
                    </span>
                  ) : (
                    <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                      Out of Stock
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Dynamic Electrical Specifications */}
            {specKeys.map((key) => (
              <tr key={key} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">{key}</td>
                {compareItems.map((p) => (
                  <td key={p.id} className="p-4 font-mono text-slate-900 font-medium">
                    {p.specifications[key] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
