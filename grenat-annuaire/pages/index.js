import { useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { fetchAllGuides } from '../lib/notion';

/* ─── Filter configuration ─────────────────────────── */
const FILTER_GROUPS = [
  { key: 'langues',      label: 'Langue',          icon: '🌍' },
  { key: 'departements', label: 'Département',      icon: '📍' },
  { key: 'typesVisites', label: 'Type de visite',   icon: '🗺' },
  { key: 'thematiques',  label: 'Thématique',       icon: '🏛' },
  { key: 'publicCible',  label: 'Public',            icon: '👥' },
];

/* ─── Guide Card ─────────────────────────────────────── */
function GuideCard({ guide }) {
  const initials = `${guide.prenom?.[0] || ''}${guide.nom?.[0] || ''}`.toUpperCase();
  return (
    <Link href={`/${guide.slug}`} className="card">
      <div className="card-photo-wrap">
        {guide.photo
          ? <img src={guide.photo} alt={guide.nomComplet} className="card-photo" />
          : <div className="card-photo-placeholder">{initials}</div>
        }
      </div>
      <div className="card-body">
        <h2 className="card-name">
          {guide.prenom} <span className="card-nom">{guide.nom}</span>
        </h2>
        {guide.langues.length > 0 && (
          <div className="card-tags">
            {guide.langues.map(l => (
              <span key={l} className="tag tag-lang">{l}</span>
            ))}
          </div>
        )}
        {(guide.departements.length > 0 || guide.villes.length > 0) && (
          <div className="card-tags">
            {guide.departements.map(d => (
              <span key={d} className="tag tag-dept">{d}</span>
            ))}
            {guide.villes.slice(0, 2).map(v => (
              <span key={v} className="tag tag-ville">{v}</span>
            ))}
          </div>
        )}
        {guide.thematiques.length > 0 && (
          <div className="card-tags" style={{marginTop: 4}}>
            {guide.thematiques.slice(0, 2).map(t => (
              <span key={t} className="tag tag-theme">{t}</span>
            ))}
          </div>
        )}
        <div className="card-cta">Voir la fiche <span className="arrow">→</span></div>
      </div>
      <style jsx>{`
        .card {
          display: flex;
          gap: 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          transition: border-color 0.2s, transform 0.2s, background 0.2s;
          cursor: pointer;
        }
        .card:hover {
          border-color: var(--cyan);
          transform: translateY(-3px);
          background: var(--surface2);
        }
        .card-photo-wrap { flex-shrink: 0; }
        .card-photo {
          width: 72px; height: 72px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border);
          transition: border-color 0.2s;
        }
        .card:hover .card-photo { border-color: var(--cyan); }
        .card-photo-placeholder {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--surface2), #2A2860);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fugaz One', cursive;
          font-size: 26px; font-weight: 700;
          color: var(--cyan);
          border: 2px solid var(--border);
        }
        .card-body { flex: 1; min-width: 0; }
        .card-name {
          font-family: 'Fugaz One', cursive;
          font-size: 21px; font-weight: 600;
          line-height: 1.1; margin-bottom: 10px;
          letter-spacing: 0.02em;
        }
        .card-nom { font-weight: 800; }
        .card-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 5px; }
        .tag {
          font-size: 11px; font-weight: 600;
          padding: 3px 8px; border-radius: 4px;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .tag-lang {
          background: var(--magenta-dim);
          color: var(--pink);
          border: 1px solid rgba(204,0,96,0.25);
        }
        .tag-dept {
          background: var(--cyan-dim);
          color: var(--cyan);
          border: 1px solid var(--cyan-border);
        }
        .tag-ville {
          background: rgba(255,255,255,0.06);
          color: var(--muted);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .tag-theme {
          background: rgba(142,224,123,0.12);
          color: var(--green);
          border: 1px solid rgba(142,224,123,0.25);
        }
        .card-cta {
          margin-top: 12px;
          font-size: 13px; font-weight: 600;
          color: var(--muted);
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .card:hover .card-cta { color: var(--cyan); }
        .arrow { transition: transform 0.2s; display: inline-block; }
        .card:hover .arrow { transform: translateX(4px); }
      `}</style>
    </Link>
  );
}

/* ─── Filter Dropdown ────────────────────────────────── */
function FilterDropdown({ label, icon, options, selected, onToggle, onClose }) {
  if (options.length === 0) return null;
  const isActive = selected.length > 0;
  return (
    <div className="fd-wrap">
      <button
        className={`fd-btn ${isActive ? 'active' : ''}`}
        onClick={onClose}
      >
        <span>{icon} {label}</span>
        {isActive && <span className="fd-count">{selected.length}</span>}
        <span className="fd-arrow">▾</span>
      </button>
      <div className="fd-menu">
        {options.map(val => (
          <button
            key={val}
            className={`fd-opt ${selected.includes(val) ? 'sel' : ''}`}
            onClick={() => onToggle(val)}
          >
            <span className="fd-check">{selected.includes(val) ? '✓' : ''}</span>
            {val}
          </button>
        ))}
      </div>
      <style jsx>{`
        .fd-wrap { position: relative; }
        .fd-btn {
          display: flex; align-items: center; gap: 6px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 7px;
          color: var(--white);
          padding: 8px 13px;
          font-family: 'Roboto', sans-serif;
          font-size: 14px; font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .fd-btn:hover { border-color: var(--cyan); color: var(--cyan); }
        .fd-btn.active {
          border-color: var(--cyan);
          color: var(--cyan);
          background: var(--cyan-dim);
        }
        .fd-count {
          background: var(--cyan); color: var(--bg);
          border-radius: 99px; font-size: 11px;
          font-weight: 700; padding: 1px 6px;
        }
        .fd-arrow { font-size: 11px; opacity: 0.5; }
        .fd-menu {
          display: none;
          position: absolute; top: calc(100% + 4px); left: 0;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 8px;
          min-width: 210px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 300;
          padding: 6px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .fd-wrap:focus-within .fd-menu,
        .fd-wrap:hover .fd-menu { display: block; }
        .fd-opt {
          display: flex; align-items: center; gap: 8px;
          width: 100%; background: none; border: none;
          color: var(--white);
          padding: 8px 10px; text-align: left;
          font-family: 'Roboto', sans-serif; font-size: 14px;
          cursor: pointer; border-radius: 5px;
          transition: background 0.15s;
        }
        .fd-opt:hover { background: rgba(255,255,255,0.06); }
        .fd-opt.sel { color: var(--cyan); }
        .fd-check { width: 16px; color: var(--cyan); font-size: 12px; }
      `}</style>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function Annuaire({ guides, error }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    langues: [], departements: [], typesVisites: [], thematiques: [], publicCible: [],
  });
  const [openFilter, setOpenFilter] = useState(null);

  /* Available filter options built from actual data */
  const options = useMemo(() => {
    const unique = (arr) => [...new Set(arr.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
    return {
      langues:      unique(guides.flatMap(g => g.langues)),
      departements: unique(guides.flatMap(g => g.departements)),
      typesVisites: unique(guides.flatMap(g => g.typesVisites)),
      thematiques:  unique(guides.flatMap(g => g.thematiques)),
      publicCible:  unique(guides.flatMap(g => g.publicCible)),
    };
  }, [guides]);

  const toggleFilter = useCallback((key, val) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter(v => v !== val) : [...prev[key], val],
    }));
  }, []);

  const removeFilter = useCallback((key, val) => {
    setFilters(prev => ({ ...prev, [key]: prev[key].filter(v => v !== val) }));
  }, []);

  const clearAll = useCallback(() => {
    setSearch('');
    setFilters({ langues:[], departements:[], typesVisites:[], thematiques:[], publicCible:[] });
  }, []);

  const totalActive = Object.values(filters).flat().length;

  /* Filtered guides */
  const filtered = useMemo(() => {
    return guides.filter(g => {
      if (search) {
        const q = search.toLowerCase();
        const name = `${g.prenom} ${g.nom}`.toLowerCase();
        const locs = g.villes.join(' ').toLowerCase();
        if (!name.includes(q) && !locs.includes(q)) return false;
      }
      if (filters.langues.length      && !filters.langues.some(v => g.langues.includes(v)))           return false;
      if (filters.departements.length && !filters.departements.some(v => g.departements.includes(v))) return false;
      if (filters.typesVisites.length && !filters.typesVisites.some(v => g.typesVisites.includes(v))) return false;
      if (filters.thematiques.length  && !filters.thematiques.some(v => g.thematiques.includes(v)))   return false;
      if (filters.publicCible.length  && !filters.publicCible.some(v => g.publicCible.includes(v)))   return false;
      return true;
    });
  }, [guides, search, filters]);

  return (
    <>
      <Head>
        <title>Annuaire des guides – Grenat Auvergne-Rhône-Alpes</title>
        <meta name="description" content="Trouvez votre guide-conférencier en Auvergne-Rhône-Alpes. Filtrez par langue, département, thématique et plus." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ── HEADER ── */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-text">
              <div className="header-eyebrow">Annuaire général des guides</div>
              <h1 className="header-title">
                TROUVEZ LE GUIDE<br />
                <span className="header-accent">QU'IL VOUS FAUT !</span>
              </h1>
              <p className="header-desc">
                Notre annuaire de guides-conférenciers GRENAT vous permet de prendre contact directement avec eux en fonction des secteurs et des langues étrangères que vous recherchez.
              </p>
              <p className="header-desc header-disclaimer">
                La responsabilité de l'association ne saurait être engagée dans les relations nouées entre les professionnels du tourisme / clients et les guides-conférenciers adhérents de Grenat.
              </p>
            </div>
            <div className="header-badge">
              <span className="badge-num">{guides.length}</span>
              <span className="badge-label">guides<br />répertoriés</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── FILTERS BAR ── */}
      <div className="filters-bar">
        <div className="container">
          <div className="filters-row">
            {/* Search */}
            <div className="search-wrap">
              <svg className="search-icon" viewBox="0 0 20 20" fill="none">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Nom, ville…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')}>×</button>
              )}
            </div>

            {/* Filter dropdowns */}
            <div className="filter-row">
              {FILTER_GROUPS.map(({ key, label, icon }) => (
                <FilterDropdown
                  key={key}
                  label={label}
                  icon={icon}
                  options={options[key]}
                  selected={filters[key]}
                  onToggle={(val) => toggleFilter(key, val)}
                  onClose={() => setOpenFilter(openFilter === key ? null : key)}
                />
              ))}
              {totalActive > 0 && (
                <button className="clear-all" onClick={clearAll}>
                  Tout effacer ({totalActive})
                </button>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {totalActive > 0 && (
            <div className="chips-row">
              {FILTER_GROUPS.flatMap(({ key }) =>
                filters[key].map(val => (
                  <span key={`${key}-${val}`} className="chip">
                    {val}
                    <button onClick={() => removeFilter(key, val)}>×</button>
                  </span>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── RESULTS ── */}
      <main className="main">
        <div className="container">
          <div className="results-header">
            <p className="results-count">
              <span className="results-num">{filtered.length}</span>
              {' '}guide{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
              {totalActive > 0 || search ? ` sur ${guides.length}` : ''}
            </p>
          </div>

          {error && (
            <div className="error-box">
              ⚠️ Impossible de charger les guides : {error}
            </div>
          )}

          {filtered.length === 0 && !error ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p className="empty-title">Aucun guide trouvé</p>
              <p className="empty-sub">Essayez de modifier vos filtres ou votre recherche.</p>
              <button className="btn-reset" onClick={clearAll}>Réinitialiser les filtres</button>
            </div>
          ) : (
            <div className="grid">
              {filtered.map(guide => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          )}
        </div>
      </main>


      {/* ── STYLES ── */}
      <style jsx>{`
        /* Header */
        .header {
          background: linear-gradient(180deg, var(--bg2) 0%, var(--bg) 100%);
          border-bottom: 1px solid var(--border);
          padding: 48px 0 44px;
        }
        .header-content { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .header-eyebrow {
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--magenta); margin-bottom: 10px;
        }
        .header-title {
          font-family: 'Fugaz One', cursive;
          font-size: clamp(40px, 7vw, 72px);
          font-weight: 800; line-height: 0.88;
          letter-spacing: -0.01em; text-transform: uppercase;
        }
        .header-accent { color: var(--cyan); }
        .header-desc {
          margin-top: 14px;
          color: var(--muted); font-size: 15px; line-height: 1.6;
          max-width: 560px;
        }
        .header-disclaimer {
          font-size: 13px; margin-top: 10px;
          color: #4D4C70;
          font-style: italic;
        }
        .header-badge {
          display: flex; align-items: center; gap: 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px; padding: 16px 24px;
          flex-shrink: 0;
        }
        .badge-num {
          font-family: 'Fugaz One', cursive;
          font-size: 48px; font-weight: 800;
          color: var(--cyan); line-height: 1;
        }
        .badge-label {
          font-size: 13px; color: var(--muted);
          font-weight: 500; line-height: 1.4;
        }

        /* Filters bar */
        .filters-bar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(14,13,34,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          padding: 14px 0;
        }
        .filters-row { display: flex; flex-direction: column; gap: 10px; }
        .filter-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }

        .search-wrap {
          position: relative; display: flex; align-items: center;
        }
        .search-icon {
          position: absolute; left: 12px;
          width: 16px; height: 16px;
          color: var(--muted); pointer-events: none;
        }
        .search-input {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 7px;
          padding: 9px 36px 9px 38px;
          color: var(--white);
          font-family: 'Roboto', sans-serif; font-size: 14px;
          width: 280px; max-width: 100%;
          outline: none; transition: border-color 0.2s;
        }
        .search-input:focus { border-color: var(--cyan); }
        .search-input::placeholder { color: var(--muted); }
        .search-clear {
          position: absolute; right: 10px;
          background: none; border: none;
          color: var(--muted); cursor: pointer;
          font-size: 18px; line-height: 1;
          transition: color 0.15s;
        }
        .search-clear:hover { color: var(--white); }
        .clear-all {
          background: none; border: 1px solid var(--border);
          border-radius: 7px;
          color: var(--muted); font-family: 'Roboto', sans-serif;
          font-size: 13px; padding: 8px 13px;
          cursor: pointer; transition: all 0.2s;
        }
        .clear-all:hover { color: var(--pink); border-color: var(--magenta); }

        /* Chips */
        .chips-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .chip {
          display: flex; align-items: center; gap: 6px;
          background: var(--cyan-dim);
          border: 1px solid var(--cyan-border);
          border-radius: 99px;
          padding: 3px 10px 3px 12px;
          font-size: 12px; font-weight: 600;
          color: var(--cyan);
        }
        .chip button {
          background: none; border: none;
          color: var(--cyan); cursor: pointer;
          font-size: 15px; line-height: 1; opacity: 0.7;
          padding: 0; transition: opacity 0.15s;
        }
        .chip button:hover { opacity: 1; }

        /* Main */
        .main { padding: 24px 0 60px; min-height: 60vh; }
        .results-header { margin-bottom: 20px; }
        .results-count { font-size: 14px; color: var(--muted); }
        .results-num { color: var(--cyan); font-weight: 700; font-size: 18px; }

        /* Grid */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
          gap: 16px;
        }

        /* Error */
        .error-box {
          background: rgba(204,0,96,0.1);
          border: 1px solid rgba(204,0,96,0.3);
          border-radius: 8px; padding: 16px 20px;
          color: var(--pink); margin-bottom: 24px;
        }

        /* Empty */
        .empty-state {
          text-align: center; padding: 80px 0;
          color: var(--muted);
        }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-title { font-family: 'Fugaz One', cursive; font-size: 24px; font-weight: 700; color: var(--white); margin-bottom: 8px; }
        .empty-sub { font-size: 15px; margin-bottom: 24px; }
        .btn-reset {
          background: none; border: 1px solid var(--border);
          border-radius: 8px; color: var(--white);
          padding: 10px 22px;
          font-family: 'Roboto', sans-serif; font-size: 15px;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-reset:hover { border-color: var(--cyan); color: var(--cyan); }

        /* Footer */
        .footer {
          background: var(--bg2);
          border-top: 1px solid var(--border);
          padding: 20px 0;
          font-size: 13px; color: var(--muted);
        }
        .footer-link { color: var(--muted); transition: color 0.2s; }
        .footer-link:hover { color: var(--cyan); }

        /* Responsive */
        @media (max-width: 640px) {
          .grid { grid-template-columns: 1fr; }
          .header-badge { display: none; }
          .search-input { width: 100%; }
        }
      `}</style>
    </>
  );
}

/* ── Data Fetching ── */
export async function getStaticProps() {
  try {
    const guides = await fetchAllGuides();
    return { props: { guides }, revalidate: 300 }; // Refresh every 5 min
  } catch (error) {
    console.error('Error fetching guides:', error);
    return { props: { guides: [], error: error.message }, revalidate: 60 };
  }
}
