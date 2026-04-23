import React, { useState, useEffect } from 'react';
import { useApp } from '../../AppContext';
import { SectionHeader } from '../../components/ui/DashboardUI';
import { TestTube, Search, CheckCircle2, Clock, CreditCard, ArrowRight, Receipt, Loader2, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { labAPI } from '../../services/api';

interface LabTest { id: string; name: string; price: number; duration: string; instructions: string; category: string }

export default function LabServices() {
  const { user, labBookings, labReports, updateLabBookingStatus, fetchLabData, loading } = useApp();
  const [view, setView] = useState<'Tests' | 'MyBookings' | 'Reports' | 'Manage'>('Tests');
  const [tests, setTests] = useState<LabTest[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Net Banking'>('UPI');
  const [payStep, setPayStep] = useState<'Form' | 'Pay' | 'Done'>('Form');
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    fetchLabData();
    labAPI.getTests().then(res => {
      const data = res.data as Record<string, unknown>;
      setTests((data.tests as LabTest[]) || []);
    }).catch(() => {
      // Fallback catalogue if backend not available
      setTests([
        { id: 't1', name: 'Blood Glucose Test', price: 499, duration: '30 mins', instructions: 'Fast 8-12 hours before.', category: 'Blood' },
        { id: 't2', name: 'MRI Scan', price: 5500, duration: '45 mins', instructions: 'Remove all metal objects.', category: 'Radiology' },
        { id: 't3', name: 'X-Ray (Chest)', price: 800, duration: '15 mins', instructions: 'Inform if pregnant.', category: 'Radiology' },
        { id: 't4', name: 'ECG / EKG', price: 1200, duration: '20 mins', instructions: 'No special prep needed.', category: 'Cardiology' },
        { id: 't5', name: 'Lipid Profile', price: 999, duration: '30 mins', instructions: 'Fast 9-12 hours before.', category: 'Blood' },
        { id: 't6', name: 'Full Body Checkup', price: 2999, duration: '2 hours', instructions: 'Fast 10 hours. Early morning preferred.', category: 'General' },
      ]);
    });
  }, []);

  const myBookings = labBookings.filter(b => b.patientId === user?.id);
  const myReports = labReports.filter(r => r.patientId === user?.id);
  const filteredTests = tests.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayStep('Pay');
  };

  const handlePayAndBook = async () => {
    if (!selectedTest || !user) return;
    setBookingInProgress(true);
    try {
      await labAPI.book({ testName: selectedTest.name, date: bookingDate, time: bookingTime, paymentMethod, amount: selectedTest.price });
      // Simulate payment (backend auto-sets Pending, then we pay)
      // In a real scenario, book returns the booking ID and we pay separately
      await fetchLabData();
      setPayStep('Done');
    } catch {
      // error shown by context
    } finally { setBookingInProgress(false); }
  };

  const closeModal = () => { setSelectedTest(null); setPayStep('Form'); setBookingDate(''); setBookingTime(''); };

  const tabs = [
    { id: 'Tests', label: 'Tests', roles: ['Patient'] },
    { id: 'MyBookings', label: 'Bookings', roles: ['Patient'] },
    { id: 'Reports', label: 'Reports', roles: ['Patient'] },
    { id: 'Manage', label: 'Manage All', roles: ['Receptionist', 'Admin', 'Doctor'] },
  ].filter(t => t.roles.includes(user?.role || ''));

  return (
    <div className="space-y-10">
      <SectionHeader title="Diagnostics & Lab" description="Schedule tests, pay securely, and access your diagnostic reports." />

      <div className="flex flex-wrap gap-2 p-2 bg-white border border-slate-100 rounded-[2rem] shadow-xl w-full md:w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id as typeof view)}
            className={cn("flex-1 md:flex-none px-6 py-3 text-[9px] font-black uppercase tracking-[0.3em] transition-all rounded-[1.25rem] italic",
              view === tab.id ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-900"
            )}>{tab.label}</button>
        ))}
      </div>

      {/* Tests View */}
      {view === 'Tests' && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tests..."
              className="w-full pl-14 pr-6 py-4 border border-slate-100 rounded-2xl bg-white text-sm font-medium focus:outline-none focus:border-blue-600 shadow-lg transition-all" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map(test => (
              <div key={test.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    <TestTube className="w-7 h-7" />
                  </div>
                  <span className="text-[9px] font-black uppercase px-3 py-1 bg-slate-50 text-slate-500 rounded-full border border-slate-100">{test.category}</span>
                </div>
                <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight mb-2">{test.name}</h3>
                <p className="text-sm text-slate-500 mb-6 font-medium">{test.instructions}</p>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                    <Clock className="w-3.5 h-3.5" /> {test.duration}
                  </div>
                  <div className="text-2xl font-black text-slate-900">₹{test.price.toLocaleString()}</div>
                </div>
                <button onClick={() => { setSelectedTest(test); setPayStep('Form'); }}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2">
                  Book Test <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Bookings */}
      {view === 'MyBookings' && (
        <div className="space-y-4">
          {loading['lab'] && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}
          {myBookings.map(b => (
            <div key={b.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
                  <TestTube className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-900 uppercase tracking-tight">{b.testName}</h4>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">{b.date} @ {b.time}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase border",
                      b.paymentStatus === 'Paid' ? "bg-green-50 text-green-600 border-green-200" : "bg-orange-50 text-orange-600 border-orange-200"
                    )}>{b.paymentStatus}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase border",
                      b.status === 'Completed' ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-slate-50 text-slate-500 border-slate-200"
                    )}>{b.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {b.paymentMethod && (
                  <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> {b.paymentMethod}
                  </span>
                )}
              </div>
            </div>
          ))}
          {!loading['lab'] && myBookings.length === 0 && (
            <div className="py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center">
              <TestTube className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No lab bookings yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Reports */}
      {view === 'Reports' && (
        <div className="space-y-4">
          {myReports.map(r => (
            <div key={r.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border",
                  r.status === 'Final' ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-500 border-orange-100"
                )}>
                  <Receipt className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-900 uppercase tracking-tight">{r.testName}</h4>
                  <p className="text-sm text-slate-500 font-medium mt-1">{r.result}</p>
                  <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border inline-block mt-2",
                    r.status === 'Final' ? "bg-green-50 text-green-600 border-green-200" : "bg-orange-50 text-orange-500 border-orange-100"
                  )}>{r.status}</span>
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase">{r.date}</span>
            </div>
          ))}
          {myReports.length === 0 && (
            <div className="py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-medium">No reports available.</p>
            </div>
          )}
        </div>
      )}

      {/* Manage All — Staff view */}
      {view === 'Manage' && (
        <div className="space-y-4">
          {labBookings.map(b => (
            <div key={b.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-slate-900 uppercase tracking-tight">{b.patientName} — {b.testName}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{b.date} @ {b.time}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase border",
                  b.paymentStatus === 'Paid' ? "bg-green-50 text-green-600 border-green-200" : "bg-orange-50 text-orange-600 border-orange-200"
                )}>{b.paymentStatus}</span>
                {b.status !== 'Completed' && (
                  <button onClick={() => updateLabBookingStatus(b.id, 'Completed')} disabled={loading['lab']}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-1.5">
                    {loading['lab'] && <Loader2 className="w-3 h-3 animate-spin" />}
                    Mark Complete
                  </button>
                )}
                {b.status === 'Completed' && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase border border-blue-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 border border-slate-100 relative">
              <button onClick={closeModal} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
                <X className="w-5 h-5" />
              </button>

              {payStep === 'Form' && (
                <>
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedTest.name}</h3>
                    <p className="text-slate-500 text-sm font-medium mt-1">{selectedTest.instructions}</p>
                    <div className="text-3xl font-black text-blue-600 mt-4">₹{selectedTest.price.toLocaleString()}</div>
                  </div>
                  <form onSubmit={handleBookSubmit} className="space-y-5">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Preferred Date</label>
                      <input type="date" required value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-blue-600 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Preferred Time</label>
                      <select required value={bookingTime} onChange={e => setBookingTime(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-blue-600 outline-none appearance-none">
                        <option value="">Select slot</option>
                        {['07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2">
                      Continue to Payment <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </>
              )}

              {payStep === 'Pay' && (
                <>
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-slate-900 uppercase mb-4">Select Payment</h3>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <span className="font-bold text-slate-700">{selectedTest.name}</span>
                      <span className="font-black text-blue-600 text-xl">₹{selectedTest.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    {(['UPI', 'Card', 'Net Banking'] as const).map(m => (
                      <button key={m} onClick={() => setPaymentMethod(m)}
                        className={cn("w-full flex items-center gap-4 p-4 rounded-2xl border-2 font-black text-sm uppercase tracking-wide transition-all",
                          paymentMethod === m ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100 bg-white text-slate-600 hover:border-slate-300"
                        )}>
                        <CreditCard className="w-5 h-5" /> {m}
                        {paymentMethod === m && <CheckCircle2 className="w-5 h-5 text-blue-600 ml-auto" />}
                      </button>
                    ))}
                  </div>
                  <button onClick={handlePayAndBook} disabled={bookingInProgress}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                    {bookingInProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    Pay & Confirm Booking
                  </button>
                </>
              )}

              {payStep === 'Done' && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center border border-green-100 shadow-xl mx-auto animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Booked!</h3>
                    <p className="text-slate-500 font-medium mt-2">Your lab test has been scheduled.</p>
                    <p className="text-slate-400 text-sm mt-1">{bookingDate} at {bookingTime}</p>
                  </div>
                  <button onClick={closeModal} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
