import Link from 'next/link';
import HomeLink from './HomeLink';

const columns = [
  {
    title: 'Tienda',
    links: [
      { href: '/cargadores', label: 'Cargadores y cables' },
      { href: '/fundas', label: 'Fundas' },
      { href: '/termos', label: 'Termos' },
      { href: '/personalizados', label: 'Personalizados' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { href: '/envios', label: 'Envíos' },
      { href: '/devoluciones', label: 'Devoluciones' },
      { href: '/faq', label: 'Preguntas frecuentes' },
      { href: '/contacto', label: 'Contacto' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacidad', label: 'Privacidad' },
      { href: '/terminos', label: 'Términos y condiciones' },
    ],
  },
];

const socials = [
  { name: 'Instagram', url: 'https://instagram.com/switchandtech' },
  { name: 'TikTok', url: 'https://tiktok.com/@switchandtech' },
  { name: 'Facebook', url: 'https://facebook.com/switchandtech' },
  { name: 'Pinterest', url: 'https://pinterest.com/switchandtech' },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-outline-variant">
      <div className="container-store grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-3 lg:col-span-1">
          <HomeLink className="self-start font-heading text-2xl font-extrabold text-on-surface">
            Switch&amp;Tech
          </HomeLink>
          <p className="font-body text-[15px] leading-relaxed text-on-surface-variant">
            Accesorios para tu celular y tu día, con envío a toda Colombia.
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
            <h2 className="font-body text-[15px] font-semibold tracking-normal text-on-surface [font-stretch:100%]">
              {col.title}
            </h2>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-[15px] text-on-surface-variant transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="flex flex-col gap-3">
          <h2 className="font-body text-[15px] font-semibold tracking-normal text-on-surface [font-stretch:100%]">
            Síguenos
          </h2>
          <ul className="flex flex-col gap-2.5">
            {socials.map((social) => (
              <li key={social.name}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-[15px] text-on-surface-variant transition-colors hover:text-primary"
                >
                  {social.name}
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-store">
        <p className="border-t border-outline-variant py-6 font-body text-sm text-on-surface-variant">
          &copy; {new Date().getFullYear()} Switch&amp;Tech. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
