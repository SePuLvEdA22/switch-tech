import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import SiteShell from "@/components/SiteShell";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { COLOR_SCHEME_SCRIPT } from "@/lib/color-scheme";

const CartDrawer = dynamic(() => import("@/components/CartDrawer"));

// Títulos: Bricolage Grotesque condensada (eje wdth). Texto: Instrument Sans.
// Fuentes variables: un solo archivo por familia con todos los pesos.
const headingFont = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-bricolage",
});

const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://switchandtech.com"),
  title: {
    default: "Switch&Tech — Cargadores, fundas y termos",
    template: "%s | Switch&Tech",
  },
  description:
    "Cargadores, cables, fundas, termos y accesorios personalizados con envío a toda Colombia. Paga con PSE o tarjeta.",
  keywords: ["fundas", "cargadores", "termos", "accesorios", "personalizados", "tecnología", "Switch&Tech"],
  authors: [{ name: "Switch&Tech" }],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Switch&Tech",
    title: "Switch&Tech — Cargadores, fundas y termos",
    description:
      "Cargadores, cables, fundas, termos y accesorios personalizados con envío a toda Colombia. Paga con PSE o tarjeta.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Switch&Tech — Cargadores, fundas y termos",
    description:
      "Cargadores, cables, fundas, termos y accesorios personalizados con envío a toda Colombia.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://switchandtech.com",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EDF0EF" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1615" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${headingFont.variable} ${bodyFont.variable}`}
    >
      <head>
        {/*
          El esquema de color lo decide este <meta> (globals.css lo mapea a
          `color-scheme`). "light dark" = seguir al sistema, funciona sin JS.
          El script inline aplica el override guardado ANTES del primer pintado
          (sin flash). Debe ser síncrono: no usar defer/async/module.
          suppressHydrationWarning: el script cambia `content` antes de hidratar.
        */}
        <meta name="color-scheme" content="light dark" suppressHydrationWarning />
        <script dangerouslySetInnerHTML={{ __html: COLOR_SCHEME_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-surface font-body text-on-surface antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary focus:outline-none"
        >
          Saltar al contenido principal
        </a>
        <AuthProvider>
          <ThemeProvider>
          <CartProvider>
            <ToastProvider>
              <SiteShell>
                {children}
              </SiteShell>
              <CartDrawer />
            </ToastProvider>
          </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
