// Page Agenda : liste des visites à venir avec filtres (département, ville).
// Utilisée par /agenda (avec le menu du site) et /embed/agenda (sans menu).
import { useMemo, useState } from 'react';
import { ListeVisites } from './Visites';

export default function Agenda({ visites, externe = false }) {
  const [dep, setDep] = useState('');
  const [ville, setVille] = useState('');
  const unique = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
  const deps = useMemo(() => unique(visites.map((v) => v.departement)), [visites]);
  const villes = useMemo(
    () => unique(visites.filter((v) => !dep || v.departement === dep).map((v) => v.ville)),
    [visites, dep]
  );
  const liste = visites.filter((v) => (!dep || v.departement === dep) && (!ville || v.ville === ville));

  return (
    <div className="agenda">
      {visites.length > 0 && (deps.length > 1 || villes.length > 1) && (
        <div className="filtres">
          <label>
            <span>Département</span>
            <select value={dep} onChange={(e) => { setDep(e.target.value); setVille(''); }}>
              <option value="">Tous</option>
              {deps.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label>
            <span>Ville</span>
            <select value={ville} onChange={(e) => setVille(e.target.value)}>
              <option value="">Toutes</option>
              {villes.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <span className="compte">{liste.length} visite{liste.length > 1 ? 's' : ''}</span>
        </div>
      )}
      {liste.length
        ? <ListeVisites visites={liste} externe={externe} />
        : <p className="vide">Aucune visite programmée pour le moment. Revenez bientôt !</p>}
      <style jsx>{`
        .filtres { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px; margin-bottom: 32px; }
        label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: var(--muted);
          text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
        select {
          min-width: 200px; padding: 10px 12px; border-radius: 8px;
          background: var(--surface); color: var(--white); border: 1px solid var(--border);
          font: inherit; font-size: 15px; text-transform: none; letter-spacing: 0;
        }
        .compte { font-size: 14px; color: var(--muted); padding-bottom: 10px; }
        .vide { color: var(--muted); padding: 40px 0; text-align: center; }
      `}</style>
    </div>
  );
}
