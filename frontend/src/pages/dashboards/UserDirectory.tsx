import React, { useEffect, useState } from 'react';
import { useApp } from '../../AppContext';
import { SectionHeader } from '../../components/ui/DashboardUI';
import { Users, Search, Shield, Phone, Mail, Loader2, UserPlus, X, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Role } from '../../types';

export default function UserDirectory() {
  const { users, fetchUsers, loading, registerUser } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | Role>('All');
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', email: '', phoneNumber: '', password: '', role: 'Patient' as Role, aadhaarNumber: '' });
  const [regError, setRegError] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || u.phoneNumber.includes(q);
  });

  const roleColors: Record<string, string> = {
    Admin: 'bg-purple-50 text-purple-700 border-purple-200',
    Doctor: 'bg-blue-50 text-blue-700 border-blue-200',
    Receptionist: 'bg-green-50 text-green-700 border-green-200',
    Patient: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regForm.name || !regForm.phoneNumber || !regForm.password) {
      setRegError('Name, phone, and password are required.'); return;
    }
    const ok = await registerUser({ ...regForm, isAadhaarVerified: false, allergies: [] });
    if (ok) { setShowRegModal(false); setRegForm({ name: '', email: '', phoneNumber: '', password: '', role: 'Patient', aadhaarNumber: '' }); }
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="User Directory" description="Manage all registered users across every role."
        action={
          <button onClick={() => setShowRegModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <UserPlus className="w-4 h-4" /> Register User
          </button>
        } />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {['All', 'Patient', 'Doctor', 'Receptionist', 'Admin'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r as typeof roleFilter)}
            className={cn("px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border",
              roleFilter === r ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
            )}>{r}</button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600 transition-all" />
        </div>
      </div>

      {loading['users'] && <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}

      <div className="grid gap-4">
        {filtered.map(u => (
          <div key={u.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center gap-5 hover:shadow-2xl transition-all hover:-translate-y-0.5 group">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center font-black text-xl border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
              {u.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h4 className="font-black text-slate-900 uppercase tracking-tight">{u.name}</h4>
                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border", roleColors[u.role])}>{u.role}</span>
                {u.isAadhaarVerified && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center gap-1"><Shield className="w-2.5 h-2.5" />Verified</span>}
              </div>
              <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {u.email && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{u.email}</span>}
                <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{u.phoneNumber}</span>
                {u.allergies && u.allergies.length > 0 && (
                  <span className="text-red-400">⚠ {u.allergies.slice(0, 2).join(', ')}{u.allergies.length > 2 ? '...' : ''}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading['users'] && filtered.length === 0 && (
          <div className="py-16 bg-white rounded-[2rem] border border-dashed border-slate-200 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No users found matching your search.</p>
          </div>
        )}
      </div>

      {/* Register Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 border border-slate-100 relative">
            <button onClick={() => setShowRegModal(false)} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Register New User</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              {[
                { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Enter full name' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'user@example.com' },
                { label: 'Phone *', key: 'phoneNumber', type: 'tel', placeholder: '9XXXXXXXXX' },
                { label: 'Password *', key: 'password', type: 'password', placeholder: 'Min 6 characters' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={(regForm as Record<string, string>)[f.key]}
                    onChange={e => setRegForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-600 transition-all" />
                </div>
              ))}
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Role</label>
                <select value={regForm.role} onChange={e => setRegForm(p => ({ ...p, role: e.target.value as Role }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-600 transition-all">
                  {['Patient', 'Doctor', 'Receptionist', 'Admin'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              {regError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />{regError}
                </div>
              )}
              <button type="submit" disabled={loading['registerUser']}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {loading['registerUser'] && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
