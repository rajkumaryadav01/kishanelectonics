import { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

interface BuildMyProjectPageProps {
  navigate: (path: string) => void;
}

export function BuildMyProjectPage({ navigate }: BuildMyProjectPageProps) {
  const { openCart, refreshCart } = useCart();
  const { settings } = useSettings();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingProjectId, setAddingProjectId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; text: string } | null>(null);

  const categories = [
    { id: 'all', label: 'All Project Domains' },
    { id: 'Robotics', label: 'Robotics & Automation' },
    { id: 'IoT', label: 'Internet of Things (IoT)' },
    { id: 'Home Automation', label: 'Home Automation' },
    { id: 'Embedded Systems', label: 'Embedded Systems & LIC' },
  ];

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      try {
        const data = await api.getBuildProjects(selectedCategory === 'all' ? undefined : selectedCategory);
        setProjects(data);
      } catch (err) {
        console.error('Failed to load project templates:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [selectedCategory]);

  const handleAddAllToCart = async (projectId: string) => {
    setAddingProjectId(projectId);
    setFeedbackMsg(null);
    try {
      const res = await api.addBuildProjectToCart(projectId);
      await refreshCart();
      setFeedbackMsg({ id: projectId, text: res.message });
      openCart();
    } catch (err: any) {
      alert(err.message || 'Failed to add project components.');
    } finally {
      setAddingProjectId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl border border-blue-900/60 relative overflow-hidden">
        <div className="space-y-4 max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive ECE Engineering Tool</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Build My Project
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
            Planning a university semester lab project or prototyping for a hackathon? Select your technical domain below. Our recommendation engine instantly generates the complete component bill-of-materials (BOM), verifies real-time stock at Kishan Electronics, and adds all necessary parts to your cart in one click.
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat.id
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Formulating circuit BOM and verifying in-store stock...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:shadow-lg transition-all space-y-6"
            >
              {/* Project Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md">
                      {proj.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{proj.estimatedBuildTime}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      • {proj.difficulty} Level
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{proj.title}</h2>
                  <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">{proj.description}</p>
                </div>

                {/* Pricing & Add All Button */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right space-y-2 shrink-0">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                    Estimated Total BOM:
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {settings.currency}{proj.totalEstimatedCost}
                  </div>
                  <button
                    id={`add-all-btn-${proj.id}`}
                    disabled={addingProjectId === proj.id}
                    onClick={() => handleAddAllToCart(proj.id)}
                    className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-600/20"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{addingProjectId === proj.id ? 'Adding Items...' : 'Add All Available To Cart'}</span>
                  </button>
                  {feedbackMsg && feedbackMsg.id === proj.id && (
                    <div className="text-[11px] text-emerald-700 font-semibold text-center">
                      {feedbackMsg.text}
                    </div>
                  )}
                </div>
              </div>

              {/* Circuit Wiring Overview */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 flex items-start space-x-2.5">
                <Cpu className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Circuit Architecture Note: </span>
                  <span className="text-blue-800">{proj.circuitOverview}</span>
                </div>
              </div>

              {/* Required Components Breakdown Table */}
              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Recommended Bill Of Materials ({proj.components.length} Components):
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Component & Purpose</th>
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Recommended Qty</th>
                        <th className="py-3 px-4">Unit Price</th>
                        <th className="py-3 px-4">In-Store Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {proj.components.map((comp: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{comp.productName}</div>
                            <div className="text-[11px] text-slate-500 italic mt-0.5">{comp.purpose}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-cyan-800 font-semibold">{comp.productSku}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{comp.recommendedQty} pcs</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{settings.currency}{comp.price}</td>
                          <td className="py-3 px-4">
                            {comp.inStock ? (
                              <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>In Stock ({comp.currentStock})</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Stock Low / OOS</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {comp.productId ? (
                              <button
                                onClick={() => navigate(`/products/${comp.productId}`)}
                                className="text-cyan-700 hover:text-cyan-900 font-bold text-[11px]"
                              >
                                View Specs →
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Catalog Match</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
