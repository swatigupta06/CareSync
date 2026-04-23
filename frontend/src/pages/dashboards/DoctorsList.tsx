import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { SectionHeader } from '../../components/ui/DashboardUI';
import { Search, Star, Calendar, Clock, X, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Doctor } from '../../types';
import { cn } from '../../lib/utils';

export default function DoctorsList() {
  const { doctors, bookAppointment, user, loading } = useApp();
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isBooking = loading['bookAppointment'];

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !user) return;
    const success = await bookAppointment({
      patientId: user.id,
      patientName: user.name,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorSpecialization: selectedDoctor.specialization,
      date: bookingDate,
      time: bookingTime,
      symptoms,
    });
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedDoctor(null);
        setBookingDate(''); setBookingTime(''); setSymptoms('');
      }, 2500);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Find a Specialist"
        description="Browse our network of qualified medical professionals."
        action={
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:min-w-[350px] pl-14 pr-8 py-5 border border-slate-100 rounded-[1.5rem] bg-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 shadow-xl transition-all"
            />
          </div>
        }
      />

      {doctors.length === 0 && (
        <div className="py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-slate-300 animate-spin" />
          <p className="text-slate-400 font-bold text-sm">Loading doctors...</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doc => (
          <motion.div key={doc.id}
            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group hover:-translate-y-1">
            <div className="flex gap-6 mb-8">
              <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-slate-50 border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                <img
                  src={doc.avatar || `https://picsum.photos/seed/${doc.email || doc.id}/200/200`}
                  alt={doc.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-orange-500 mb-2">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-black">{doc.rating?.toFixed(1) || '4.5'}</span>
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{doc.name}</h3>
                <p className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mt-2 uppercase tracking-[0.15em] shadow-sm">{doc.specialization}</p>
              </div>
            </div>

            <p className="text-sm text-slate-500 mb-8 line-clamp-2 leading-relaxed font-medium italic">"{doc.bio || 'Experienced medical professional dedicated to patient care.'}"</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Clock className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Experience</span>
                  <span className="text-[10px] font-black text-slate-700">{doc.experience || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Calendar className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Available</span>
                  <span className="text-[10px] font-black text-slate-700">{(doc.availability || []).slice(0, 3).join(', ') || 'See schedule'}</span>
                </div>
              </div>
            </div>

            {user?.role === 'Patient' && (
              <button onClick={() => setSelectedDoctor(doc)}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95 border border-slate-800">
                Book Specialist
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-24 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-4xl rounded-[2rem] md:rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row border border-slate-100 my-auto">
              <div className="bg-slate-900 text-white p-8 md:p-12 md:w-5/12 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[280px]">
                <div className="absolute inset-0 bg-blue-600/10 blur-[80px]" />
                <div className="relative z-10 w-28 h-28 rounded-[2.5rem] border-8 border-white/10 mb-6 overflow-hidden shadow-2xl">
                  <img src={selectedDoctor.avatar || `https://picsum.photos/seed/${selectedDoctor.id}/200/200`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <h3 className="text-2xl font-black tracking-tight relative z-10 uppercase">{selectedDoctor.name}</h3>
                <p className="text-blue-400 text-[10px] font-black uppercase mt-3 tracking-[0.2em] relative z-10">{selectedDoctor.specialization}</p>
              </div>

              <div className="p-8 md:p-12 md:w-7/12 flex-1 bg-slate-50 relative">
                <button onClick={() => setSelectedDoctor(null)}
                  className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100">
                  <X className="w-5 h-5" />
                </button>

                {isSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-8">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center border border-green-100 shadow-xl animate-bounce">
                      <Check className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-slate-800 uppercase">Booked!</h3>
                      <p className="text-sm text-slate-500 font-medium mt-2">Your appointment has been submitted successfully.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h3 className="text-3xl font-black mb-1 tracking-tight text-slate-800 uppercase italic">Confirm Booking</h3>
                      <p className="text-sm text-slate-500 font-medium">Select your preferred appointment slot.</p>
                    </div>
                    <form onSubmit={handleBook} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Appointment Date</label>
                        <input type="date" required value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:border-blue-600 outline-none shadow-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Preferred Time</label>
                        <select required value={bookingTime} onChange={e => setBookingTime(e.target.value)}
                          className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:border-blue-600 outline-none shadow-sm appearance-none">
                          <option value="">Select Time Slot</option>
                          {['09:00', '10:00', '11:30', '14:00', '16:00'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Symptoms / Reason</label>
                        <textarea required value={symptoms} onChange={e => setSymptoms(e.target.value)}
                          placeholder="Describe your symptoms or reason for visit..."
                          className="w-full p-5 bg-white border border-slate-100 rounded-[2rem] text-sm h-28 resize-none focus:border-blue-600 outline-none shadow-sm font-medium text-slate-600 leading-relaxed" />
                      </div>
                      <button disabled={isBooking}
                        className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all border border-blue-500 disabled:opacity-50 flex items-center justify-center gap-2">
                        {isBooking ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Confirm Appointment'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
