import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300',
    error: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-300',
    info: 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/30 dark:border-sky-900/50 dark:text-sky-300',
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-505 dark:text-emerald-400" />,
    error: <AlertCircle className="h-5 w-5 text-rose-505 dark:text-rose-400" />,
    info: <Info className="h-5 w-5 text-sky-505 dark:text-sky-400" />,
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center p-4 border rounded-xl shadow-xl transition-all duration-300 transform translate-y-0 ${typeStyles[type]}`}>
      <div className="flex items-center space-x-3">
        {icons[type]}
        <p className="text-sm font-medium pr-6">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="ml-auto p-1 rounded-lg hover:bg-gray-250/20 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
