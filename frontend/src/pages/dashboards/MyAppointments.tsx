import { useApp } from '../../AppContext';
import { SectionHeader } from '../../components/ui/DashboardUI';
import { Calendar, Clock, MapPin, X, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export default function MyAppointments() {
  const { user, appointments, updateAppointmentStatus, loading } = useApp();
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past'>('Upcoming');

  const myAppointments = appointments.filter(a => a.patientId === user?.id);
  const filtered = myAppointments.filter(a =>
    activeTab === 'Upcoming'
      ? ['Pending', 'Confirmed'].includes(a.status)
      : ['Cancelled', 'Completed'].includes(a.status)
  );

  const isUpdating = loading['updateStatus'];

  const statusColors: Record<string, string> = {
    Confirmed: 'bg-green-50 text-green-600 border-green-100',
    Pending: 'bg-orange-50 text-orange-600 border-orange-100',
    Completed: 'bg-blue-50 text-blue-600 border-blue-100',
    Cancelled: 'bg-slate-50 text-slate-400 border-slate-100',
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="My Appointments" description="View and manage your scheduled medical consultations." />

      <div className="flex gap-2 p-2 bg-white border border-slate-100 rounded-[2rem] shadow-xl w-fit">
        {['Upcoming', 'Past'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as 'Upcoming' | 'Past')}
            className={cn("px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative rounded-[1.25rem] italic",
              activeTab === tab ? "bg-slate-900 text-white shadow-xl rotate-1" : "text-slate-400 hover:text-slate-900"
            )}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {filtered.map(apt => (
          <div key={apt.id} className="bg-white border border-slate-100 rounded-[3rem] p-10 flex flex-col lg:flex-row gap-10 items-start lg:items-center shadow-xl group hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="w-24 h-24 rounded-[2rem] overflow-hidden shrink-0 border border-slate-100 shadow-sm">
              <img src={`https://picsum.photos/seed/${apt.doctorId}/100/100`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h4 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{apt.doctorName}</h4>
                <span className="px-4 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-[0.15em] rounded-full border border-blue-100 shadow-sm">{apt.doctorSpecialization}</span>
                <span className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-sm border", statusColors[apt.status] || 'bg-slate-50 text-slate-400 border-slate-100')}>
                  {apt.status}
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {[
                  { icon: Calendar, label: 'Date', value: apt.date },
                  { icon: Clock, label: 'Time', value: apt.time },
                  { icon: MapPin, label: 'Location', value: 'CareSync Hub' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-slate-50">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block">{item.label}</span>
                      <span className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-2">Symptoms</span>
                <p className="text-sm text-slate-600 italic leading-relaxed font-medium">"{apt.symptoms}"</p>
              </div>

              {apt.prescription && (
                <div className="mt-4 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] block mb-2">Prescription</span>
                  <p className="text-sm text-blue-700 leading-relaxed font-medium">{apt.prescription}</p>
                </div>
              )}
            </div>

            {activeTab === 'Upcoming' && (
              <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-auto shrink-0">
                <button
                  onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
                  disabled={isUpdating}
                  className="flex-1 lg:w-full px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 hover:border-red-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-20 bg-white rounded-[32px] border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
            <Calendar className="w-12 h-12 text-slate-200" />
            <p className="text-slate-400 font-medium">No {activeTab.toLowerCase()} appointments found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
