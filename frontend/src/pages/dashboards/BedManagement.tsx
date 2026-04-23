import React, { useState, useEffect } from 'react';
import { useApp } from '../../AppContext';
import { SectionHeader } from '../../components/ui/DashboardUI';
import { Bed as BedIcon, User, Loader2, Search, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Bed } from '../../types';

export default function BedManagement() {
  const { beds, users, assignBed, dischargePatient, fetchBeds, loading } = useApp();
  const [filter, setFilter] = useState<'All' | Bed['type']>('All');
  const [search, setSearch] = useState('');
  const [assigningBed, setAssigningBed] = useState<Bed | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');

  useEffect(() => { fetchBeds(); }, []);

  const typeColors: Record<string, string> = {
    General: 'bg-blue-50 text-blue-700 border-blue-200',
    ICU: 'bg-red-50 text-red-700 border-red-200',
    'Semi-Private': 'bg-purple-50 text-purple-700 border-purple-200',
    Private: 'bg-green-50 text-green-700 border-green-200',
  };

  const statusColors: Record<string, string> = {
    Available: 'bg-green-100 text-green-700',
    Occupied: 'bg-orange-100 text-orange-700',
    Emergency: 'bg-red-100 text-red-700',
    Maintenance: 'bg-slate-100 text-slate-500',
  };

  const filtered = beds.filter(b => {
    if (filter !== 'All' && b.type !== filter) return false;
    if (search && !b.number.toLowerCase().includes(search.toLowerCase()) && !(b.patientName || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const patients = users.filter(u => u.role === 'Patient');
  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.phoneNumber.includes(patientSearch));

  const stats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'Available').length,
    occupied: beds.filter(b => b.status === 'Occupied').length,
    emergency: beds.filter(b => b.status === 'Emergency').length,
  };

  const handleAssign = async () => {
    if (!assigningBed || !selectedPatientId) return;
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;
    await assignBed(assigningBed.id, patient.id, patient.name);
    setAssigningBed(null); setSelectedPatientId(''); setPatientSearch('');
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Bed Management" description="Real-time overview of bed allocation and availability." />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Beds', value: stats.total, color: 'bg-blue-50 border-blue-100 text-blue-700' },
          { label: 'Available', value: stats.available, color: 'bg-green-50 border-green-100 text-green-700' },
          { label: 'Occupied', value: stats.occupied, color: 'bg-orange-50 border-orange-100 text-orange-700' },
          { label: 'Emergency', value: stats.emergency, color: 'bg-red-50 border-red-100 text-red-700' },
        ].map(s => (
          <div key={s.label} className={cn("p-6 rounded-[2rem] border flex flex-col items-center justify-center shadow-xl", s.color)}>
            <div className="text-4xl font-black mb-1">{s.value}</div>
            <div className="text-[9px] font-black uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {['All', 'General', 'ICU', 'Semi-Private', 'Private'].map(f => (
          <button key={f} onClick={() => setFilter(f as typeof filter)}
            className={cn("px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border",
              filter === f ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
            )}>{f}</button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search beds..."
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600 transition-all" />
        </div>
      </div>

      {loading['beds'] && (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      )}

      {/* Bed Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(bed => (
          <div key={bed.id} className={cn("p-5 rounded-[2rem] border-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer",
            bed.status === 'Available' ? "bg-white border-slate-100 hover:border-green-300" :
            bed.status === 'Occupied' ? "bg-orange-50/50 border-orange-200" :
            "bg-red-50/50 border-red-200"
          )}>
            <div className="flex justify-between items-start mb-4">
              <BedIcon className={cn("w-6 h-6", bed.status === 'Available' ? "text-green-500" : bed.status === 'Occupied' ? "text-orange-500" : "text-red-500")} />
              <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full", statusColors[bed.status])}>{bed.status}</span>
            </div>
            <div className="font-black text-2xl text-slate-900 mb-1">#{bed.number}</div>
            <div className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border inline-block mb-3", typeColors[bed.type])}>{bed.type}</div>

            {bed.status === 'Occupied' && bed.patientName && (
              <div className="mt-2 mb-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Patient</p>
                <p className="text-sm font-bold text-slate-800 truncate">{bed.patientName}</p>
              </div>
            )}

            <div className="mt-3 flex gap-2">
              {bed.status === 'Available' ? (
                <button onClick={() => setAssigningBed(bed)}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all">
                  Assign
                </button>
              ) : (
                <button onClick={() => dischargePatient(bed.id)} disabled={loading['discharge']}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50">
                  Discharge
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Assign Modal */}
      {assigningBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 border border-slate-100">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase">Assign Bed #{assigningBed.number}</h3>
                <p className="text-slate-400 text-sm font-medium mt-1">{assigningBed.type} Ward</p>
              </div>
              <button onClick={() => setAssigningBed(null)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={patientSearch} onChange={e => setPatientSearch(e.target.value)} placeholder="Search patient..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600 transition-all" />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredPatients.map(p => (
                  <button key={p.id} onClick={() => setSelectedPatientId(p.id)}
                    className={cn("w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                      selectedPatientId === p.id ? "border-blue-600 bg-blue-50" : "border-slate-100 bg-white hover:border-slate-300"
                    )}>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black border border-blue-100">{p.name[0]}</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{p.phoneNumber}</p>
                    </div>
                    {selectedPatientId === p.id && <Check className="w-5 h-5 text-blue-600 ml-auto" />}
                  </button>
                ))}
                {filteredPatients.length === 0 && <p className="text-center text-slate-400 text-sm py-4 font-medium">No patients found</p>}
              </div>

              <button onClick={handleAssign} disabled={!selectedPatientId || loading['assign']}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20">
                {loading['assign'] && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
