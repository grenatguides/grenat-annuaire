// =============================================================================
//  AGENDA DES VISITES : formulaire Tally « Proposer une visite » -> Notion -> site
// =============================================================================
//
//  1. Chaque guide a un lien personnel :
//       https://annuaire.lesguidesgrenat.fr/proposer-une-visite/<id de sa fiche>
//     qui ouvre le formulaire Tally déjà rattaché à sa fiche.
//  2. Tally envoie la réponse à /api/tally (même webhook que les adhésions) :
//     la visite est créée dans la base Notion « Prochaines visites ».
//  3. Le site affiche les visites à venir : page /agenda, fiche du guide,
//     encart des 2 prochaines visites pour l'accueil du site Framer.
//
//  Règles :
//   - publication automatique, sans validation ;
//   - une visite n'apparaît que si son guide est visible dans l'annuaire ;
//   - les visites passées disparaissent toutes seules ;
//   - pour retirer une visite : cocher « Annulée » dans Notion (ou la supprimer).
//
//  La connexion Notion « Adhésions Grenat » doit avoir accès à la base
//  « Prochaines visites » (••• de la base > Connexions).
// =============================================================================

import { notion, val, lireReponse, lirePage, norm, copierFichier, BASE_ANNUAIRE } from './adhesions';
import { imageNotion } from './notion';

export const BASE_VISITES = '2f1eef96524a80ceae24fd698eacc8f9';
export const FORMULAIRE_VISITE = 'BEaZK4';
export const TALLY_VISITE = `https://tally.so/r/${FORMULAIRE_VISITE}`;
const FUSEAU = 'Europe/Paris';

const normId = (s) => String(s || '').replace(/-/g, '').toLowerCase();
const texte = (v) => (Array.isArray(v) ? v.join(', ') : v == null ? '' : String(v)).trim();
const liste = (v) => (Array.isArray(v) ? v : v ? [v] : []).map((x) => String(x).trim()).filter(Boolean);

// Réponse Tally -> valeurs, en reconnaissant les questions par le début de leur titre
function lireVisite(reponses) {
  const v = {};
  const regles = [
    ['titre de la visite', 'titre'],
    ['date', 'date', true],
    ['heure de debut', 'debut'],
    ['heure de fin', 'fin'],
    ['ville', 'ville', true],
    ['departement', 'departement'],
    ['lieu de rendez-vous', 'lieu'],
    ['prix', 'prix'],
    ['public', 'public', true],
    ['langue', 'langues'],
    ['description', 'description'],
    ['photo', 'photo'],
    ['lien de reservation', 'lien'],
  ];
  for (const r of reponses) {
    const l = norm(r.label.replace(/<[^>]*>/g, ''));
    const regle = regles.find(([debut, , exact]) => (exact ? l === debut : l.startsWith(debut)));
    if (regle) v[regle[1]] = r.valeur;
  }
  return v;
}

const heure = (h) => (/^\d{1,2}:\d{2}/.test(texte(h)) ? texte(h).slice(0, 5).padStart(5, '0') : '');

export async function enregistrerVisite(payload) {
  const lu = lireReponse(payload);
  const guideId = normId(lu.caches.guide_id);
  const refTally = lu.id || '';

  // Réponse déjà enregistrée (Tally renvoie parfois la même réponse) : on ne refait rien
  if (refTally) {
    const deja = await notion(`databases/${BASE_VISITES}/query`, {
      method: 'POST',
      body: { filter: { property: 'Réf. Tally', rich_text: { equals: refTally } }, page_size: 1 },
    });
    if (deja.results[0]) return { deja: deja.results[0].id };
  }

  const v = lireVisite(lu.reponses);
  const date = texte(v.date).slice(0, 10);
  const debut = heure(v.debut);
  const fin = heure(v.fin);
  const dateNotion = date
    ? {
        date: {
          start: debut ? `${date}T${debut}:00` : date,
          ...(debut && fin && fin > debut ? { end: `${date}T${fin}:00` } : {}),
          ...(debut ? { time_zone: FUSEAU } : {}),
        },
      }
    : { date: null };

  const prix = v.prix === '' || v.prix == null ? null : Number(String(v.prix).replace(',', '.'));
  const lien = texte(v.lien);

  const proprietes = {
    'Nom de la visite': val.titre(texte(v.titre) || 'Visite'),
    Date: dateNotion,
    'Lieu de rendez-vous': val.texte(texte(v.lieu)),
    Description: val.texte(texte(v.description)),
    Langues: val.liste(liste(v.langues)),
    'Réf. Tally': val.texte(refTally),
    ...(texte(v.ville) ? { Ville: val.choix(texte(v.ville)) } : {}),
    ...(texte(v.departement) ? { 'Département': val.choix(texte(v.departement)) } : {}),
    ...(texte(v.public) ? { Public: val.choix(texte(v.public)) } : {}),
    ...(Number.isFinite(prix) ? { 'Prix/pers.': val.nombre(prix) } : {}),
    ...(lien ? { 'Lien de réservation': val.lien(lien) } : {}),
  };

  // Rattachement au guide (uniquement une vraie fiche de l'annuaire)
  const fiche = guideId ? await lirePage(guideId) : null;
  if (fiche && normId(fiche.parent?.database_id) === BASE_ANNUAIRE) {
    proprietes['Guides - Annuaire Public'] = val.relation([fiche.id]);
  }

  if (Array.isArray(v.photo) && v.photo.length) {
    proprietes.Photo = { files: [await copierFichier(v.photo[0])] };
  }

  const page = await notion('pages', {
    method: 'POST',
    body: { parent: { database_id: BASE_VISITES }, properties: proprietes },
  });
  return { visite: page.id, guide: fiche?.id || null };
}

