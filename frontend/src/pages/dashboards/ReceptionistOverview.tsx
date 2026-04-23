import { useApp } from '../../AppContext';
import { StatCard, SectionHeader } from '../../components/ui/DashboardUI';
import { Bed as BedIcon, Users, Calendar, Plus, ChevronRight, UserPlus, Search, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function ReceptionistOverview() {
  const { appointments, beds, doctors, bookAppointment } = useApp();
  const navigate = useNavigate();
  const [showRegModal, setShowRegModal] = useState(false);

  const availableBeds = beds.filter(b => b.status === 'Available');
  const todayAppointments = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Beds" value={beds.length} icon={BedIcon} color="blue" className="p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all" />
        <StatCard label="Available" value={availableBeds.length} icon={CheckCircle} color="green" className="p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all" />
        <StatCard label="Occupied" value={beds.length - availableBeds.length} icon={Users} color="orange" className="p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all" />
        <StatCard label="Appts Today" value={todayAppointments.length} icon={Calendar} color="purple" className="p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all" />
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <SectionHeader 
            title="Front Desk Actions" 
            description="Frequently used receptionist tasks."
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <button 
              onClick={() => setShowRegModal(true)}
              className="p-8 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all text-left flex flex-col justify-between h-52 group border border-blue-500"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold">New Patient</h4>
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-80 mb-4">Register a new user</p>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-white/10 px-2.5 py-1 rounded-full">
                  Quick Action <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </button>

            <button 
              onClick={() => navigate('/dashboard/beds')}
              className="p-8 bg-slate-900 text-white rounded-[1.5rem] shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-95 transition-all text-left flex flex-col justify-between h-52 group border border-slate-800"
            >
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <BedIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold">Manage Beds</h4>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">Track occupancy</p>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-white/10 px-2.5 py-1 rounded-full text-blue-400 border border-blue-400/20">
                  {availableBeds.length} Free <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeader 
            title="Recent Appointments" 
            action={
              <button 
                onClick={() => navigate('/dashboard/manage-appointments')}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100"
              >
                 View All
              </button>
            }
          />
          <div className="bg-white border border-slate-100 rounded-[3rem] p-4 space-y-2 shadow-xl shadow-slate-900/5">
             {appointments.slice(0, 5).map(apt => (
               <div key={apt.id} className="flex items-center justify-between p-6 rounded-[2rem] hover:bg-slate-50 transition-all group cursor-default border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 bg-slate-100 rounded-[1.25rem] flex items-center justify-center text-sm font-black text-slate-400 border border-slate-200 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-400">
                        {apt.patientName[0]}
                     </div>
                     <div>
                        <div className="text-base font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{apt.patientName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                           <Search className="w-3 h-3 text-slate-300" /> {apt.doctorName}
                        </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-sm font-bold text-slate-900 mb-2">{apt.time}</div>
                     <div className={cn(
                        "text-[9px] font-black uppercase px-3 py-1 rounded-full ring-1 ring-blue-100 transition-all tracking-widest",
                        apt.status === 'Cancelled' ? "text-red-500 ring-red-100 bg-red-50" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                     )}>{apt.status}</div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
      
      {showRegModal && <RegisterModal onClose={() => setShowRegModal(false)} />}
    </div>
  );
}

function RegisterModal({ onClose }: { onClose: () => void }) {
   const { registerUser } = useApp();
   const [formData, setFormData] = useState({ 
      name: '', 
      email: '', 
      phoneNumber: '',
      isAadhaarVerified: false,
      role: 'Patient' as any 
   });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      registerUser(formData);
      onClose();
   };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           className="bg-white w-full max-w-xl rounded-[4rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.3)] relative border border-slate-100 overflow-hidden"
         >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10">
               <h3 className="text-4xl font-black mb-2 tracking-tighter text-slate-900 uppercase italic">New Patient Node</h3>
               <p className="text-sm text-slate-400 italic-small mb-12 font-bold uppercase tracking-[0.1em]">Initializing identity sequence for CareSync ecosystem.</p>
               
               <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Universal Identity Name</label>
                     <input 
                       type="text" 
                       required
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       placeholder="e.g. ROBERT JACKSON"
                       className="w-full bg-slate-50 border border-slate-100 p-6 rounded-[1.5rem] text-sm font-black uppercase tracking-widest focus:border-blue-600 outline-none focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Digital Correspondence</label>
                     <input 
                       type="email" 
                       required
                       value={formData.email}
                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                       placeholder="ROBER@SYSTEM.COM"
                       className="w-full bg-slate-50 border border-slate-100 p-6 rounded-[1.5rem] text-sm font-black uppercase tracking-widest focus:border-blue-600 outline-none focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Mobile Link Hub</label>
                     <input 
                       type="tel" 
                       required
                       value={formData.phoneNumber}
                       onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                       placeholder="+91 00000 00000"
                       className="w-full bg-slate-50 border border-slate-100 p-6 rounded-[1.5rem] text-sm font-black uppercase tracking-widest focus:border-blue-600 outline-none focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
                     />
                  </div>
                  
                  <div className="pt-6 flex flex-col gap-6">
                     <button className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-blue-600 transition-all font-sans text-xs tracking-[0.3em] uppercase italic group border-b-4 border-slate-800">
                        Confirm & Synchronize
                     </button>
                     <button type="button" onClick={onClose} className="w-full py-2 text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.4em]">
                        Abort Registration
                     </button>
                  </div>
               </form>
            </div>
         </motion.div>
      </div>
   );
}
