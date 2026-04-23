import { useApp } from '../../AppContext';
import { SectionHeader } from '../../components/ui/DashboardUI';
import { FileText, Download, Share2, Upload, Search, Filter, CheckCircle2, Clock, User, Calendar } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function LabReports() {
  const { user, labReports, uploadLabReport, users } = useApp();
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Filter reports based on user role
  const filteredReports = labReports.filter(r => {
    const matchesSearch = r.testName.toLowerCase().includes(search.toLowerCase()) || 
                         r.patientName.toLowerCase().includes(search.toLowerCase());
    if (user?.role === 'Patient') {
       return r.patientId === user.id && matchesSearch;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      <SectionHeader 
        title="Lab & Diagnostics" 
        description={user?.role === 'Patient' ? "View and download your medical reports." : "Manage and upload patient test results."}
        action={
           user?.role !== 'Patient' && (
              <button 
                onClick={() => setShowUploadModal(true)}
                className="px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold flex items-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20 text-xs tracking-widest uppercase"
              >
                 <Upload className="w-5 h-5" />
                 Upload Report
              </button>
           )
        }
      />

      <div className="flex flex-col md:flex-row gap-8 mb-12">
         <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by test name or patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-100 py-5 pl-14 pr-8 rounded-[1.5rem] text-sm font-medium focus:border-blue-600 outline-none shadow-xl shadow-slate-900/5 focus:bg-slate-50 transition-all placeholder:text-slate-400"
            />
         </div>
         <button className="px-10 py-5 bg-white border border-slate-100 rounded-[1.5rem] text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-slate-900 hover:text-white shadow-xl shadow-slate-900/5 transition-all group active:scale-95">
            <Filter className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Filter Grid
         </button>
      </div>

      <div className="grid gap-8">
         {filteredReports.map((report) => (
            <motion.div 
               layout
               key={report.id}
               className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-slate-900/10 transition-all flex flex-col lg:flex-row gap-10 items-center group hover:-translate-y-1"
            >
               <div className="w-24 h-24 rounded-[2rem] bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-800 transition-all duration-700 shadow-inner group-hover:rotate-6">
                  <FileText className="w-12 h-12" />
               </div>
               
               <div className="flex-1 text-center lg:text-left">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                     <h4 className="text-2xl font-black text-slate-800 tracking-tight uppercase group-hover:text-blue-600 transition-colors italic">{report.testName}</h4>
                     {report.status === 'Final' ? (
                        <span className="flex items-center gap-2 px-4 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-green-100 shadow-sm">
                           <CheckCircle2 className="w-3.5 h-3.5" /> FINALIZED
                        </span>
                     ) : (
                        <span className="flex items-center gap-2 px-4 py-1 bg-orange-50 text-orange-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-orange-100 shadow-sm animate-pulse">
                           <Clock className="w-3.5 h-3.5" /> PENDING
                        </span>
                     )}
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3">
                     <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100"><span className="text-blue-500 font-black">ID</span> {report.id.slice(-6).toUpperCase()}</span>
                     <span className="flex items-center gap-2 decoration-blue-500/30 underline decoration-2 underline-offset-4"><User className="w-3.5 h-3.5 text-blue-500" /> {report.patientName}</span>
                     <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-blue-500" /> {report.date}</span>
                  </div>
                  <div className="mt-6 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] group-hover:bg-blue-50/30 transition-all shadow-inner">
                    <p className="text-sm text-slate-600 italic-small leading-relaxed font-medium">"{report.result}"</p>
                  </div>
               </div>

               <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-auto mt-6 lg:mt-0 shrink-0">
                  <button className="flex-1 lg:w-16 lg:h-16 h-14 flex items-center justify-center bg-white text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100 shadow-sm active:scale-90">
                     <Share2 className="w-6 h-6" />
                  </button>
                  <button className="flex-1 lg:w-auto px-10 h-16 bg-blue-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95 border border-blue-500">
                     <Download className="w-5 h-5 shadow-lg" />
                     Download
                  </button>
               </div>
            </motion.div>
         ))}
         {filteredReports.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 space-y-6">
               <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-[2rem] flex items-center justify-center mx-auto border border-slate-100">
                  <FileText className="w-10 h-10" />
               </div>
               <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">No laboratory records matched</p>
            </div>
         )}
      </div>

      {showUploadModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl relative border border-slate-100"
            >
               <div className="mb-10">
                  <h3 className="text-3xl font-bold mb-2 tracking-tight text-slate-800">Upload New Report</h3>
                  <p className="text-sm text-slate-500 italic-small font-medium">Fill in the test details and results for the patient.</p>
               </div>
               
               <form 
                 onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const patientId = formData.get('patientId') as string;
                    const patient = users.find(u => u.id === patientId);
                    
                    uploadLabReport({
                       patientId: patientId,
                       patientName: patient?.name || 'Unknown',
                       testName: formData.get('testName') as string,
                       result: formData.get('result') as string,
                       date: new Date().toISOString().split('T')[0],
                       status: 'Final'
                    });
                    setShowUploadModal(false);
                 }}
                 className="space-y-8"
               >
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Select Patient</label>
                     <select name="patientId" required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm font-medium outline-none focus:border-blue-600 focus:bg-white transition-all">
                        {users.filter(u => u.role === 'Patient').map(p => (
                           <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                        ))}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Test Name</label>
                     <input 
                       name="testName" 
                       type="text" 
                       required 
                       placeholder="e.g. Complete Blood Count" 
                       className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm font-medium outline-none focus:border-blue-600 focus:bg-white transition-all" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Diagnostic Result</label>
                     <textarea 
                       name="result" 
                       required 
                       placeholder="Enter the medical summary or result..." 
                       className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm font-medium h-40 resize-none outline-none italic-small focus:border-blue-600 focus:bg-white transition-all" 
                     />
                  </div>
                  
                  <div className="pt-8 border-t border-slate-50 flex gap-6">
                     <button type="button" onClick={() => setShowUploadModal(false)} className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Cancel</button>
                     <button className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all font-sans text-xs tracking-widest uppercase">
                        Confirm & Upload
                     </button>
                  </div>
               </form>
            </motion.div>
         </div>
      )}
    </div>
  );
}
