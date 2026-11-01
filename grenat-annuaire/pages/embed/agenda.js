// Agenda complet sans le menu du site, pour l'intégrer dans une page Framer.
import Agenda from '../../components/Agenda';
import { fetchAllGuides } from '../../lib/notion';
import { fetchVisites } from '../../lib/visites';

export default function AgendaEmbed({ visites }) {
  return <div className="embed"><Agenda visites={visites} externe /><style jsx>{`.embed { padding: 8px; }`}</style></div>;
}

export async function getStaticProps() {
  try {
    const guides = await fetchAllGuides();
    return { props: { visites: await fetchVisites(guides) }, revalidate: 300 };
  } catch (e) {
    console.error('Agenda :', e);
    return { props: { visites: [] }, revalidate: 60 };
  }
}
