// Lien personnel pour proposer une visite : /proposer-une-visite/<id de la fiche Notion>
// Vérifie la fiche annuaire du guide et ouvre le formulaire Tally rattaché à cette fiche.
import { TALLY_VISITE } from '../../lib/visites';

const DATABASE_ID = '2eceef96524a80fe82d4cb73e9ba6ed0';
const normId = (s) => String(s || '').replace(/-/g, '').toLowerCase();

export async function getServerSideProps({ params, res }) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  const id = normId(params.id);
  if (!/^[0-9a-f]{32}$/.test(id)) return { props: { error: true } };

  const r = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    headers: { Authorization: `Bearer ${process.env.NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' },
  });
  if (!r.ok) return { props: { error: true } };
  const page = await r.json();
  if (page.archived || normId(page.parent?.database_id) !== DATABASE_ID) return { props: { error: true } };

  const p = page.properties;
  const qs = new URLSearchParams({
    guide_id: id,
    prenom: (p['Prénom']?.rich_text || []).map((t) => t.plain_text).join(''),
    nom: (p['Nom']?.title || []).map((t) => t.plain_text).join(''),
  });
  return { redirect: { destination: `${TALLY_VISITE}?${qs}`, permanent: false } };
}

export default function LienInvalide() {
  return (
    <main className="container" style={{ padding: '4rem 1rem', maxWidth: 640 }}>
      <h1>Lien non valide</h1>
      <p>
        Ce lien pour proposer une visite n&apos;est pas reconnu. Vérifiez que vous avez copié le lien complet
        reçu par e-mail, ou écrivez à <a href="mailto:contact@lesguidesgrenat.fr">contact@lesguidesgrenat.fr</a>.
      </p>
    </main>
  );
}
