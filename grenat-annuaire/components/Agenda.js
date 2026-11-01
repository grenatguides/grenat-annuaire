// Page Agenda : liste des visites à venir avec filtres (ville, département, mois, langue).
// Utilisée par /agenda (avec le menu du site) et /embed/agenda (sans menu).
import { useMemo, useState } from 'react';
import { ListeVisites } from './Visites';

const unique = (arr) => [...new Set(arr.filter(Boolean))];
const trier = (arr) => unique(arr).sort((a, b) => a.localeCompare(b, 'fr'));

function Filtre({ label, valeur, options, tous, onChange }) {
  return (
    <label>
      <span>{label}</span>
      <select value={valeur} onChange={(e) => onChange(e.target.value)}>
        <option value="">{tous}</option>
        {options.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
      </select>
      <style jsx>{`
        label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: var(--muted);
          text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; flex: 1 1 170px; }
        select {
          width: 100%; padding: 10px 12px; border-radius: 8px;
          background: var(--surface); color: var(--white); border: 1px solid var(--border);
          font: inherit; font-size: 15px; text-transform: none; letter-spacing: 0;
        }
      `}</style>
    </label>
  );
}

export default function Agenda({ visites, externe = false }) {
  const [f, setF] = useState({ ville: '', departement: '', mois: '', langue: '' });
  const maj = (cle) => (valeur) => setF((x) => ({ ...x, [cle]: valeur }));

  const options = useMemo(() => ({
    ville: trier(visites.map((v) => v.ville)),
    departement: trier(visites.map((v) => v.departement)),
    mois: unique(visites.map((v) => v.mois)), // déjà dans l'ordre chronologique
    langue: trier(visites.flatMap((v) => v.langues)),
  }), [visites]);

  const liste = visites.filter((v) =>
    (!f.ville || v.ville === f.ville) &&
    (!f.departement || v.departement === f.departement) &&
    (!f.mois || v.mois === f.mois) &&
    (!f.langue || v.langues.includes(f.langue))
  );
  const actif = Object.values(f).some(Boolean);

  return (
    <div className="agenda">
      {visites.length > 0 && (
        <div className="filtres">
          <Filtre label="Ville" valeur={f.ville} options={options.ville} tous="Toutes" onChange={maj('ville')} />
          <Filtre label="Département" valeur={f.departement} options={options.departement} tous="Tous" onChange={maj('departement')} />
          <Filtre label="Mois" valeur={f.mois} options={options.mois} tous="Tous" onChange={maj('mois')} />
          <Filtre label="Langue" valeur={f.langue} options={options.langue} tous="Toutes" onChange={maj('langue')} />
          <div className="bilan">
            <span>{liste.length} visite{liste.length > 1 ? 's' : ''}</span>
            {actif && (
              <button type="button" onClick={() => setF({ ville: '', departement: '', mois: '', langue: '' })}>
                Effacer les filtres
              </button>
            )}
          </div>
        </div>
      )}
      {liste.length
        ? <ListeVisites visites={liste} externe={externe} />
        : <p className="vide">{actif ? 'Aucune visite ne correspond à ces critères.' : 'Aucune visite programmée pour le moment. Revenez bientôt !'}</p>}
      <style jsx>{`
        .filtres { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px; margin-bottom: 32px; }
        .bilan { display: flex; align-items: center; gap: 14px; font-size: 14px; color: var(--muted); padding-bottom: 10px; }
        button { background: none; border: 0; color: var(--cyan); font: inherit; cursor: pointer; padding: 0; }
        button:hover { text-decoration: underline; }
        .vide { color: var(--muted); padding: 40px 0; text-align: center; }
      `}</style>
    </div>
  );
}
