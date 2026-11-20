'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/lib/use-wishlist';
import { useTheme } from '@/context/ThemeContext';
import CartIcon from './CartIcon';
import UserDropdown from './UserDropdown';
import SwitchMark from './SwitchMark';
import HomeLink from './HomeLink';

const categoryLinks = [
  { href: '/cargadores', label: 'Cargadores y cables' },
  { href: '/fundas', label: 'Fundas' },
  { href: '/termos', label: 'Termos' },
  { href: '/personalizados', label: 'Personalizados' },
];

const helpLinks = [
  { href: '/envios', label: 'Envíos' },
  { href: '/devoluciones', label: 'Devoluciones' },
  { href: '/contacto', label: 'Contacto' },
];

const SUN = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MOON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

/** Buscador del header: GET a /buscar?q=, funciona sin JS y se puede compartir. */
function SearchForm({ id, className = '' }: { id: string; className?: string }) {
  return (
    <form
      action="/buscar"
      role="search"
      className={`flex h-12 items-center gap-2.5 rounded-full border border-outline-variant bg-surface-container-lowest px-4 focus-within:border-primary ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 text-on-surface-variant" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <label htmlFor={id} className="sr-only">
        Buscar productos
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder="Busca por producto o modelo de celular"
        className="min-w-0 flex-1 bg-transparent font-body text-base text-on-surface outline-none placeholder:text-on-surface-variant"
      />
    </form>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { toggleTheme } = useTheme();

  // Ajuste de estado durante el render (patrón recomendado): al cambiar de ruta,
  // cierra el menú móvil sin setState síncrono dentro de un effect.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileOpen, handleEscape]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface/90 backdrop-blur-md">
      <div className="container-store flex flex-col gap-3 pb-3 pt-3 md:gap-3 md:pb-0 md:pt-4">
        <div className="flex items-center gap-2 md:gap-6">
          <HomeLink className="mr-auto flex items-center gap-2.5 text-on-surface md:mr-0">
            <SwitchMark className="h-5 w-[34px] md:h-6 md:w-10" />
            <span className="font-heading text-[22px] font-extrabold md:text-[26px]">Switch&amp;Tech</span>
          </HomeLink>

          <SearchForm id="q-desktop" className="hidden flex-1 md:flex" />

          <div className="flex items-center gap-1">
            {/* En móvil el toggle vive dentro del menú. Ambos íconos están en el
                HTML y globals.css oculta el inactivo según el esquema real. */}
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden h-11 w-11 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container md:flex"
            >
              <span className="if-dark">
                {SUN}
                <span className="sr-only">Activar modo claro</span>
              </span>
              <span className="if-light">
                {MOON}
                <span className="sr-only">Activar modo oscuro</span>
              </span>
            </button>
            <div className="hidden md:block">
              {user ? (
                <UserDropdown />
              ) : (
                <Link
                  href="/iniciar-sesion"
                  className="flex h-11 items-center rounded-full px-3.5 font-body text-[15px] font-medium text-on-surface transition-colors hover:bg-surface-container"
                >
                  Entrar
                </Link>
              )}
            </div>
            <Link
              href="/favoritos"
              className="relative hidden h-11 w-11 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container sm:flex"
              aria-label={
                wishlist.length > 0
                  ? `Favoritos, ${wishlist.length} ${wishlist.length === 1 ? 'producto' : 'productos'}`
                  : 'Favoritos'
              }
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              {wishlist.length > 0 && (
                <span aria-hidden="true" className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-surface" />
              )}
            </Link>
            <CartIcon />
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface md:hidden"
              aria-label="Menú de navegación"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <SearchForm id="q-mobile" className="md:hidden" />

        <nav aria-label="Categorías" className="hidden flex-wrap items-center gap-x-7 gap-y-1 md:flex">
          {categoryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`border-b-2 py-3 font-body text-[15px] transition-colors hover:text-primary ${
                isActive(link.href) ? 'border-accent font-semibold text-on-surface' : 'border-transparent text-on-surface'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <span className="flex-1" />
          {helpLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className="py-3 font-body text-[15px] text-on-surface-variant transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div
        id="mobile-menu"
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          // Altura máxima = viewport bajo el header; si no cabe, scroll interno.
          mobileOpen ? 'max-h-[calc(100dvh-8rem)] overflow-y-auto opacity-100' : 'invisible max-h-0 opacity-0'
        }`}
      >
        <nav className="border-t border-outline-variant bg-surface px-5 py-4" aria-label="Navegación móvil">
          <ul className="flex flex-col gap-1">
            {[...categoryLinks, { href: '/favoritos', label: 'Favoritos' }, ...helpLinks].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`block rounded-xl px-4 py-3 font-body text-base transition-colors ${
                    isActive(link.href)
                      ? 'bg-primary-container font-semibold text-on-primary-container'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {user ? (
              <>
                <li className="mt-2 border-t border-outline-variant px-4 pb-1 pt-3">
                  <p className="font-body text-sm font-semibold text-on-surface">{user.name}</p>
                  <p className="truncate font-body text-sm text-on-surface-variant">{user.email}</p>
                </li>
                <li>
                  <Link href="/mis-ordenes" className="block rounded-xl px-4 py-3 font-body text-base text-on-surface hover:bg-surface-container">
                    Mis órdenes
                  </Link>
                </li>
                <li>
                  <Link href="/perfil" className="block rounded-xl px-4 py-3 font-body text-base text-on-surface hover:bg-surface-container">
                    Mi perfil
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="w-full rounded-xl px-4 py-3 text-left font-body text-base text-error hover:bg-error-container"
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <li className="mt-2 border-t border-outline-variant pt-2">
                <Link href="/iniciar-sesion" className="block rounded-xl px-4 py-3 font-body text-base font-semibold text-primary hover:bg-surface-container">
                  Entrar
                </Link>
              </li>
            )}

            <li className="mt-1 border-t border-outline-variant pt-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-body text-base text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                <span className="if-dark flex items-center gap-3">
                  {SUN}
                  Activar modo claro
                </span>
                <span className="if-light flex items-center gap-3">
                  {MOON}
                  Activar modo oscuro
                </span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
