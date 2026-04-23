import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../AppContext';
import { Role } from '../types';
import { Heart, User, Check, AlertCircle, ChevronRight, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, toast } = useApp();
  const [role, setRole] = useState<Role>('Patient');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const roles: { id: Role; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'Patient', label: 'Patient', desc: 'Book appointments and view reports', icon: User },
    { id: 'Doctor', label: 'Doctor', desc: 'Manage your patients and schedule', icon: Heart },
    { id: 'Receptionist', label: 'Receptionist', desc: 'Front desk and bed management', icon: MapPin },
    { id: 'Admin', label: 'Admin', desc: 'Complete system administration', icon: ShieldCheck },
  ];

  const isLoading = loading['login'];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }
    const success = await login(identifier, password, role);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Please check your details and role.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-5xl w-full grid md:grid-cols-2 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
        <div className="hidden md:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 blur-[100px] rounded-full" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-slate-400/10 blur-[60px] rounded-full" />
          <div className="relative z-10 text-center md:text-left">
            <div className="flex items-center gap-2 mb-16 justify-center md:justify-start">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Heart className="w-7 h-7 fill-current" />
              </div>
              <span className="text-3xl font-bold tracking-tight">CareSync</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-8 tracking-tight">
              Empowering healthcare thru <span className="text-blue-400">synchronization.</span>
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm font-medium">
              Join thousands of healthcare professionals and patients using CareSync for a better medical experience.
            </p>
          </div>
          <div className="relative z-10 mt-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex items-center gap-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 overflow-hidden border border-white/20 shadow-lg">
                <img src="https://picsum.photos/seed/nurse/100/100" referrerPolicy="no-referrer" className="grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">Dr. Sarah Wilson</div>
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Cardiology Dept</div>
              </div>
              <div className="ml-auto text-green-400">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-16 flex flex-col justify-center bg-white overflow-y-auto max-h-[90vh] md:max-h-none">
          <div className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-800">Welcome Back</h1>
            <p className="text-slate-500 text-sm">Enter your credentials to continue.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {roles.map((r) => (
              <button key={r.id} onClick={() => setRole(r.id)}
                className={cn("p-3 md:p-4 rounded-[1.5rem] border-2 text-left transition-all relative overflow-hidden group",
                  role === r.id ? "border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/5 scale-[1.02]" : "border-slate-100 hover:border-blue-200 bg-white"
                )}>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-all duration-500",
                  role === r.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40 rotate-3" : "bg-slate-50 text-slate-400"
                )}>
                  <r.icon className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-black block text-slate-800 tracking-tight uppercase italic leading-none">{r.label}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            {(['email', 'phone'] as const).map(m => (
              <button key={m} onClick={() => setLoginMethod(m)}
                className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  loginMethod === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                )}>
                {m === 'email' ? 'Email' : 'Phone'}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <input
                type={loginMethod === 'email' ? 'email' : 'tel'}
                placeholder={loginMethod === 'email' ? `demo@${role.toLowerCase()}.com` : '9000000002'}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-sm focus:bg-white placeholder:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-sm focus:bg-white"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-100 font-bold uppercase tracking-tight">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 font-bold">
              <p className="font-black uppercase tracking-wide mb-1">Demo Credentials</p>
              <p>Admin: admin@caresync.com / Admin@123</p>
              <p>Doctor: sarah.wilson@caresync.com / Doctor@123</p>
              <p>Patient: amit.patel@caresync.com / Patient@123</p>
              <p>Receptionist: mary.thomas@caresync.com / Recept@123</p>
            </div>

            <button disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-30 disabled:cursor-not-allowed group text-xs tracking-[0.2em] uppercase italic">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Login <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <p className="text-center mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            New User? <button onClick={() => navigate('/signup')} className="text-blue-600 hover:underline uppercase font-black">SignUp</button>
          </p>
        </div>
      </div>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
