import { useState } from 'react';

const SITE = 'https://www.lesguidesgrenat.fr';

const NAV = [
  { label: 'Accueil', href: `${SITE}/` },
  { label: "L'association", href: `${SITE}/association` },
  { label: 'Le métier', href: `${SITE}/m%C3%A9tier` },
  { label: 'Annuaire', href: '/', current: true },
];

const CTA = { label: 'Trouver un guide', href: 'https://tally.so/r/81ZAqo' };

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/lesguidesgrenat/' },
  { label: 'Facebook', href: 'https://www.facebook.com/GrenatGuidesConferenciers' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lesguidesgrenat/' },
  { label: 'YouTube', href: 'https://www.youtube.com/@lesguidesgrenat' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <div className="site-bar">
      <div className="container site-bar-inner">
        <a href={`${SITE}/`} className="site-logo">GRENAT</a>

        <button
          type="button"
          className="site-burger"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span /><span /><span />
        </button>

        <nav className={`site-nav${open ? ' is-open' : ''}`} aria-label="Navigation principale">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`site-nav-link${item.current ? ' is-current' : ''}`}
              aria-current={item.current ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
          <a href={CTA.href} className="site-cta" target="_blank" rel="noopener noreferrer">
            {CTA.label}
          </a>
        </nav>
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div>
          <a href={`${SITE}/`} className="site-logo">GRENAT</a>
          <p className="site-footer-tagline">
            Association professionnelle des guides conférenciers en Auvergne-Rhône-Alpes
          </p>
        </div>
        <nav className="site-footer-nav" aria-label="Pied de page">
          {NAV.map((item) => (
            <a key={item.label} href={item.href}>{item.label}</a>
          ))}
          <a href={`${SITE}/contact`}>Nous contacter</a>
        </nav>
        <nav className="site-footer-nav" aria-label="Réseaux sociaux">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
          ))}
        </nav>
      </div>
      <div className="container site-footer-copy">{new Date().getFullYear()} Grenat © Tous droits réservés</div>
    </footer>
  );
}
