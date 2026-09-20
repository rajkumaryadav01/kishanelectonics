import { ShieldCheck, RotateCcw, AlertTriangle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export function TermsPrivacyReturnsPage() {
  const { settings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-slate-800 text-xs leading-relaxed">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Store Policies, Pickup Terms & Component Returns
        </h1>
        <p className="text-slate-500 mt-1">
          Official store operations guidelines for {settings.shopName}
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span>1. In-Store Counter Pickup Policy</span>
          </h2>
          <p className="text-slate-600">
            When you choose <strong>Store Pickup</strong> at checkout, your components are immediately packed and reserved in an anti-static pouch under your unique Order ID (e.g. <code>KE-2026-XXXXXX</code>). Orders will be held at our physical counter for up to <strong>7 calendar days</strong>. You can pay cash or UPI at the counter or show your digital receipt upon collection.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 text-cyan-600" />
            <span>2. DOA (Dead on Arrival) & Returns Policy</span>
          </h2>
          <p className="text-slate-600">
            Due to the delicate nature of semiconductors and integrated circuits, components that have been soldered, overheated, or subjected to reversed polarity cannot be returned. However:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
            <li>Any factory-defective development board or sensor will be tested and replaced within <strong>3 days</strong> of purchase with proof of receipt.</li>
            <li>Unopened passive components (resistors, capacitors, jumper wires) may be exchanged within 7 days.</li>
          </ul>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>3. Electrical & Lab Safety Disclaimer</span>
          </h2>
          <p className="text-slate-600">
            Purchaser assumes full responsibility for proper circuit design, current-limiting resistance, and correct voltage levels. High-voltage relay modules (230V AC) and lithium-ion batteries must only be handled with proper insulation and faculty supervision.
          </p>
        </section>
      </div>
    </div>
  );
}
