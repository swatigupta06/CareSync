import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color = 'blue', 
  trend,
  className
}: { 
  label: string; 
  value: string | number; 
  icon: LucideIcon; 
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  trend?: { value: string; positive: boolean };
  className?: string;
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 shadow-[0_8px_30px_rgba(59,130,246,0.15)]',
    green: 'bg-green-50 text-green-600 border-green-100 shadow-[0_8px_30px_rgba(34,197,94,0.15)]',
    orange: 'bg-orange-50 text-orange-600 border-orange-100 shadow-[0_8px_30px_rgba(249,115,22,0.15)]',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 shadow-[0_8px_30px_rgba(168,85,247,0.15)]',
    red: 'bg-red-50 text-red-600 border-red-100 shadow-[0_8px_30px_rgba(239,68,68,0.15)]',
  };

  return (
    <div className={cn("bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-900/5 transition-all group hover:shadow-2xl hover:-translate-y-1", className)}>
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-110 duration-500", colors[color])}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        {trend && (
          <span className={cn(
             "text-[8px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-widest",
             trend.positive ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          )}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 md:mb-2">{label}</p>
        <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
      </div>
    </div>
  );
}

export function SectionHeader({ title, description, action }: { title: string, description?: string, action?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
      <div className="space-y-2 md:space-y-1 max-w-2xl">
        <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-none uppercase italic">{title}</h2>
        {description && <p className="text-slate-500 text-sm md:text-base italic-small font-medium tracking-tight leading-snug">{description}</p>}
      </div>
      {action && <div className="shrink-0 w-full md:w-auto">{action}</div>}
    </div>
  );
}
