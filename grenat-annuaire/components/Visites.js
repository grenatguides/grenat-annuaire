// Affichage des visites de l'agenda (page Agenda, fiche guide, encart Framer).
const ANNUAIRE = 'https://annuaire.lesguidesgrenat.fr';

function prixLabel(prix) {
  if (prix === null || prix === undefined) return '';
  if (prix === 0) return 'Gratuit';
  return `${String(prix).replace('.', ',')} €`;
}

// Une carte de visite. `compact` : version courte pour l'encart d'accueil.
// `externe` : liens ouverts dans la page parente (encart intégré dans Framer).
export function CarteVisite({ v, compact = false, externe = false, avecGuide = true }) {
  const cible = externe ? { target: '_top' } : {};
  const ficheGuide = externe ? `${ANNUAIRE}/${v.guide.slug}` : `/${v.guide.slug}`;
  const prix = prixLabel(v.prix);
  const [jour, ...resteDate] = v.dateCourte.split(' ');

  return (
    <article className={`visite${compact ? ' visite-compact' : ''}`}>
      <div className="visite-date" aria-hidden="true">
        <span className="vd-jour">{jour}</span>
        <span className="vd-num">{resteDate[0]}</span>
        <span className="vd-mois">{resteDate.slice(1).join(' ')}</span>
      </div>
      {v.photo && !compact && <img src={v.photo} alt="" className="visite-photo" loading="lazy" />}
      <div className="visite-corps">
        <h3 className="visite-titre">{v.titre}</h3>
        <p className="visite-quand">
          {v.dateLabel.charAt(0).toUpperCase() + v.dateLabel.slice(1)}
          {v.horaire && <> · {v.horaire}</>}
        </p>
        {v.lieu && <p className="visite-lieu">📍 Rendez-vous : {v.lieu}</p>}
        {!compact && v.description && <p className="visite-desc">{v.description}</p>}
        <div className="visite-tags">
          {v.ville && <span className="vt vt-ville">📍 {v.ville}</span>}
          {prix && <span className="vt vt-prix">{prix}</span>}
          {v.public && <span className="vt">{v.public}</span>}
          {v.langues.map((l) => <span key={l} className="vt vt-lang">{l}</span>)}
        </div>
        <div className="visite-pied">
          {avecGuide && (
            <a href={ficheGuide} className="visite-guide" {...cible}>
              {v.guide.photo
                ? <img src={v.guide.photo} alt="" className="vg-photo" />
                : <span className="vg-photo vg-init">{v.guide.nom.charAt(0)}</span>}
              <span>avec <strong>{v.guide.nom}</strong></span>
            </a>
          )}
          {v.lien
            ? <a href={v.lien} className="visite-btn" target="_blank" rel="noopener noreferrer">Réserver</a>
            : <a href={ficheGuide} className="visite-btn visite-btn-sec" {...cible}>Contacter le guide</a>}
        </div>
      </div>
      <style jsx>{`
        .visite {
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 18px;
          padding: 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          align-items: start;
        }
        .visite:has(.visite-photo) { grid-template-columns: 72px 180px 1fr; }
        .visite-date {
          display: flex; flex-direction: column; align-items: center;
          padding: 10px 4px; border-radius: 10px;
          background: var(--magenta-dim); border: 1px solid rgba(183,4,64,0.35);
          line-height: 1.1; text-align: center;
        }
        .vd-jour, .vd-mois { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--pink); }
        .vd-num { font-family: 'Fugaz One', cursive; font-size: 28px; color: var(--white); margin: 2px 0; }
        .visite-photo { width: 180px; height: 130px; object-fit: cover; border-radius: 8px; }
        .visite-corps { min-width: 0; }
        .visite-titre { font-size: 19px; font-weight: 700; line-height: 1.3; margin-bottom: 4px; }
        .visite-quand { font-size: 14px; color: var(--cyan); margin-bottom: 2px; }
        .visite-lieu { font-size: 14px; color: var(--muted); margin-bottom: 8px; }
        .visite-desc {
          font-size: 14.5px; line-height: 1.65; color: #C8C7E8; margin-bottom: 10px;
          white-space: pre-line;
          display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
        }
        .visite-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .vt {
          font-size: 12px; font-weight: 600; padding: 3px 9px; border-radius: 5px;
          background: rgba(255,255,255,0.07); color: var(--muted); border: 1px solid rgba(255,255,255,0.1);
        }
        .vt-prix { background: rgba(142,224,123,0.12); color: var(--green); border-color: rgba(142,224,123,0.25); }
        .vt-ville { background: var(--cyan-dim); color: var(--cyan); border-color: var(--cyan-border); }
        .vt-lang { background: var(--magenta-dim); color: var(--pink); border-color: rgba(204,0,96,0.25); }
        .visite-pied { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
        .visite-guide { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: var(--muted); }
        .visite-guide:hover strong { color: var(--cyan); }
        .visite-guide strong { color: var(--white); font-weight: 600; transition: color 0.15s; }
        .vg-photo { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
        .vg-init {
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--surface2); color: var(--cyan); font-weight: 700;
        }
        .visite-btn {
          background: var(--magenta); color: var(--white);
          font-size: 14px; font-weight: 500; padding: 8px 18px; border-radius: 999px;
          transition: filter 0.15s; white-space: nowrap;
        }
        .visite-btn:hover { filter: brightness(1.15); }
        .visite-btn-sec { background: transparent; border: 1px solid var(--cyan-border); color: var(--cyan); }
        .visite-compact { grid-template-columns: 64px 1fr; padding: 16px; height: 100%; }
        .visite-compact .visite-titre { font-size: 17px; }
        @media (max-width: 720px) {
          .visite, .visite:has(.visite-photo) { grid-template-columns: 60px 1fr; gap: 14px; padding: 16px; }
          .visite-photo { grid-column: 1 / -1; grid-row: 1; width: 100%; height: 160px; }
        }
      `}</style>
    </article>
  );
}

// Liste groupée par mois
export function ListeVisites({ visites, externe = false, avecGuide = true }) {
  const groupes = [];
  for (const v of visites) {
    const g = groupes[groupes.length - 1];
    if (g && g.mois === v.mois) g.items.push(v);
    else groupes.push({ mois: v.mois, items: [v] });
  }
  return (
    <div className="liste">
      {groupes.map((g) => (
        <section key={g.mois} className="mois">
          <h2 className="mois-titre">{g.mois}</h2>
          <div className="mois-items">
            {g.items.map((v) => <CarteVisite key={v.id} v={v} externe={externe} avecGuide={avecGuide} />)}
          </div>
        </section>
      ))}
      <style jsx>{`
        .liste { display: flex; flex-direction: column; gap: 36px; }
        .mois-titre {
          font-family: 'Fugaz One', cursive; font-size: 15px; font-weight: 400;
          letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted);
          padding-bottom: 8px; margin-bottom: 14px; border-bottom: 1px solid var(--border);
        }
        .mois-items { display: flex; flex-direction: column; gap: 14px; }
      `}</style>
    </div>
  );
}
