import { useApp } from '../../AppContext';
import { StatCard, SectionHeader } from '../../components/ui/DashboardUI';
import { Heart, Calendar, FileText, Activity, Clock, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { cn } from '../../lib/utils';

import SymptomChatbot from '../../components/SymptomChatbot';

export default function PatientOverview() {
  const { user, appointments, labReports } = useApp();
  const navigate = useNavigate();

  const activeAppointments = appointments.filter(a => a.patientId === user?.id && a.status !== 'Cancelled' && a.status !== 'Completed');
  const finishedReports = labReports.filter(r => r.patientId === user?.id && r.status === 'Final');

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <SectionHeader 
            title={`Good morning, ${user?.name}`} 
            description="Here's a summary of your health and upcoming appointments."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard label="Health Score" value="92%" icon={Heart} color="red" trend={{ value: '3%', positive: true }} className="p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all" />
            <StatCard label="Appts" value={activeAppointments.length} icon={Calendar} color="blue" className="p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all" />
            <StatCard label="Lab Reports" value={finishedReports.length} icon={FileText} color="purple" className="p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all" />
          </div>

          <div className="bg-slate-900 rounded-[4rem] p-12 text-white relative overflow-hidden shadow-2xl border border-slate-800">
             <div className="absolute top-0 right-0 p-12">
                <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400 animate-pulse border border-blue-400/20">
                   <Zap className="w-12 h-12 fill-current" />
                </div>
             </div>
             <div className="relative z-10 max-w-lg">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
                      <Zap className="w-6 h-6 fill-current" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Critical: Emergency System</span>
                </div>
                <h3 className="text-4xl font-bold mb-4 tracking-tight leading-tight">One-Touch Emergency Assistance</h3>
                <p className="text-base text-slate-400 italic-small mb-10 font-medium">Need immediate medical attention? Trigger an emergency alert to notify the nearest hospitals and on-duty paramedics instantly.</p>
                <button 
                  onClick={() => navigate('/dashboard/sos')}
                  className="px-10 py-5 bg-red-600 text-white rounded-[1.5rem] font-bold hover:bg-red-700 transition-all shadow-[0_15px_40px_rgba(220,38,38,0.4)] flex items-center gap-3 uppercase tracking-widest text-xs"
                >
                  Configure SOS <ChevronRight className="w-5 h-5" />
                </button>
             </div>
          </div>
        </div>

        <div className="w-full md:w-96 space-y-6">
          {/* AI Symptom Checker Chatbot */}
          <SymptomChatbot />

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-900/5 group hover:shadow-2xl transition-all">
             <div className="flex justify-between items-center mb-8">
                <h4 className="font-bold text-lg tracking-tight text-slate-800">Latest Medical Report</h4>
                <button 
                  onClick={() => navigate('/dashboard/reports')}
                  className="text-[10px] font-black uppercase tracking-widest text-blue-600 px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                >
                   All Reports
                </button>
             </div>
             {finishedReports.length > 0 ? (
                <div className="space-y-4">
                   <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group-hover:bg-white transition-all">
                      <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100 shadow-sm group-hover:scale-110 transition-transform">
                         <FileText className="w-7 h-7" />
                      </div>
                      <div>
                         <div className="text-base font-bold text-slate-800 tracking-tight">{finishedReports[0].testName}</div>
                         <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> {finishedReports[0].date}
                         </div>
                      </div>
                   </div>
                </div>
             ) : (
                <div className="text-center py-10 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No reports archived</p>
                </div>
             )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <SectionHeader 
          title="Recent Activity" 
          action={
            <button 
              onClick={() => navigate('/dashboard/appointments')}
              className="text-sm font-bold text-blue-600 px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              See All Appointments
            </button>
          }
        />
        <div className="grid lg:grid-cols-2 gap-6">
           {activeAppointments.slice(0, 4).map((apt) => (
             <div key={apt.id} className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center gap-6 group hover:shadow-lg transition-all">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                   <img src={`https://picsum.photos/seed/${apt.doctorId}/100/100`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">{apt.doctorName}</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{apt.doctorSpecialization}</p>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                         <Clock className="w-3 h-3 text-blue-500" />
                         {apt.time}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                         <Calendar className="w-3 h-3" />
                         {apt.date}
                      </div>
                   </div>
                </div>
                <div className={cn(
                   "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em]",
                   apt.status === 'Confirmed' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                )}>
                   {apt.status}
                </div>
             </div>
           ))}
           {activeAppointments.length === 0 && (
              <div className="lg:col-span-2 py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                 <p className="text-slate-400 italic-small">No upcoming appointments found.</p>
                 <button 
                  onClick={() => navigate('/dashboard/doctors')}
                  className="mt-4 text-sm font-bold text-blue-600"
                 >
                    Book your first consultation
                 </button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
