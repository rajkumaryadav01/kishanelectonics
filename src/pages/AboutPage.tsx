import { ShieldCheck, Store, Award, Users, Cpu, Wrench, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export function AboutPage({ navigate }: AboutPageProps) {
  const { settings } = useSettings();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full uppercase tracking-wider">
          About Our Store
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Empowering ECE Innovators & Hardware Makers Since 2012
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {settings.shopName} was founded with a singular purpose: to make genuine semiconductor ICs, reliable microcontrollers, and precision electronic components easily accessible for engineering students, faculty, and electronics hobbyists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">100% Verified Silicon</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every batch of microcontrollers, op-amps, and digital ICs is tested at our shop test bench to ensure zero counterfeit or non-functional parts.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Physical Counter Pickup</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Have a project demo tomorrow morning? Reserve your components online and pick them up packed and ready at our store counter in Nehru Complex.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Student & Lab Guidance</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our experienced in-store technicians provide pinout consulting, equivalent IC substitutions, and circuit troubleshooting advice.
          </p>
        </div>
      </div>

      {/* Store Highlights & Technical Standards */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold">The Kishan Electronics Standard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Anti-Static (ESD) Safe Storage:</strong> Sensitive MOS and CMOS semiconductors stored and packed in static-shielding bags.
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Full Manufacturer Datasheets:</strong> Access direct PDF datasheets and pin diagrams for every IC and module.
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Transparent Student Pricing:</strong> High-turnover bulk purchasing allows us to pass genuine component discounts to students.
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Complete Project Kits:</strong> Pre-assembled and tested packs eliminating component mismatch for university coursework.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
