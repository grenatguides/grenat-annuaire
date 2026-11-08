// Sert les photos stockées dans Notion (portraits, visites phares, photos de visites).
// Notion ne donne que des liens valables 1 heure : les mettre directement dans les pages
// les casserait si la page reste en cache plus longtemps. Le site affiche donc un lien
// fixe /api/image?id=…&p=…, et cette adresse redirige vers un lien Notion frais.
// Sécurité : seules les colonnes d'images publiques des bases annuaire et visites sont
// servies (jamais les fichiers de la base Adhérents : cartes pro, signatures…), et
// seulement pour des guides visibles dans l'annuaire.

import { notion, BASE_ANNUAIRE } from '../../lib/adhesions';
import { BASE_VISITES } from '../../lib/visites';

const COLONNES = {
  photo: { base: BASE_ANNUAIRE, colonne: 'Photo' },
  vp: { base: BASE_ANNUAIRE, colonne: 'Visite phare – image' },
  visite: { base: BASE_VISITES, colonne: 'Photo' },
};
const normId = (s) => String(s || '').replace(/-/g, '').toLowerCase();

async function lire(id) {
  for (const token of [process.env.NOTION_TOKEN, process.env.NOTION_ADHESIONS_TOKEN].filter(Boolean)) {
    try { return await notion(`pages/${id}`, { token }); } catch { /* essai suivant */ }
  }
  return null;
}

export default async function handler(req, res) {
  const id = normId(req.query.id);
  const regle = COLONNES[req.query.p];
  if (!/^[0-9a-f]{32}$/.test(id) || !regle) return res.status(400).end();

  const page = await lire(id);
  if (!page || normId(page.parent?.database_id) !== normId(regle.base)) return res.status(404).end();
  if (regle.base === BASE_ANNUAIRE && page.properties?.["Visible dans l'annuaire"]?.formula?.boolean === false) {
    return res.status(404).end();
  }
  const f = page.properties?.[regle.colonne]?.files?.[0];
  const url = f ? (f.type === 'file' ? f.file?.url : f.external?.url) : null;
  if (!url) return res.status(404).end();

  // Le lien Notion est valable 1 h : on garde la redirection en cache 30 min maximum
  res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=1800');
  res.redirect(302, url);
}
