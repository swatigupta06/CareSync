import { useState, useEffect } from 'react';
import { SectionHeader } from '../../components/ui/DashboardUI';
import { Zap, MapPin, Phone, AlertTriangle, ShieldCheck, HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useApp } from '../../AppContext';
import { sosAPI } from '../../services/api';

interface SOSResult {
  nearestHospital: { name: string; address: string; phone: string; distance: string };
  route: { steps: string[]; estimatedTime: string };
  emergencyNumbers: { national: string; ambulance: string; hospital: string };
}

export default function EmergencySOS() {
  const { user, showToast } = useApp();
  const [status, setStatus] = useState<'idle' | 'triggered' | 'connected'>('idle');
  const [countdown, setCountdown] = useState(5);
  const [position, setPosition] = useState<{lat: number; lng: number} | null>(null);
  const [result, setResult] = useState<SOSResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (status === 'triggered' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (status === 'triggered' && countdown === 0) {
      setStatus('connected');
    }
    return () => clearTimeout(timer);
  }, [status, countdown]);

  const handleTrigger = async () => {
    setStatus('triggered');
    setIsLoading(true);
    let lat: number | null = null;
    let lng: number | null = null;
    let address = 'Unknown location';

    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setPosition({ lat, lng });
      } catch { /* geolocation denied */ }
    }

    try {
      const res = await sosAPI.trigger({ lat, lng, address });
      const data = res.data as Record<string, unknown>;
      setResult({
        nearestHospital: data.nearestHospital as SOSResult['nearestHospital'],
        route: data.route as SOSResult['route'],
        emergencyNumbers: data.emergencyNumbers as SOSResult['emergencyNumbers'],
      });
      showToast('SOS triggered! Emergency services notified.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'SOS trigger failed', 'error');
      setStatus('idle');
      setCountdown(5);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => { setStatus('idle'); setCountdown(5); setResult(null); setPosition(null); };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <SectionHeader title="Emergency Assistance" description="One-tap connection to medical emergency services and nearest hospitals." />

      <div className="bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl shadow-slate-900/5 border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
        {status === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 text-center space-y-8">
            <div className="relative">
              <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-red-100 rounded-full blur-[60px] opacity-40" />
              <button onClick={handleTrigger}
                className="relative w-56 h-56 bg-slate-900 text-white rounded-full flex flex-col items-center justify-center shadow-[0_30px_100px_rgba(220,38,38,0.2)] hover:shadow-[0_40px_120px_rgba(220,38,38,0.3)] transition-all group overflow-hidden border-4 border-white">
                <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex flex-col items-center p-4">
                  <Zap className="w-16 h-16 mb-2 fill-current text-red-500 group-hover:text-white transition-colors animate-pulse" />
                  <span className="text-2xl font-black uppercase tracking-tighter italic">Trigger SOS</span>
                  <div className="text-[9px] font-black text-slate-400 group-hover:text-white/70 mt-1 uppercase tracking-[0.2em] transition-colors">Emergency Protocol</div>
                </div>
              </button>
            </div>
            <div className="max-w-xl space-y-3">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Secure Life-Link Active</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Activation will instantly broadcast your coordinates to the emergency grid and notify the nearest medical facilities.</p>
            </div>
            <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
              {[
                { icon: Phone, label: 'Global Response', value: '112 / 108' },
                { icon: AlertTriangle, label: 'Crisis Line', value: '1800-180-1104' },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-red-600 border border-slate-100">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</div>
                    <div className="text-lg font-black text-slate-900">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'triggered' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
            <div className="relative w-48 h-48">
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0.2, 0.7] }} transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 bg-red-500 rounded-full" />
              <div className="relative w-full h-full bg-red-600 rounded-full flex flex-col items-center justify-center text-white shadow-2xl">
                <Zap className="w-16 h-16 fill-current mb-2" />
                <div className="text-6xl font-black">{countdown}</div>
                <div className="text-[9px] font-black uppercase tracking-widest mt-1">seconds</div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">SOS Activating...</h3>
              <p className="text-slate-500 mt-2">Broadcasting your location to emergency services</p>
            </div>
            <button onClick={handleReset} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">
              Cancel
            </button>
          </div>
        )}

        {status === 'connected' && result && (
          <div className="flex-1 p-8 space-y-6">
            <div className="flex items-center gap-4 p-6 bg-green-50 rounded-3xl border border-green-200">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black text-xl text-green-800 uppercase">Emergency Services Notified</h3>
                <p className="text-green-600 text-sm font-medium">Help is on the way. Stay calm and stay in place.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xl space-y-4">
                <h4 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" /> Nearest Hospital
                </h4>
                <div>
                  <p className="font-black text-slate-900 text-lg">{result.nearestHospital.name}</p>
                  <p className="text-slate-500 text-sm mt-1">{result.nearestHospital.address}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">{result.nearestHospital.distance} away</span>
                    <span className="text-sm font-bold text-slate-700">{result.nearestHospital.phone}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xl space-y-4">
                <h4 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-red-500" /> Emergency Numbers
                </h4>
                <div className="space-y-2">
                  {Object.entries(result.emergencyNumbers).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{k}</span>
                      <a href={`tel:${v}`} className="font-black text-blue-600 hover:text-blue-800">{v}</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xl">
              <h4 className="font-black text-slate-800 uppercase tracking-tight mb-4">Route ({result.route.estimatedTime})</h4>
              <ol className="space-y-2">
                {result.route.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <button onClick={handleReset} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-all">
              Reset Emergency System
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
