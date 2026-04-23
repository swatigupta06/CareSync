import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { Role } from '../types';
import { Heart, User, AlertCircle, ChevronRight, MapPin, Shield, Fingerprint } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading } = useApp();
  const [role, setRole] = useState<Role>('Patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [password, setPassword] = useState('');
  const [aadhaarStatus, setAadhaarStatus] = useState<'none' | 'verified'>('none');
  const [isVerifyingAadhaar, setIsVerifyingAadhaar] = useState(false);
  const [error, setError] = useState('');

  const roles: { id: Role; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'Patient', label: 'Patient', icon: User },
    { id: 'Doctor', label: 'Doctor', icon: Heart },
    { id: 'Receptionist', label: 'Receptionist', icon: MapPin },
  ];

  const isLoading = loading['signup'];

  const handleVerifyAadhaar = () => {
    if (aadhaar.length !== 12) { setError('Aadhaar must be exactly 12 digits'); return; }
    setIsVerifyingAadhaar(true); setError('');
    setTimeout(() => { setAadhaarStatus('verified'); setIsVerifyingAadhaar(false); }, 1500);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !password || (role === 'Patient' && !aadhaar)) {
      setError('Please fill in all required fields'); return;
    }
    setError('');
    const success = await signup({
      name: fullName, email: email || undefined, phoneNumber: phone,
      password, role,
      aadhaarNumber: role === 'Patient' ? aadhaar : undefined,
      allergies: [],
    });
    if (success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-6xl w-full grid md:grid-cols-2 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
        <div className="hidden md:flex flex-col justify-between p-12 bg-blue-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[120px] rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-16">
              <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Shield className="w-7 h-7 fill-current" />
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase italic">CareSync</span>
            </div>
            <h2 className="text-5xl font-black leading-[0.9] mb-10 tracking-tighter uppercase">
              The Protocol <br /> for Secure <br /><span className="text-slate-900/40">Medicine.</span>
            </h2>
            <div className="space-y-4">
              {[
                { icon: Fingerprint, text: 'Identity Resolution with Aadhaar' },
                { icon: Shield, text: 'Permission-based Data Exchange' },
                { icon: MapPin, text: 'Real-time Facility Synchronization' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 px-5 rounded-2xl border border-white/10 w-fit">
                  <item.icon className="w-4 h-4 text-slate-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-14 flex flex-col justify-center bg-white overflow-y-auto max-h-screen">
          <div className="mb-6">
            <h1 className="text-3xl font-black tracking-tighter mb-2 text-slate-900 uppercase italic">Create Account</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Join the CareSync healthcare network</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {roles.map(r => (
              <button key={r.id} onClick={() => setRole(r.id)}
                className={cn("p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center",
                  role === r.id ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-blue-200"
                )}>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-all",
                  role === r.id ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"
                )}>
                  <r.icon className="w-4 h-4" />
                </div>
                <div className="text-[9px] font-black text-slate-800 tracking-tight uppercase">{r.label}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                <input type="text" required placeholder="Enter full name" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-blue-600 transition-all font-bold text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Optional)</label>
                <input type="email" placeholder="name@email.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-blue-600 transition-all font-bold text-sm" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone *</label>
                <input type="tel" required placeholder="9XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-blue-600 transition-all font-bold text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password *</label>
                <input type="password" required placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-blue-600 transition-all font-bold text-sm" />
              </div>
            </div>

            {role === 'Patient' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Fingerprint className="w-3 h-3 text-blue-600" /> Aadhaar Verification *
                </label>
                <div className="flex gap-2">
                  <input type="text" maxLength={12} placeholder="12-digit Aadhaar" value={aadhaar}
                    onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-mono font-bold tracking-widest text-sm" />
                  <button type="button" onClick={handleVerifyAadhaar} disabled={isVerifyingAadhaar || aadhaarStatus === 'verified'}
                    className={cn("px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                      aadhaarStatus === 'verified' ? "bg-green-100 text-green-700" : "bg-blue-600 text-white hover:bg-blue-700"
                    )}>
                    {isVerifyingAadhaar ? '...' : aadhaarStatus === 'verified' ? 'Verified ✓' : 'Verify'}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-[10px] font-black border border-red-100 uppercase">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </div>
            )}

            <button disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl group text-[10px] tracking-[0.2em] uppercase italic">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <p className="text-center mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Already registered? <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline uppercase font-black">Login</button>
          </p>
        </div>
      </div>
    </div>
  );
}
