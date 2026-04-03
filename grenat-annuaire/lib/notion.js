const DATABASE_ID = '2eceef96524a80fe82d4cb73e9ba6ed0';

export function slugify(prenom, nom) {
  return `${prenom}-${nom}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseGuide(page) {
  const p = page.properties;
  const nom = p['Nom']?.title?.[0]?.plain_text || '';
  const prenom = p['Prénom']?.rich_text?.[0]?.plain_text || '';

  const photoFiles = p['Photo']?.files || [];
  let photo = null;
  if (photoFiles.length > 0) {
    const f = photoFiles[0];
    photo = f.type === 'file' ? f.file?.url : f.external?.url;
  }

  const richText = (field) =>
    (field?.rich_text || []).map((t) => t.plain_text).join('');

  return {
    id: page.id,
    slug: slugify(prenom, nom),
    nom,
    prenom,
    nomComplet: `${prenom} ${nom}`.trim(),
    idGuide: p['ID Guide']?.number || null,
    statut: p['Statut']?.select?.name || '',
    photo,
    email: p['Email']?.email || '',
    telephone: p['Téléphone']?.phone_number || '',
    siteWeb: p['Site Web']?.url || '',
    departements: p['Départements']?.multi_select?.map((s) => s.name) || [],
    villes: p['Villes / Sites']?.multi_select?.map((s) => s.name) || [],
    langues: p['Langues']?.multi_select?.map((s) => s.name) || [],
    typesVisites: p['Types de visites']?.multi_select?.map((s) => s.name) || [],
    musees: p['Musées et sites']?.multi_select?.map((s) => s.name) || [],
    thematiques: p['Thématiques']?.multi_select?.map((s) => s.name) || [],
    publicCible: p['Public']?.multi_select?.map((s) => s.name) || [],
    biographie: richText(p['Biographie']),
    lePlus: richText(p['Le + de ce guide']),
  };
}

export async function fetchAllGuides() {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN manquant dans les variables d\'environnement');

  let allResults = [];
  let cursor = undefined;

  do {
    const body = {
      page_size: 100,
      filter: { property: 'Statut', select: { equals: 'Guide actif' } },
      sorts: [{ property: 'Nom', direction: 'ascending' }],
    };
    if (cursor) body.start_cursor = cursor;

    const response = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Erreur Notion: ${response.status}`);
    }

    const data = await response.json();
    allResults = [...allResults, ...data.results];
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return allResults.map(parseGuide);
}
