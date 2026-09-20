import { useState, useEffect } from 'react';
import { CheckCircle2, ShoppingCart, Sparkles, Layers, Box, Cpu, ArrowRight } from 'lucide-react';
import { ProjectKit } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

interface ProjectKitsPageProps {
  navigate: (path: string) => void;
}

export function ProjectKitsPage({ navigate }: ProjectKitsPageProps) {
  const { addToCart } = useCart();
  const { settings } = useSettings();

  const [kits, setKits] = useState<ProjectKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadKits() {
      try {
        const data = await api.getProjectKits();
        setKits(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadKits();
  }, []);

  const filteredKits = kits.filter((k) =>
    selectedDifficulty === 'all' ? true : k.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
  );

  const handleAddKit = async (kit: ProjectKit) => {
    setAddingId(kit.id);
    try {
      await addToCart(kit.id, 1, true);
    } catch (err: any) {
      alert(err.message || 'Failed to add kit to cart');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-xs font-bold">
            <Box className="w-3.5 h-3.5" />
            <span>Complete Hardware Kits</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Curated ECE & Robotics Project Starter Kits
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Everything you need in one organized box. Each kit contains verified genuine components, cables, sensors, and microcontrollers carefully bundled for seamless engineering lab experiments and university project submissions.
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex flex-wrap gap-1.5 shrink-0 text-xs font-semibold">
          {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedDifficulty(lvl)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-colors ${
                selectedDifficulty === lvl
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Kits List Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Loading project starter kits...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredKits.map((kit) => (
            <div
              key={kit.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-52 bg-slate-100/70 p-6 relative flex items-center justify-center border-b border-slate-100">
                  <img
                    src={kit.imageUrl}
                    alt={kit.name}
                    className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-3 left-3 bg-cyan-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                    {kit.difficulty}
                  </div>
                  <div className="absolute top-3 right-3 font-mono text-[10px] bg-white/90 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                    {kit.sku}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wide">
                      {kit.category}
                    </span>
                    <h3 className="font-black text-lg text-slate-900 mt-1">{kit.name}</h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {kit.description}
                  </p>

                  {/* Components Included List */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                    <div className="font-extrabold text-[11px] uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Components Included ({kit.components.length} Items):</span>
                    </div>
                    <ul className="space-y-1.5 text-xs">
                      {kit.components.map((comp, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-medium">{comp.productName}</span>
                          <span className="text-slate-400 text-[11px]">× {comp.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div className="pt-4">
                  <div className="text-2xl font-black text-slate-900">
                    {settings.currency}{kit.price}
                  </div>
                  {kit.originalPrice && (
                    <div className="text-xs text-slate-400 line-through">
                      {settings.currency}{kit.originalPrice}
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    disabled={addingId === kit.id}
                    onClick={() => handleAddKit(kit)}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md shadow-cyan-600/20"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{addingId === kit.id ? 'Adding...' : 'Add Kit to Cart'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
