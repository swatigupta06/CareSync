import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, Calendar, Users, Activity, 
  MapPin, Settings, LogOut, Heart, 
  LayoutDashboard, Bed, TestTube, Cross, FileText,
  UserCircle
} from 'lucide-react';
import { useApp } from '../../AppContext';
import { cn } from '../../lib/utils';
import { Role } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const getMenuItems = (role: Role) => {
    const base = [
      { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    ];

    const roleSpecific = {
      Patient: [
        { icon: UserCircle, label: 'My Profile', path: '/dashboard/profile' },
        { icon: Users, label: 'Doctors', path: '/dashboard/doctors' },
        { icon: Calendar, label: 'Appointments', path: '/dashboard/appointments' },
        { icon: TestTube, label: 'Services & Labs', path: '/dashboard/labs' },
        { icon: FileText, label: 'Medical Records', path: '/dashboard/records' },
        { icon: Cross, label: 'Emergency SOS', path: '/dashboard/sos' },
      ],
      Doctor: [
        { icon: Calendar, label: 'My Schedule', path: '/dashboard/schedule' },
        { icon: Users, label: 'Patient List', path: '/dashboard/patients' },
        { icon: FileText, label: 'Health Vault', path: '/dashboard/records' },
      ],
      Receptionist: [
        { icon: Calendar, label: 'Manage Appts', path: '/dashboard/manage-appointments' },
        { icon: Bed, label: 'Bed Management', path: '/dashboard/beds' },
        { icon: TestTube, label: 'Diagnostics', path: '/dashboard/labs' },
        { icon: Users, label: 'Registration', path: '/dashboard/registration' },
      ],
      Admin: [
        { icon: Users, label: 'User Directory', path: '/dashboard/users' },
        { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
        { icon: Bed, label: 'Bed Monitoring', path: '/dashboard/beds' },
      ]
    };

    return [...base, ...(roleSpecific[role] || [])];
  };

  const menuItems = user ? getMenuItems(user.role) : [];

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-[60] w-80 bg-slate-900 transition-transform duration-500 ease-in-out transform lg:translate-x-0 lg:static lg:inset-auto",
      isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
    )}>
      <div className="h-full flex flex-col relative overflow-hidden group/sidebar">
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden absolute top-8 right-6 text-slate-500 hover:text-white transition-colors z-20"
        >
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <LogOut className="w-5 h-5 rotate-180" />
          </div>
        </button>

        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="p-8 lg:p-10 flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-[0_8px_30px_rgba(59,130,246,0.3)] border border-blue-400/20 group-hover/sidebar:rotate-6 transition-transform">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-white leading-none">CareSync</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Medical Portal</span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar relative z-10 py-4 font-display">
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4 mb-4">Main Menu</div>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-black transition-all group/item relative",
                  isActive 
                    ? "bg-blue-600 text-white shadow-2xl shadow-blue-500/20 border border-blue-400/20" 
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-100"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isActive ? "text-white scale-110" : "text-slate-600 group-hover/item:text-blue-400 group-hover/item:scale-110"
                )} />
                <span className="tracking-wide uppercase text-[11px]">{item.label}</span>
                {isActive && (
                   <motion.div 
                     layoutId="sidebar-dot"
                     className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" 
                   />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 relative z-10">
          <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-100 font-black border-2 border-white/10 overflow-hidden shrink-0 shadow-xl">
                 <img src={user?.avatar || `https://picsum.photos/seed/${user?.email}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="overflow-hidden">
                 <p className="text-sm font-black text-white truncate uppercase tracking-tight leading-none mb-1.5">{user?.name}</p>
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em]">{user?.role}</p>
                 </div>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {!showLogoutConfirm ? (
                <motion.button
                  key="logout-btn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full py-4 bg-white/5 hover:bg-red-600 text-slate-400 hover:text-white text-[10px] font-black tracking-[0.2em] uppercase rounded-2xl transition-all border border-white/5 hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </motion.button>
              ) : (
                <motion.div
                  key="logout-confirm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-3"
                >
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest text-center px-2">Terminate secure session?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login', { replace: true });
                      }}
                      className="py-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="py-3 bg-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-white/20 transition-colors border border-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
