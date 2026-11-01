// Encart « Prochaines visites » (les 2 prochaines) pour la page d'accueil Framer.
import { CarteVisite } from '../../components/Visites';
import { fetchAllGuides } from '../../lib/notion';
import { fetchVisites } from '../../lib/visites';

const AGENDA = 'https://annuaire.lesguidesgrenat.fr/agenda';

export default function Prochaines({ visites }) {
  return (
    <div className="encart">
      {visites.length ? (
        <div className="grille">
          {visites.map((v) => <CarteVisite key={v.id} v={v} compact externe />)}
        </div>
      ) : (
        <p className="vide">De nouvelles visites arrivent bientôt.</p>
      )}
      <a href={AGENDA} target="_top" className="tout">Voir tout l&apos;agenda →</a>
      <style jsx>{`
        .encart { padding: 8px; }
        .grille { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
        .vide { color: var(--muted); text-align: center; padding: 24px 0; }
        .tout { display: inline-block; margin-top: 16px; color: var(--cyan); font-weight: 500; }
        .tout:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const guides = await fetchAllGuides();
    const visites = (await fetchVisites(guides)).slice(0, 2);
    return { props: { visites }, revalidate: 60 };
  } catch (e) {
    console.error('Prochaines visites :', e);
    return { props: { visites: [] }, revalidate: 60 };
  }
}
