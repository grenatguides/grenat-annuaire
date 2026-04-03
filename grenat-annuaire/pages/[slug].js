import Head from 'next/head';
import Link from 'next/link';
import { fetchAllGuides } from '../lib/notion';

/* ─── Tag component ─────────────────────────────────── */
function Tag({ children, variant = 'default' }) {
  return <span className={`tag tag-${variant}`}>{children}
    <style jsx>{`
      .tag {
        display: inline-block;
        font-size: 12px; font-weight: 600;
        padding: 4px 10px; border-radius: 5px;
        letter-spacing: 0.04em;
      }
      .tag-lang { background: var(--magenta-dim); color: var(--pink); border: 1px solid rgba(204,0,96,0.25); }
      .tag-dept { background: var(--cyan-dim); color: var(--cyan); border: 1px solid var(--cyan-border); }
      .tag-ville { background: rgba(255,255,255,0.06); color: var(--muted); border: 1px solid rgba(255,255,255,0.1); }
      .tag-theme { background: rgba(120,100,200,0.15); color: #A89FE0; border: 1px solid rgba(120,100,200,0.25); }
      .tag-default { background: rgba(255,255,255,0.07); color: var(--muted); border: 1px solid rgba(255,255,255,0.1); }
    `}</style>
  </span>;
}

