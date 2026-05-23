import React from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getShadowColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'shadow-emerald-500/10 dark:shadow-emerald-500/5 border-emerald-500/20';
      case 'warning':
        return 'shadow-amber-500/10 dark:shadow-amber-500/5 border-amber-500/20';
      case 'error':
        return 'shadow-rose-500/10 dark:shadow-rose-500/5 border-rose-500/20';
      default:
        return 'shadow-primary-500/10 dark:shadow-primary-500/5 border-primary-500/20';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-start justify-between p-4 rounded-xl glass-panel shadow-lg border ${getShadowColor(toast.type)}`}
          >
            <div className="flex gap-3 items-start pr-2">
              <div className="mt-0.5 shrink-0">{getIcon(toast.type)}</div>
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors focus:outline-none focus:ring-1 focus:ring-primary-500 rounded p-0.5 shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
