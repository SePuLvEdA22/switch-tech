'use client';

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  createdAt: number;
}

interface ToastContextValue {
  addToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 3500;

type AriaNotifyDocument = Document & {
  ariaNotify?: (message: string, options?: { priority?: 'normal' | 'high' }) => void;
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const hoveredIdRef = useRef<string | null>(null);
  const recentRef = useRef<Map<string, number>>(new Map());
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  /**
   * Anuncia el mensaje UNA vez. Los toasts visibles no son live regions
   * (antes cada uno era role="alert" dentro de un aria-live: doble anuncio).
   * Errores con prioridad alta; éxito/info sin interrumpir.
   */
  const announce = useCallback((message: string, type: Toast['type']) => {
    const doc = document as AriaNotifyDocument;
    if (typeof doc.ariaNotify === 'function') {
      doc.ariaNotify(message, { priority: type === 'error' ? 'high' : 'normal' });
      return;
    }
    // Fallback: live regions presentes desde la carga. Se vacían y se
    // rellenan para que un mensaje repetido se vuelva a anunciar.
    const region = type === 'error' ? assertiveRef.current : politeRef.current;
    if (!region) return;
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 50);
  }, []);

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const startTimer = useCallback((id: string) => {
    clearTimer(id);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timersRef.current.delete(id);
    }, TOAST_DURATION);
    timersRef.current.set(id, timer);
  }, [clearTimer]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    // Deduplicación fuera del updater de setState (debe ser puro: en
    // StrictMode se ejecuta dos veces y anunciaría dos veces).
    const now = Date.now();
    const dedupeKey = `${type}:${message}`;
    const last = recentRef.current.get(dedupeKey);
    if (last !== undefined && now - last < 2000) return;
    for (const [key, at] of recentRef.current) {
      if (now - at >= 2000) recentRef.current.delete(key);
    }
    recentRef.current.set(dedupeKey, now);

    const id = `${now}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type, createdAt: now }]);
    startTimer(id);
    announce(message, type);
  }, [startTimer, announce]);

  const removeToast = useCallback((id: string) => {
    clearTimer(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, [clearTimer]);

  const handleMouseEnter = useCallback((id: string) => {
    hoveredIdRef.current = id;
    clearTimer(id);
  }, [clearTimer]);

  const handleMouseLeave = useCallback((id: string) => {
    if (hoveredIdRef.current === id) {
      hoveredIdRef.current = null;
      startTimer(id);
    }
  }, [startTimer]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Fallback de anuncios para navegadores sin ariaNotify(). */}
      <div className="sr-only">
        <p>Anuncios para lectores de pantalla</p>
        <div ref={politeRef} aria-live="polite" />
        <div ref={assertiveRef} aria-live="assertive" />
      </div>
      <div
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-full max-w-sm px-4 pointer-events-none"
        role="region"
        aria-label="Notificaciones"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl px-5 py-3.5 font-body text-sm shadow-medium w-full pointer-events-auto animate-toast-slide ${
              toast.type === 'success'
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : toast.type === 'error'
                ? 'bg-error text-on-error shadow-lg shadow-error/20'
                : 'bg-surface-container-high text-on-surface shadow-soft'
            }`}
            onMouseEnter={() => handleMouseEnter(toast.id)}
            onMouseLeave={() => handleMouseLeave(toast.id)}
            // Pausar también mientras el foco está en el toast (botón cerrar).
            onFocus={() => handleMouseEnter(toast.id)}
            onBlur={() => handleMouseLeave(toast.id)}
          >
            <span className="mt-0.5 flex-shrink-0">
              {toast.type === 'success' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </span>
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 mt-0.5 opacity-70 transition-all hover:opacity-100 hover:scale-110 active:scale-90"
              aria-label="Cerrar notificación"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
