import Head from 'next/head';
import Agenda from '../components/Agenda';
import { fetchAllGuides } from '../lib/notion';
import { fetchVisites } from '../lib/visites';

export default function AgendaPage({ visites }) {
  return (
    <>
      <Head>
        <title>Agenda des visites — Les guides Grenat</title>
        <meta name="description" content="Les prochaines visites guidées ouvertes au public proposées par les guides-conférenciers Grenat en Auvergne-Rhône-Alpes." />
      </Head>
      <header className="hero">
        <div className="container">
          <p className="eyebrow">Agenda</p>
          <h1>Prochaines visites</h1>
          <p className="intro">
            Les visites ouvertes au public proposées par les guides-conférenciers Grenat.
            Réservez directement auprès du guide.
          </p>
        </div>
      </header>
      <main className="container corps">
        <Agenda visites={visites} />
      </main>
      <style jsx>{`
        .hero { background: linear-gradient(180deg, var(--bg2) 0%, var(--bg) 100%); border-bottom: 1px solid var(--border); padding: 48px 0 40px; }
        .eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--magenta); margin-bottom: 8px; }
        h1 { font-family: 'Fugaz One', cursive; font-weight: 400; font-size: clamp(36px, 6vw, 60px); line-height: 1; text-transform: uppercase; margin-bottom: 16px; }
        .intro { color: #C8C7E8; max-width: 640px; }
        .corps { padding-top: 40px; padding-bottom: 40px; max-width: 960px; }
      `}</style>
    </>
  );
}

export async function getStaticProps() {
  try {
    const guides = await fetchAllGuides();
    const visites = await fetchVisites(guides);
    return { props: { visites }, revalidate: 300 };
  } catch (e) {
    console.error('Agenda :', e);
    return { props: { visites: [] }, revalidate: 60 };
  }
}
