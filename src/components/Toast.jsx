import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiInfo, FiX, FiAlertCircle } from 'react-icons/fi';

const ToastContext = createContext(null);

const icons = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  const Icon = icons[toast?.type] || FiCheckCircle;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-5 z-[100] flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl border border-white/10 bg-ink px-4 py-3.5 text-white shadow-2xl"
            >
              <Icon
                size={18}
                className={toast.type === 'error' ? 'mt-0.5 shrink-0 text-racing' : 'mt-0.5 shrink-0 text-emerald-400'}
              />
              <p className="text-sm leading-snug text-white/85">{toast.message}</p>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="ml-1 rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss notification"
              >
                <FiX size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
