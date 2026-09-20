import { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  navigate: (path: string) => void;
  redirectTo?: string;
}

export function AuthPage({ navigate, redirectTo = '/profile' }: AuthPageProps) {
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim() || !phone.trim()) {
          throw new Error('Please fill in your name and phone number.');
        }
        await register(name.trim(), email.trim(), password, phone.trim());
      }
      navigate(redirectTo);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setIsLogin(true);
    setEmail('admin@kishan.com');
    setPassword('admin123');
  };

  const handleFillDemoCustomer = () => {
    setIsLogin(true);
    setEmail('customer@example.com');
    setPassword('customer123');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Brand logo & header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black text-xl mx-auto shadow-md">
          KE
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h1>
        <p className="text-xs text-slate-500">
          {isLogin
            ? 'Access your saved ECE orders and store pickup receipts'
            : 'Join Kishan Electronics for instant lab project component reservations'}
        </p>
      </div>

      {/* Demo Credentials Quick-Fill Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-700 font-bold">
          <span className="flex items-center space-x-1.5 text-cyan-800">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>Quick Demo Logins:</span>
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleFillDemoAdmin}
            className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors"
          >
            Admin (Full Access)
          </button>
          <button
            type="button"
            onClick={handleFillDemoCustomer}
            className="flex-1 py-1.5 px-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-[11px] font-bold transition-colors"
          >
            Student Customer
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4"
      >
        {!isLogin && (
          <>
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Joshi"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-hidden"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Phone Number *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-hidden"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </>
        )}

        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-700">Email Address *</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@college.edu"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-hidden"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-700">Password *</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-hidden"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 active:scale-98 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-600/20"
        >
          <span>{loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-2 text-center text-xs text-slate-500">
          {isLogin ? "Don't have an account yet?" : 'Already registered?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
            }}
            className="text-cyan-800 font-bold hover:underline ml-1"
          >
            {isLogin ? 'Register now' : 'Sign in here'}
          </button>
        </div>
      </form>
    </div>
  );
}