/* ─── Section block ─────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="section">
      <h3 className="section-title">{title}</h3>
      <div className="section-body">{children}</div>
      <style jsx>{`
        .section { margin-bottom: 32px; }
        .section-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }
        .section-body { color: var(--white); }
      `}</style>
    </div>
  );
}

/* ─── Contact item ──────────────────────────────────── */
function ContactItem({ href, icon, label, value }) {
  const Tag = href ? 'a' : 'div';
  return (
    <Tag href={href} className="contact-item" target={href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
      <span className="ci-icon">{icon}</span>
      <span className="ci-text">
        <span className="ci-label">{label}</span>
        <span className="ci-value">{value}</span>
      </span>
      <style jsx>{`
        .contact-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          transition: all 0.2s;
          text-decoration: none; color: inherit;
        }
        a.contact-item:hover { border-color: var(--cyan); }
        .ci-icon { font-size: 20px; flex-shrink: 0; }
        .ci-text { display: flex; flex-direction: column; gap: 1px; }
        .ci-label { font-size: 11px; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }
        .ci-value { font-size: 14px; color: var(--white); font-weight: 500; }
      `}</style>
    </Tag>
  );
}

/* ─── Guide Profile Page ────────────────────────────── */
export default function GuidePage({ guide, notFound }) {
  if (notFound || !guide) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 48, marginBottom: 16 }}>Guide introuvable</h1>
        <Link href="/" style={{ color: 'var(--cyan)' }}>← Retour à l&apos;annuaire</Link>
      </div>
    );
  }

  const initials = `${guide.prenom?.[0] || ''}${guide.nom?.[0] || ''}`.toUpperCase();
  const hasContact = guide.email || guide.telephone || guide.siteWeb;
  const hasTags = guide.typesVisites.length || guide.musees.length || guide.thematiques.length || guide.publicCible.length;

  return (
    <>
      <Head>
        <title>{guide.nomComplet} – Guide Grenat Auvergne-Rhône-Alpes</title>
        <meta name="description" content={guide.biographie?.slice(0, 160) || `Fiche guide de ${guide.nomComplet}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="container">
          <Link href="/" className="nav-back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Retour à l&apos;annuaire
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="hero">
        <div className="container">
          <div className="hero-inner">
            {/* Photo */}
            <div className="hero-photo-wrap">
              {guide.photo
                ? <img src={guide.photo} alt={guide.nomComplet} className="hero-photo" />
                : <div className="hero-photo-placeholder">{initials}</div>
              }
            </div>

            {/* Identity */}
            <div className="hero-identity">
              <div className="hero-eyebrow">Guide-conférencier·e</div>
              <h1 className="hero-name">
                {guide.prenom}<br />
                <span className="hero-nom">{guide.nom}</span>
              </h1>
              {guide.langues.length > 0 && (
                <div className="hero-langs">
                  {guide.langues.map(l => <Tag key={l} variant="lang">{l}</Tag>)}
                </div>
              )}
              {(guide.departements.length > 0 || guide.villes.length > 0) && (
                <div className="hero-location">
                  <span className="loc-icon">📍</span>
                  <span>
                    {[...guide.departements, ...guide.villes].join(' · ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <main className="body">
        <div className="container">
          <div className="layout">

            {/* ── LEFT COLUMN ── */}
            <div className="col-main">
              {/* Biographie */}
              {guide.biographie && (
                <Section title="Qui suis-je ?">
                  <div className="bio-text">{guide.biographie}</div>
                </Section>
              )}

              {/* Le + de ce guide */}
              {guide.lePlus && (
                <Section title="Le + de ce guide">
                  <div className="le-plus">{guide.lePlus}</div>
                </Section>
              )}

              {/* Domaines */}
              {hasTags > 0 && (
                <Section title="Domaines d'expertise">
                  <div className="tags-grid">
                    {guide.typesVisites.length > 0 && (
                      <div className="tags-group">
                        <p className="tags-group-label">Types de visites</p>
                        <div className="tags-row">
                          {guide.typesVisites.map(t => <Tag key={t} variant="theme">{t}</Tag>)}
                        </div>
                      </div>
                    )}
                    {guide.thematiques.length > 0 && (
                      <div className="tags-group">
                        <p className="tags-group-label">Thématiques</p>
                        <div className="tags-row">
                          {guide.thematiques.map(t => <Tag key={t} variant="theme">{t}</Tag>)}
                        </div>
                      </div>
                    )}
                    {guide.musees.length > 0 && (
                      <div className="tags-group">
                        <p className="tags-group-label">Musées & sites</p>
                        <div className="tags-row">
                          {guide.musees.map(m => <Tag key={m}>{m}</Tag>)}
                        </div>
                      </div>
                    )}
                    {guide.publicCible.length > 0 && (
                      <div className="tags-group">
                        <p className="tags-group-label">Publics</p>
                        <div className="tags-row">
                          {guide.publicCible.map(p => <Tag key={p}>{p}</Tag>)}
                        </div>
                      </div>
                    )}
                  </div>
                </Section>
              )}
            </div>

            {/* ── RIGHT COLUMN (sidebar) ── */}
            <aside className="col-aside">
              {/* Contact */}
              {hasContact && (
                <Section title="Contact">
                  <div className="contact-list">
                    {guide.email && (
                      <ContactItem
                        href={`mailto:${guide.email}`}
                        icon="✉️" label="Email" value={guide.email}
                      />
                    )}
                    {guide.telephone && (
                      <ContactItem
                        href={`tel:${guide.telephone}`}
                        icon="📞" label="Téléphone" value={guide.telephone}
                      />
                    )}
                    {guide.siteWeb && (
                      <ContactItem
                        href={guide.siteWeb.startsWith('http') ? guide.siteWeb : `https://${guide.siteWeb}`}
                        icon="🌐" label="Site web" value={guide.siteWeb.replace(/^https?:\/\//, '')}
                      />
                    )}
                  </div>
                </Section>
              )}

              {/* Zone d'intervention */}
              {(guide.departements.length > 0 || guide.villes.length > 0) && (
                <Section title="Zone d'intervention">
                  {guide.departements.length > 0 && (
                    <>
                      <p className="aside-sublabel">Départements</p>
                      <div className="tags-row" style={{marginBottom: 12}}>
                        {guide.departements.map(d => <Tag key={d} variant="dept">{d}</Tag>)}
                      </div>
                    </>
                  )}
                  {guide.villes.length > 0 && (
                    <>
                      <p className="aside-sublabel">Villes & sites</p>
                      <div className="tags-row">
                        {guide.villes.map(v => <Tag key={v} variant="ville">{v}</Tag>)}
                      </div>
                    </>
                  )}
                </Section>
              )}
            </aside>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <Link href="/" className="footer-link">← Retour à l&apos;annuaire</Link>
          <span style={{color:'var(--muted)'}}> · </span>
          <a href="https://cuddly-deliberate-838847.framer.app/" className="footer-link">Site Grenat</a>
        </div>
      </footer>

      {/* ── STYLES ── */}
      <style jsx>{`
        /* Nav */
        .nav {
          background: var(--bg2);
          border-bottom: 1px solid var(--border);
          padding: 14px 0;
        }
        .nav-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: var(--muted); font-size: 13px; font-weight: 500;
          letter-spacing: 0.06em; transition: color 0.2s;
        }
        .nav-back:hover { color: var(--cyan); }

        /* Hero */
        .hero {
          background: linear-gradient(180deg, var(--bg2) 0%, var(--bg) 100%);
          border-bottom: 1px solid var(--border);
          padding: 48px 0 52px;
        }
        .hero-inner {
          display: flex; gap: 36px; align-items: flex-start;
          flex-wrap: wrap;
        }
        .hero-photo-wrap { flex-shrink: 0; }
        .hero-photo {
          width: 140px; height: 140px;
          border-radius: 50%; object-fit: cover;
          border: 3px solid var(--border);
        }
        .hero-photo-placeholder {
          width: 140px; height: 140px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--surface2), #2A2860);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 52px; font-weight: 700;
          color: var(--cyan);
          border: 3px solid var(--border);
        }
        .hero-identity { flex: 1; min-width: 200px; }
        .hero-eyebrow {
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--magenta); margin-bottom: 8px;
        }
        .hero-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(40px, 7vw, 72px);
          font-weight: 600; line-height: 0.9;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .hero-nom { font-weight: 800; color: var(--cyan); }
        .hero-langs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .hero-location {
          display: flex; align-items: center; gap: 8px;
          color: var(--muted); font-size: 15px;
        }
        .loc-icon { font-size: 16px; }

        /* Body */
        .body { padding: 48px 0 80px; }
        .layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 48px;
          align-items: start;
        }

        /* Bio */
        .bio-text {
          font-size: 15px; line-height: 1.75;
          color: #C8C7E8;
          white-space: pre-line;
        }
        .le-plus {
          font-size: 15px; line-height: 1.75;
          color: #C8C7E8; white-space: pre-line;
          padding: 16px 20px;
          background: var(--cyan-dim);
          border-left: 3px solid var(--cyan);
          border-radius: 0 6px 6px 0;
        }

        /* Tags */
        .tags-grid { display: flex; flex-direction: column; gap: 16px; }
        .tags-group {}
        .tags-group-label {
          font-size: 12px; color: var(--muted); font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px;
        }
        .tags-row { display: flex; flex-wrap: wrap; gap: 6px; }

        /* Contact */
        .contact-list { display: flex; flex-direction: column; gap: 8px; }
        .aside-sublabel {
          font-size: 11px; color: var(--muted); font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;
        }

        /* Footer */
        .footer {
          background: var(--bg2);
          border-top: 1px solid var(--border);
          padding: 20px 0;
          font-size: 13px;
        }
        .footer-link { color: var(--muted); transition: color 0.2s; }
        .footer-link:hover { color: var(--cyan); }

        @media (max-width: 768px) {
          .layout { grid-template-columns: 1fr; }
          .col-aside { order: -1; }
          .hero-photo, .hero-photo-placeholder { width: 100px; height: 100px; }
          .hero-name { font-size: 40px; }
        }
      `}</style>
    </>
  );
}

/* ── Static Paths ── */
export async function getStaticPaths() {
  try {
    const guides = await fetchAllGuides();
    const paths = guides.map(g => ({ params: { slug: g.slug } }));
    return { paths, fallback: 'blocking' };
  } catch {
    return { paths: [], fallback: 'blocking' };
  }
}

/* ── Static Props ── */
export async function getStaticProps({ params }) {
  try {
    const guides = await fetchAllGuides();
    const guide = guides.find(g => g.slug === params.slug) || null;
    if (!guide) return { notFound: true, revalidate: 60 };
    return { props: { guide }, revalidate: 300 };
  } catch (error) {
    return { props: { guide: null, error: error.message }, revalidate: 60 };
  }
}
