import { useState, useEffect } from 'react';
import { Layers, ArrowRight, Package } from 'lucide-react';
import { Category } from '../types';
import { api } from '../services/api';

interface CategoriesPageProps {
  navigate: (path: string) => void;
}

export function CategoriesPage({ navigate }: CategoriesPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Component Categories & Disciplines
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Browse through our structured ECE divisions, from discrete passive semiconductors to complete SoC development boards
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Loading component divisions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/products?category=${cat.id}`)}
              className="group bg-white rounded-3xl border border-slate-200 p-6 hover:border-cyan-500/80 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2.5 group-hover:bg-cyan-50 transition-colors">
                  <img
                    src={cat.imageUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=150&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform"
                  />
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-cyan-800 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="font-semibold text-slate-500">
                  {cat.productCount || 0} Components
                </span>
                <span className="font-bold text-cyan-800 group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
