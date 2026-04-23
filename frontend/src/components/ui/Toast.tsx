import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useApp } from '../../AppContext';
import { cn } from '../../lib/utils';

export default function Toast() {
  const { toast } = useApp();

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[90vw]"
        >
          <div className={cn(
            'flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-sm',
            colors[toast.type]
          )}>
            {React.createElement(icons[toast.type], {
              className: cn('w-5 h-5 shrink-0', iconColors[toast.type])
            })}
            <p className="text-sm font-bold flex-1">{toast.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
