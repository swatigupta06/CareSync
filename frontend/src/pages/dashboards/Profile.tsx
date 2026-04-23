import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import {
  User, Phone, Fingerprint, ShieldCheck,
  Plus, Trash2, ShieldAlert, Mail, Shield, Camera, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SectionHeader } from '../../components/ui/DashboardUI';

export default function Profile() {
  const { user, updateProfile, verifyAadhaar, loading } = useApp();
  const [newAllergy, setNewAllergy] = useState('');
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editAge, setEditAge] = useState(String(user?.age || ''));
  const [editGender, setEditGender] = useState(user?.gender || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  if (!user) return null;

  const isUpdating = loading['profile'];
  const isVerifying = loading['verifyAadhaar'];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    await updateProfile({
      name: editName,
      age: editAge ? parseInt(editAge) : undefined,
      gender: editGender || undefined,
      ...(avatarFile ? { file: avatarFile } : {}),
    });
    setIsEditing(false);
    setAvatarFile(null);
  };

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergy.trim()) return;
    const current = user.allergies || [];
    if (!current.includes(newAllergy.trim().toLowerCase())) {
      updateProfile({ allergies: [...current, newAllergy.trim().toLowerCase()] });
    }
    setNewAllergy('');
  };

  const removeAllergy = (a: string) => {
    updateProfile({ allergies: (user.allergies || []).filter(x => x !== a) });
  };

  const handleVerify = async () => {
    if (!aadhaarInput && !user.aadhaarNumber) return;
    await verifyAadhaar(aadhaarInput || user.aadhaarNumber);
  };

  const avatarSrc = avatarPreview || user.avatar || `https://picsum.photos/seed/${user.email || user.id}/400/400`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <SectionHeader title="Identity & Profile" description="Manage your personal credentials and health information" />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Identity Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full" />

            <div className="flex flex-col md:flex-row gap-10 relative z-10">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-36 h-36 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <button onClick={() => fileRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div className={cn("px-4 py-2 rounded-full flex items-center gap-2 text-[9px] font-black uppercase tracking-widest",
                  user.isAadhaarVerified ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-400 border border-slate-200"
                )}>
                  {user.isAadhaarVerified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  {user.isAadhaarVerified ? 'Verified' : 'Unverified'}
                </div>
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Name</label>
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Age</label>
                        <input type="number" value={editAge} onChange={e => setEditAge(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-600" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Gender</label>
                        <select value={editGender} onChange={e => setEditGender(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-600">
                          <option value="">Select</option>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleSaveProfile} disabled={isUpdating}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                      </button>
                      <button onClick={() => { setIsEditing(false); setAvatarFile(null); setAvatarPreview(null); }}
                        className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{user.name}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: Phone, label: 'Phone', value: user.phoneNumber },
                        { icon: Mail, label: 'Email', value: user.email || 'Not set' },
                        { icon: User, label: 'Role', value: user.role },
                        { icon: Shield, label: 'Age / Gender', value: `${user.age || '—'} / ${user.gender || '—'}` },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                            <p className="text-sm font-bold text-slate-800">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setIsEditing(true); setEditName(user.name); setEditAge(String(user.age || '')); setEditGender(user.gender || ''); }}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Allergies — Patients only */}
          {user.role === 'Patient' && (
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center border border-red-100">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                Allergies & Sensitivities
              </h3>
              <form onSubmit={handleAddAllergy} className="flex gap-3 mb-6">
                <input value={newAllergy} onChange={e => setNewAllergy(e.target.value)} placeholder="e.g. Penicillin, Pollen..."
                  className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-600 transition-all" />
                <button type="submit" className="px-5 py-3 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 transition-all">
                  <Plus className="w-5 h-5" />
                </button>
              </form>
              <div className="flex flex-wrap gap-3">
                {(user.allergies || []).length === 0 ? (
                  <p className="text-slate-400 text-sm italic font-medium">No allergies recorded.</p>
                ) : (user.allergies || []).map(a => (
                  <div key={a} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full border border-red-100 font-bold text-sm">
                    {a}
                    <button onClick={() => removeAllergy(a)} className="hover:text-red-900 transition-colors ml-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Aadhaar Verification — Patients only */}
        {user.role === 'Patient' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 mb-6">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Aadhaar Verification</h3>
              <p className="text-slate-400 text-sm font-medium mb-6">Verify your identity using your 12-digit Aadhaar number.</p>

              {user.isAadhaarVerified ? (
                <div className="p-4 bg-green-50 rounded-2xl border border-green-200 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
                  <div>
                    <p className="font-black text-green-800 text-sm uppercase tracking-tight">Identity Verified</p>
                    <p className="text-green-600 text-[10px] font-bold">Aadhaar: ••••••{(user.aadhaarNumber || '').slice(-4)}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <input type="text" maxLength={12} placeholder="Enter 12-digit Aadhaar"
                    value={aadhaarInput} onChange={e => setAadhaarInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-blue-600" />
                  <button onClick={handleVerify} disabled={isVerifying || aadhaarInput.length !== 12}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
                    Verify Aadhaar
                  </button>
                </div>
              )}
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-8 text-white">
              <h4 className="font-black uppercase tracking-tight mb-4 text-sm">Account Info</h4>
              <div className="space-y-3 text-[11px] text-slate-400 font-bold">
                <div className="flex justify-between">
                  <span>Role</span>
                  <span className="text-white uppercase">{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span>ID</span>
                  <span className="text-white font-mono text-[9px]">{user.id?.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="text-green-400 uppercase">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