// --- Lecture pour le site -----------------------------------------------------

const fmtJour = new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fmtJourCourt = new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU, weekday: 'short', day: 'numeric', month: 'short' });
const fmtMois = new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU, month: 'long', year: 'numeric' });
const fmtHeure = new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU, hour: '2-digit', minute: '2-digit' });
const jourParis = (d) => new Intl.DateTimeFormat('fr-CA', { timeZone: FUSEAU }).format(d);
const hh = (d) => fmtHeure.format(d).replace(':', ' h ').replace(' h 00', ' h');

function parseVisite(page) {
  const p = page.properties;
  const t = (f) => (f?.rich_text || f?.title || []).map((x) => x.plain_text).join('').trim();
  const d = p.Date?.date;
  if (!d?.start) return null;
  const avecHeure = d.start.length > 10;
  const debut = new Date(avecHeure ? d.start : `${d.start}T12:00:00Z`);
  const fin = d.end ? new Date(d.end) : null;
  const photo = p.Photo?.files?.[0];
  return {
    id: page.id,
    titre: t(p['Nom de la visite']),
    debut: d.start,
    jour: jourParis(debut),
    dateLabel: fmtJour.format(debut),
    dateCourte: fmtJourCourt.format(debut),
    mois: fmtMois.format(debut),
    horaire: avecHeure ? (fin && d.end.length > 10 ? `${hh(debut)} – ${hh(fin)}` : hh(debut)) : '',
    ville: p.Ville?.select?.name || '',
    departement: p['Département']?.select?.name || '',
    lieu: t(p['Lieu de rendez-vous']),
    prix: typeof p['Prix/pers.']?.number === 'number' ? p['Prix/pers.'].number : null,
    public: p.Public?.select?.name || '',
    langues: (p.Langues?.multi_select || []).map((o) => o.name),
    description: t(p.Description),
    photo: photo ? (photo.type === 'file' ? imageNotion(page.id, 'visite') : photo.external?.url) || null : null,
    lien: p['Lien de réservation']?.url || '',
    guideIds: (p['Guides - Annuaire Public']?.relation || []).map((r) => normId(r.id)),
  };
}

// Visites à venir, non annulées, dont le guide est visible dans l'annuaire.
// `guides` = résultat de fetchAllGuides() (déjà filtré sur la visibilité).
export async function fetchVisites(guides) {
  const token = process.env.NOTION_ADHESIONS_TOKEN || process.env.NOTION_TOKEN;
  const aujourdhui = jourParis(new Date());
  const resultats = [];
  let curseur;
  do {
    const r = await notion(`databases/${BASE_VISITES}/query`, {
      method: 'POST',
      token,
      body: {
        filter: {
          and: [
            { property: 'Date', date: { on_or_after: aujourdhui } },
            { property: 'Annulée', checkbox: { equals: false } },
          ],
        },
        sorts: [{ property: 'Date', direction: 'ascending' }],
        page_size: 100,
        ...(curseur ? { start_cursor: curseur } : {}),
      },
    });
    resultats.push(...r.results);
    curseur = r.has_more ? r.next_cursor : undefined;
  } while (curseur);

  const parId = Object.fromEntries((guides || []).map((g) => [normId(g.id), g]));
  return resultats
    .map(parseVisite)
    .filter(Boolean)
    .map((v) => {
      const g = v.guideIds.map((id) => parId[id]).find(Boolean);
      return g ? { ...v, guide: { slug: g.slug, nom: g.nomComplet, photo: g.photo || null } } : null;
    })
    .filter(Boolean);
}
