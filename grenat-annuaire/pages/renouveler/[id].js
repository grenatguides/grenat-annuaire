// Lien personnel de réadhésion : /renouveler/<id de la fiche Notion>
// Lit la fiche annuaire du guide et redirige vers le formulaire Tally pré-rempli.
// Le lien est envoyé individuellement par e-mail (Brevo) ; l'identifiant Notion
// (32 caractères aléatoires) sert de clé : il n'est pas devinable.

import { lireBase } from '../../lib/notion';

const TALLY_FORM = 'https://tally.so/r/zxpZ4M';
const DATABASE_ID = '2eceef96524a80fe82d4cb73e9ba6ed0';

const SITUATION_RENOUVELLEMENT = "Je renouvelle mon adhésion (j'étais adhérent·e en 2026)";

// Libellés Notion -> libellés Tally quand ils diffèrent
const MUSEES_TALLY = {
  'Musée des Beaux-arts': 'Musée des Beaux-arts (Lyon)',
  'Musée Gallo-Romain (Saint Romain en Gal)': 'Musée Gallo-Romain (Saint-Romain-en-Gal)',
  'Musée Champollion (Vif Isère)': 'Musée Champollion (Vif)',
};

// "Coordonnées masquées" (Notion) -> cases "coordonnées affichées" (Tally)
const COORDS = [
  ['Téléphone', 'Mon téléphone'],
  ['E-mail', 'Mon e-mail'],
  ['Réseaux et site', 'Mes réseaux sociaux et site internet'],
];

const normId = (s) => String(s || '').replace(/-/g, '').toLowerCase();

// Informations internes (adresse, carte pro…) lues dans la fiche Adhérents liée.
// Elles ne sont jamais affichées sur le site : seulement pré-remplies dans le formulaire.
async function lireAdherent(page) {
  const lien = page.properties?.['Adhérent (interne)']?.relation?.[0]?.id;
  const token = process.env.NOTION_ADHESIONS_TOKEN;
  if (!lien || !token) return {};
  try {
    const r = await fetch(`https://api.notion.com/v1/pages/${normId(lien)}`, {
      headers: { Authorization: `Bearer ${token}`, 'Notion-Version': '2022-06-28' },
    });
    if (!r.ok) return {};
    const p = (await r.json()).properties || {};
    const text = (f) => (f?.rich_text || []).map((t) => t.plain_text).join('').trim();
    return {
      adresse: text(p['Adresse']),
      cp: text(p['Code Postal']),
      ville: text(p['Ville']),
      structure: text(p['Société']),
      carte: text(p['N°carte de guide et année']),
    };
  } catch {
    return {};
  }
}

function buildParams(page, interne = {}) {
  const p = page.properties;
  const text = (f) => (f?.rich_text || []).map((t) => t.plain_text).join('');
  const multi = (f) => (f?.multi_select || []).map((s) => s.name);
  const list = (arr) => arr.join(',');

  const masquees = multi(p['Coordonnées masquées']);
  const coords = COORDS.filter(([n]) => !masquees.includes(n)).map(([, t]) => t);

  const values = {
    guide_id: normId(page.id),
    situation: SITUATION_RENOUVELLEMENT,
    nom: (p['Nom']?.title || []).map((t) => t.plain_text).join(''),
    prenom: text(p['Prénom']),
    email: p['Email']?.email || '',
    tel: p['Téléphone']?.phone_number || '',
    base: lireBase(p),
    langues: list(multi(p['Langues'])),
    departements: list(multi(p['Départements'])),
    villes: list(multi(p['Villes / Sites'])),
    musees: list(multi(p['Musées et sites']).map((m) => MUSEES_TALLY[m] || m)),
    musees_autres: text(p['Musées et sites - autres']),
    vah: text(p["Villes d'Art et d'Histoire"]),
    nature: text(p['Espaces naturels']),
    lieux_autres: text(p['Autres lieux de guidage']),
    publics: list(multi(p['Public'])),
    thematiques: list(multi(p['Thématiques'])),
    types: list(multi(p['Types de visites'])),
    presentation: text(p['Biographie']),
    petitplus: text(p['Le + de ce guide']),
    vp_titre: text(p['Visite phare – titre']),
    vp_desc: text(p['Visite phare – description']),
    site: p['Site Web']?.url || '',
    instagram: p['Instagram']?.url || '',
    facebook: p['Facebook']?.url || '',
    linkedin: p['LinkedIn']?.url || '',
    youtube: p['Youtube']?.url || '',
    coords: list(coords),
    ...interne,
  };

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(values)) if (v) qs.set(k, v);
  return qs.toString();
}

export async function getServerSideProps({ params, res }) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');

  const id = normId(params.id);
  if (!/^[0-9a-f]{32}$/.test(id)) return { props: { error: true } };

  const r = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
    },
  });
  if (!r.ok) return { props: { error: true } };
  const page = await r.json();

  // N'accepte que les fiches de la base annuaire, non archivées
  if (page.archived || normId(page.parent?.database_id) !== DATABASE_ID) {
    return { props: { error: true } };
  }

  return {
    redirect: { destination: `${TALLY_FORM}?${buildParams(page, await lireAdherent(page))}`, permanent: false },
  };
}

export default function Renouveler() {
  return (
    <main className="container" style={{ padding: '4rem 1rem', maxWidth: 640 }}>
      <h1>Lien non valide</h1>
      <p>
        Ce lien de réadhésion n&apos;est pas reconnu. Vérifiez que vous avez copié le lien complet
        reçu par e-mail, ou remplissez le{' '}
        <a href={TALLY_FORM}>formulaire d&apos;adhésion</a> sans pré-remplissage.
      </p>
    </main>
  );
}
