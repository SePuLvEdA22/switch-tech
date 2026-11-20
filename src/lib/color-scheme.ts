/**
 * Constantes compartidas entre el layout (Server Component) y ThemeContext.
 * Vive fuera del módulo 'use client' porque desde un Server Component lo
 * exportado por un módulo de cliente es una referencia, no el valor.
 */

/** Misma clave que la versión anterior: conserva la preferencia de quien ya la tenía. */
export const THEME_KEY = 'theme';

/**
 * Script inline para <head>: aplica el override guardado al
 * <meta name="color-scheme"> antes del primer pintado (sin flash del tema
 * equivocado). Mínimo a propósito; el resto vive en ThemeProvider.
 */
export const COLOR_SCHEME_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="light"||t==="dark")document.querySelector('meta[name="color-scheme"]').content=t}catch(e){}`;
