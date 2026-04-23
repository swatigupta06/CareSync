import { Bell, Search, User, ChevronDown, Heart, Zap, Menu, ArrowLeft } from 'lucide-react';
import { useApp } from '../../AppContext';
import { cn } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isRootDashboard = location.pathname === '/dashboard';

  return (
    <div className="h-20 lg:h-24 bg-white/80 backdrop-blur-2xl border-b border-slate-100 flex items-center justify-between px-6 md:px-12 sticky top-0 z-40 transition-all duration-500">
      <div className="flex items-center gap-4 md:gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm border border-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {!isRootDashboard && (
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm border border-blue-100 flex items-center gap-2 group/back shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Return</span>
          </button>
        )}

        <div className="flex flex-col hidden sm:flex">
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase italic">Workspace</h1>
          <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Medical Core</p>
        </div>

        <div className="flex lg:hidden items-center gap-4">
           <div className="w-8 h-8 lg:w-12 lg:h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl">
             <Heart className="w-4 h-4 fill-current" />
           </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-8">
        <div className="hidden lg:flex items-center relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Query Nexus registry..."
            className="w-64 bg-slate-50 border border-slate-100 py-4 pl-14 pr-8 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:bg-white transition-all focus:border-blue-600"
          />
        </div>

        <button 
          onClick={() => navigate('/dashboard/sos')}
          className="bg-red-500 hover:bg-slate-900 text-white px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-[1.5rem] text-[9px] md:text-[10px] font-black tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-red-500/20 transition-all active:scale-95 border border-red-400/20 group uppercase"
        >
          <Zap className="w-4 h-4 fill-white group-hover:animate-bounce" />
          <span className="hidden xs:inline">SOS</span>
        </button>

        <div className="w-px h-10 bg-slate-100 hidden md:block" />

        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="flex flex-col items-end hidden xs:flex">
            <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight uppercase leading-none mb-1 max-w-[100px] truncate">{user?.name}</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">{user?.role}</span>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-slate-100 shadow-md group-hover:rotate-6 transition-all overflow-hidden bg-white">
             <img src={user?.avatar || `https://picsum.photos/seed/${user?.email}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>
    </div>
  );
}
