import { Scale, X, ArrowRight } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

interface CompareFloatingBarProps {
  navigate: (path: string) => void;
}

export function CompareFloatingBar({ navigate }: CompareFloatingBarProps) {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();

  if (compareItems.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-slate-900 text-white rounded-2xl p-3 sm:px-4 shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-slide-up">
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
          <Scale className="w-5 h-5" />
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-bold leading-tight">Compare Components</div>
          <div className="text-[10px] text-slate-400">
            {compareItems.length} of 4 items selected
          </div>
        </div>

        {/* Selected Items Thumbnails */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          {compareItems.map((prod) => (
            <div
              key={prod.id}
              className="relative group w-9 h-9 rounded-lg bg-white p-0.5 border border-slate-600 shrink-0"
            >
              <img
                src={prod.images[0] || ''}
                alt={prod.name}
                className="w-full h-full object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromCompare(prod.id);
                }}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={clearCompare}
          className="text-xs text-slate-400 hover:text-white px-2 py-1"
        >
          Clear
        </button>
        <button
          id="floating-compare-now-btn"
          onClick={() => navigate('/compare')}
          className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <span>Compare Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
