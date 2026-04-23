import React, { useState, useEffect } from 'react';
import { useApp } from '../../AppContext';
import { SectionHeader, StatCard } from '../../components/ui/DashboardUI';
import { Users, Calendar, Bed, TrendingUp, Activity, Loader2, AlertTriangle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Analytics {
  users: { total: number; patients: number; doctors: number; receptionists: number };
  appointments: { total: number; recent7Days: number; byStatus: Record<string, number> };
  lab: { totalBookings: number; paidBookings: number; revenue: number };
  beds: { total: number; available: number; occupied: number; occupancyRate: number };
  emergency: { activeSOS: number };
  records: { total: number };
}

export default function AdminOverview() {
  const { users, appointments, beds } = useApp();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(res => {
        const data = res.data as Record<string, unknown>;
        setAnalytics(data.analytics as Analytics);
      })
      .catch(() => {
        // Fallback to local state counts
        setAnalytics({
          users: { total: users.length, patients: users.filter(u => u.role === 'Patient').length, doctors: users.filter(u => u.role === 'Doctor').length, receptionists: users.filter(u => u.role === 'Receptionist').length },
          appointments: { total: appointments.length, recent7Days: 0, byStatus: { Pending: appointments.filter(a => a.status === 'Pending').length, Confirmed: appointments.filter(a => a.status === 'Confirmed').length, Completed: appointments.filter(a => a.status === 'Completed').length, Cancelled: appointments.filter(a => a.status === 'Cancelled').length } },
          lab: { totalBookings: 0, paidBookings: 0, revenue: 0 },
          beds: { total: beds.length, available: beds.filter(b => b.status === 'Available').length, occupied: beds.filter(b => b.status === 'Occupied').length, occupancyRate: beds.length ? Math.round((beds.filter(b => b.status === 'Occupied').length / beds.length) * 100) : 0 },
          emergency: { activeSOS: 0 },
          records: { total: 0 },
        });
      })
      .finally(() => setLoadingAnalytics(false));
  }, []);

  const weeklyData = [
    { name: 'Mon', appointments: analytics?.appointments.byStatus.Confirmed || 12 },
    { name: 'Tue', appointments: 19 },
    { name: 'Wed', appointments: analytics?.appointments.recent7Days || 15 },
    { name: 'Thu', appointments: 22 },
    { name: 'Fri', appointments: 30 },
    { name: 'Sat', appointments: 10 },
    { name: 'Sun', appointments: 8 },
  ];

  const pieData = analytics ? [
    { name: 'Available', value: analytics.beds.available },
    { name: 'Occupied', value: analytics.beds.occupied },
  ] : [];

  const COLORS = ['#3b82f6', '#1e293b'];

  if (loadingAnalytics) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-10">
      <SectionHeader title="System Analytics" description="Real-time overview of the CareSync platform." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users" value={analytics?.users.total || users.length} icon={Users} color="blue" trend={{ value: `${analytics?.users.patients || 0} patients`, positive: true }} />
        <StatCard label="Appointments" value={analytics?.appointments.total || appointments.length} icon={Calendar} color="purple" trend={{ value: `${analytics?.appointments.recent7Days || 0} this week`, positive: true }} />
        <StatCard label="Occupied Beds" value={analytics?.beds.occupied || 0} icon={Bed} color="orange" />
        <StatCard label="Lab Revenue" value={`₹${(analytics?.lab.revenue || 0).toLocaleString()}`} icon={TrendingUp} color="green" trend={{ value: `${analytics?.lab.paidBookings || 0} paid`, positive: true }} />
      </div>

      {/* Active SOS alert */}
      {(analytics?.emergency.activeSOS || 0) > 0 && (
        <div className="p-6 bg-red-50 border-2 border-red-200 rounded-[2rem] flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-red-800 uppercase tracking-tight">Active Emergency Alerts</h4>
            <p className="text-red-600 font-bold text-sm">{analytics?.emergency.activeSOS} SOS alert(s) require immediate attention</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Appointment Trends */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
          <SectionHeader title="Appointment Trends" description="Weekly booking analytics." />
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px' }} />
                <Bar dataKey="appointments" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bed Occupancy */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
          <SectionHeader title="Bed Occupancy" description={`${analytics?.beds.occupancyRate || 0}% occupancy rate`} />
          <div className="h-[300px] flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-4xl font-black text-slate-900">{analytics?.beds.occupancyRate || 0}%</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Occupancy</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={3} dataKey="value">
                  {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Status Breakdown */}
      {analytics && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
          <SectionHeader title="Appointment Status Breakdown" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {Object.entries(analytics.appointments.byStatus).map(([status, count]) => (
              <div key={status} className={cn("p-6 rounded-[2rem] border text-center",
                status === 'Completed' ? "bg-green-50 border-green-100" :
                status === 'Pending' ? "bg-orange-50 border-orange-100" :
                status === 'Confirmed' ? "bg-blue-50 border-blue-100" :
                "bg-slate-50 border-slate-100"
              )}>
                <div className="text-3xl font-black text-slate-900 mb-1">{count}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
