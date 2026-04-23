import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Shield, Users, Calendar, Pill, Zap, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: <Calendar />, title: "Smart Scheduling", desc: "Effortless appointment booking for patients and clinics." },
    { icon: <Shield />, title: "Bed Management", desc: "Real-time tracking of hospital occupancy and bed allocation." },
    { icon: <Zap />, title: "Emergency SOS", desc: "One-tap emergency trigger with location sharing and navigation." },
    { icon: <Activity />, title: "Lab Integration", desc: "Seamless reporting and sharing of medical test results." },
    { icon: <Heart />, title: "Patient Care", desc: "Centralized history and personalized health symptom analysis." },
    { icon: <Users />, title: "Role-Based Access", desc: "Dedicated dashboards for doctors, staff, and administrators." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">CareSync</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
            <button 
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-8 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 text-xs font-black tracking-widest"
            >
              LOGIN
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                V 2.0 Live Now
              </div>
              <h1 className="text-6xl md:text-7xl font-bold leading-[1.1] tracking-tighter mb-8 text-slate-900">
                Smart Healthcare, <span className="text-blue-600">Simplified.</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mb-10 leading-relaxed italic-small font-medium">
                Experience the future of hospital management. A unified platform for patients, 
                doctors, and staff to deliver exceptional care with real-time sync.
              </p>
              <div className="flex flex-wrap gap-6 items-center">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-bold flex items-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 group text-sm tracking-wide"
                >
                  Enter Dashboard <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-2xl border-4 border-slate-50 bg-slate-200 overflow-hidden shadow-sm">
                      <img src={`https://picsum.photos/seed/doc${i}/100/104`} alt="Avatar" referrerPolicy="no-referrer" className="grayscale hover:grayscale-0 transition-all duration-500" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-2xl border-4 border-slate-50 bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-black shadow-sm">
                    +5k
                  </div>
                  <div className="pl-6 flex flex-col justify-center">
                    <div className="text-sm font-bold text-slate-800">Trusted by Clinics</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Health Network</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square bg-white rounded-[4rem] shadow-2xl relative overflow-hidden p-10 border border-slate-100">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/5 blur-[100px] rounded-full" />
                 <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-400/5 blur-[100px] rounded-full" />
                 
                 <div className="grid grid-cols-2 gap-6 relative z-10 h-full">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col justify-between">
                       <Activity className="w-12 h-12 text-blue-600" />
                       <div className="space-y-3">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Monitoring</div>
                          <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                             <div className="h-full bg-blue-600 w-3/4 rounded-full" />
                          </div>
                       </div>
                    </div>
                    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl translate-y-12 flex flex-col justify-between border border-slate-800">
                       <Calendar className="w-12 h-12 text-blue-400" />
                       <div>
                          <div className="text-2xl font-bold">12</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Appts Today</div>
                       </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/5 border border-slate-100 col-span-2 flex flex-col justify-between">
                       <div className="flex justify-between items-center mb-4">
                          <div className="text-sm font-black text-slate-900 uppercase tracking-tight">System Status</div>
                          <div className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase tracking-widest">84% Capacity</div>
                       </div>
                       <div className="flex gap-2.5">
                          {[1,2,3,4,5,6,7,8,9,10].map(j => (
                             <div key={j} className={cn("h-10 flex-1 rounded-xl", j > 7 ? "bg-slate-50 border border-slate-100" : "bg-blue-600 shadow-lg shadow-blue-500/20")} />
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-24 space-y-6">
            <h2 className="text-5xl font-bold tracking-tight text-slate-900">Everything you need to run a modern facility</h2>
            <p className="text-slate-500 italic-small font-medium text-lg leading-relaxed">Streamline workflows, reduce errors, and improve patient outcomes with our integrated toolset.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-slate-100">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight text-slate-800">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed italic-small text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">CareSync</span>
          </div>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] max-w-sm">
            © 2024 CareSync Healthcare Systems. Engineered for excellence in medical management.
          </div>
          <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
