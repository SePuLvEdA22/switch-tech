'use client';

import { createContext, useContext, useEffect, useCallback, useSyncExternalStore, type ReactNode } from 'react';
import { THEME_KEY } from '@/lib/color-scheme';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  /** Esquema que se está viendo (override del usuario o, si no hay, el del sistema). */
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Modelo de dos estados visibles sobre tres posibles:
 * - sin valor guardado → sigue al sistema (por defecto).
 * - "light" / "dark"   → override explícito del usuario.
 *
 * El estado vive fuera de React (localStorage + matchMedia), así que se lee
 * con useSyncExternalStore. El render del botón NO depende de este estado
 * (los íconos se muestran/ocultan por CSS), por lo que el valor de servidor
 * ('light') no produce flash ni mismatch visibles.
 */
const listeners = new Set<() => void>();

function readStored(): Theme | null {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null; // storage bloqueado (Safari privado, iframe)
  }
}

function systemTheme(): Theme {
  return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';
}

/** Override aplicado en esta sesión aunque no se haya podido persistir. */
let sessionOverride: Theme | null | undefined;

function currentOverride(): Theme | null {
  return sessionOverride !== undefined ? sessionOverride : readStored();
}

function applyToMeta(override: Theme | null): void {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (meta) meta.content = override ?? 'light dark';
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  const media = window.matchMedia?.(DARK_QUERY);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_KEY) return;
    // Otra pestaña cambió la preferencia: sincronizar esta.
    sessionOverride = undefined;
    applyToMeta(readStored());
    callback();
  };
  window.addEventListener('storage', onStorage);
  media?.addEventListener('change', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
    media?.removeEventListener('change', callback);
  };
}

function getSnapshot(): Theme {
  return currentOverride() ?? systemTheme();
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, (): Theme => 'light');

  // Red de seguridad: si el script inline no corrió (p. ej. CSP), aplicar aquí.
  useEffect(() => {
    applyToMeta(currentOverride());
  }, []);

  const toggleTheme = useCallback(() => {
    // Objetivo = lo contrario de lo que el usuario VE ahora.
    const target: Theme = getSnapshot() === 'dark' ? 'light' : 'dark';
    // Si coincide con el sistema, el usuario está deshaciendo su ajuste:
    // se borra el override para volver a seguir al sistema (no se fija).
    const override = target === systemTheme() ? null : target;

    sessionOverride = override;
    try {
      if (override) window.localStorage.setItem(THEME_KEY, override);
      else window.localStorage.removeItem(THEME_KEY);
      sessionOverride = undefined; // persistido: la fuente vuelve a ser storage
    } catch {
      /* no se pudo persistir: el cambio igual se aplica en esta sesión */
    }
    applyToMeta(override);
    notify();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
