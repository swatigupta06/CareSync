import React, { useState, useEffect } from 'react';
import { useApp } from '../../AppContext';
import { SectionHeader, StatCard } from '../../components/ui/DashboardUI';
import { Calendar, Users, Check, X, Clipboard, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Appointment } from '../../types';
import { recordAPI } from '../../services/api';

export default function DoctorOverview() {
  const { user, appointments, updateAppointmentStatus, updatePrescription, fetchAppointments, loading, users, accessRequests, requestRecordAccess } = useApp();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [prescription, setPrescription] = useState('');
  const [requestingPatientId, setRequestingPatientId] = useState<string | null>(null);

  useEffect(() => { fetchAppointments(); }, []);

  const myAppointments = appointments.filter(a => a.doctorId === user?.id);
  const pending = myAppointments.filter(a => a.status === 'Pending');
  const upcoming = myAppointments.filter(a => a.status === 'Confirmed');

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    await updatePrescription(selectedAppointment.id, prescription);
    setSelectedAppointment(null); setPrescription('');
  };

  const handleRequestAccess = async (patientId: string) => {
    setRequestingPatientId(patientId);
    await requestRecordAccess(patientId, 'Reviewing patient history before consultation.');
    setRequestingPatientId(null);
  };

  const getAccessStatus = (patientId: string) => {
    const req = accessRequests.find(r => r.patientId === patientId && r.doctorId === user?.id);
    return req?.status || null;
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Patients Today" value={upcoming.length + pending.length} icon={Users} color="blue" className="p-10 rounded-[3rem] shadow-xl" />
        <StatCard label="Pending Approval" value={pending.length} icon={Clock} color="orange" className="p-10 rounded-[3rem] shadow-xl" />
        <StatCard label="Total Consultations" value={myAppointments.length} icon={Calendar} color="green" className="p-10 rounded-[3rem] shadow-xl" />
      </div>

      {loading['appointments'] && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Pending Approvals */}
        <div className="space-y-6">
          <SectionHeader title="Pending Approval" description="Review and confirm appointment requests." />
          <div className="space-y-4">
            {pending.map(apt => (
              <div key={apt.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:shadow-2xl transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center font-black text-xl border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    {apt.patientName[0]}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-blue-600 uppercase">{apt.patientName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> {apt.date} <span className="text-slate-300">•</span> <Clock className="w-3 h-3" /> {apt.time}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
                    className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all border border-slate-100 hover:border-red-100">
                    <X className="w-5 h-5" />
                  </button>
                  <button onClick={() => updateAppointmentStatus(apt.id, 'Confirmed')}
                    className="w-11 h-11 flex items-center justify-center bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="py-16 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
                <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No pending approvals</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Consultations */}
        <div className="space-y-6">
          <SectionHeader title="Upcoming Consultations" description="Click to add prescription and complete." />
          <div className="space-y-4">
            {upcoming.map(apt => (
              <div key={apt.id} onClick={() => setSelectedAppointment(apt)}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center gap-5 group cursor-pointer hover:border-blue-600 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-slate-50 text-slate-500 group-hover:bg-blue-600 group-hover:text-white rounded-2xl flex items-center justify-center font-black text-xl border border-slate-100 transition-all duration-500">
                  {apt.patientName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-blue-600 uppercase">{apt.patientName}</h4>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      <Clock className="w-3 h-3" /> {apt.time}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 italic flex items-center gap-1.5">
                      <Clipboard className="w-3 h-3" /> {apt.symptoms.slice(0, 35)}...
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
              </div>
            ))}
            {upcoming.length === 0 && (
              <div className="py-16 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
                <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Access Requests */}
      {users.filter(u => u.role === 'Patient').length > 0 && (
        <div className="space-y-6">
          <SectionHeader title="Patient Record Access" description="Request access to view patient medical records." />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.filter(u => u.role === 'Patient').slice(0, 6).map(patient => {
              const status = getAccessStatus(patient.id);
              return (
                <div key={patient.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-500 border border-slate-100">
                      {patient.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm uppercase tracking-tight">{patient.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{patient.phoneNumber}</p>
                    </div>
                  </div>
                  {status === 'Approved' ? (
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase border border-green-100">Approved</span>
                  ) : status === 'Pending' ? (
                    <span className="px-3 py-1 bg-orange-50 text-orange-500 rounded-full text-[9px] font-black uppercase border border-orange-100">Pending</span>
                  ) : status === 'Rejected' ? (
                    <span className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[9px] font-black uppercase border border-red-100">Rejected</span>
                  ) : (
                    <button onClick={() => handleRequestAccess(patient.id)} disabled={requestingPatientId === patient.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-1.5">
                      {requestingPatientId === patient.id && <Loader2 className="w-3 h-3 animate-spin" />}
                      Request
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 relative border border-slate-100">
              <button onClick={() => setSelectedAppointment(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl flex items-center justify-center transition-all border border-slate-100">
                <X className="w-5 h-5" />
              </button>
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Add Prescription</h3>
                <p className="text-slate-500 text-sm font-medium mt-2">Patient: <span className="font-bold text-slate-800">{selectedAppointment.patientName}</span></p>
                <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Symptoms</p>
                  <p className="text-sm text-slate-600 font-medium italic">{selectedAppointment.symptoms}</p>
                </div>
              </div>
              <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Prescription & Notes</label>
                  <textarea required value={prescription} onChange={e => setPrescription(e.target.value)} rows={5}
                    placeholder="Enter medications, dosage, and instructions..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-600 transition-all resize-none" />
                </div>
                <button type="submit" disabled={loading['updatePrescription']}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading['updatePrescription'] && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save & Complete Appointment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
