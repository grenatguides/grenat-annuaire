// =============================================================================
//  ADHÉSIONS GRENAT : enregistrement des réponses du formulaire Tally dans Notion
// =============================================================================
//
//  Fonctionnement en bref :
//   1. Un guide remplit le formulaire Tally « Adhésion / Réadhésion ».
//   2. Tally envoie la réponse à https://annuaire.lesguidesgrenat.fr/api/tally
//   3. Ce fichier range chaque réponse :
//        - dans la base « Guides - Annuaire Public » (fiche publique)
//        - dans la base « Adhérents » (informations internes)
//      Il retrouve le guide grâce à son lien personnel (guide_id), sinon par e-mail.
//      S'il ne le trouve pas, il crée une nouvelle fiche dans chaque base.
//   4. Le paiement HelloAsso est traité dans pages/api/helloasso.js.
//
//  Ce qui est sans risque dans Tally (aucune modification ici n'est nécessaire) :
//   - changer le texte d'une explication ;
//   - ajouter une option à une question (elle est créée dans Notion toute seule) ;
//   - ajouter une nouvelle question : sa réponse arrive dans « Autres réponses »
//     de la fiche Adhérent.
//
//  Ce qui demande de modifier la liste QUESTIONS ci-dessous :
//   - changer le DÉBUT du titre d'une question existante ;
//   - vouloir qu'une nouvelle question remplisse une colonne Notion précise.
// =============================================================================

export const BASE_ANNUAIRE = '2eceef96524a80fe82d4cb73e9ba6ed0';
export const BASE_ADHERENTS = '15feef96524a8056ba35e0a6cfadaa85';

// Colonne « où le guide est basé » dans l'annuaire. Le premier nom trouvé dans
// Notion est utilisé (texte ou sélection) : on peut donc la renommer en l'un
// de ces noms sans rien casser.
export const NOMS_COLONNE_BASE = ['Basé(e) à', 'Basé à', 'Base', 'base'];

// Correspondance entre libellés Tally et options Notion quand ils diffèrent.
const MUSEES_NOTION = {
  'Musée des Beaux-arts (Lyon)': 'Musée des Beaux-arts',
  'Musée Gallo-Romain (Saint-Romain-en-Gal)': 'Musée Gallo-Romain (Saint Romain en Gal)',
  'Musée Champollion (Vif)': 'Musée Champollion (Vif Isère)',
};
const SITUATIONS = [
  ['je renouvelle', 'Renouvellement'],
  ['deja ete adherent', 'Ancien adhérent'],
  ['premiere adhesion', 'Nouvel adhérent'],
];
const COORDONNEES = {
  'Mon téléphone': 'Téléphone',
  'Mon e-mail': 'E-mail',
  'Mes réseaux sociaux et site internet': 'Réseaux et site',
};

// -----------------------------------------------------------------------------
//  LISTE DES QUESTIONS
//  debut  : début du titre de la question dans Tally (majuscules et accents ignorés)
//  base   : 'annuaire' (fiche publique) ou 'adherent' (interne)
//  colonne: nom exact de la colonne Notion
//  type   : texte | titre | email | telephone | lien | liste | choix | fichier | special
// -----------------------------------------------------------------------------
export const QUESTIONS = [
  { debut: 'Votre situation', type: 'special', cle: 'situation' },

  { debut: 'Nom', exact: true, type: 'special', cle: 'nom' },
  { debut: 'Prénom', type: 'special', cle: 'prenom' },
  { debut: 'E-mail', exact: true, type: 'special', cle: 'email' },
  { debut: 'Téléphone', type: 'special', cle: 'telephone' },
  { debut: 'Adresse', base: 'adherent', colonne: 'Adresse', type: 'texte' },
  { debut: 'Code postal', base: 'adherent', colonne: 'Code Postal', type: 'texte' },
  { debut: 'Ville', exact: true, base: 'adherent', colonne: 'Ville', type: 'texte' },
  { debut: 'Nom de votre structure', base: 'adherent', colonne: 'Société', type: 'texte' },
  { debut: 'Numéro de votre carte', base: 'adherent', colonne: 'N°carte de guide et année', type: 'texte' },

  { debut: 'Où êtes-vous basé', type: 'special', cle: 'base' },
  { debut: 'Dans quelles langues', base: 'annuaire', colonne: 'Langues', type: 'liste' },
  { debut: 'Dans quels départements', base: 'annuaire', colonne: 'Départements', type: 'liste' },
  { debut: 'Dans quelles villes', base: 'annuaire', colonne: 'Villes / Sites', type: 'liste' },
  { debut: 'Autres villes', base: 'annuaire', colonne: 'Villes / Sites', type: 'liste', ajouter: true },

  { debut: 'Guidez-vous dans un ou plusieurs', base: 'annuaire', colonne: 'Musées et sites', type: 'liste', renommer: MUSEES_NOTION },
  { debut: 'Autres musées', base: 'annuaire', colonne: 'Musées et sites - autres', type: 'texte' },
  { debut: "Villes et Pays d'Art", base: 'annuaire', colonne: "Villes d'Art et d'Histoire", type: 'texte' },
  { debut: 'Espaces naturels', base: 'annuaire', colonne: 'Espaces naturels', type: 'texte' },
  { debut: 'Autres lieux de guidage', base: 'annuaire', colonne: 'Autres lieux de guidage', type: 'texte' },
  { debut: 'Pour quels publics', base: 'annuaire', colonne: 'Public', type: 'liste' },
  { debut: 'Quelles sont vos thématiques', base: 'annuaire', colonne: 'Thématiques', type: 'liste' },
  { debut: 'Quels types de visites', base: 'annuaire', colonne: 'Types de visites', type: 'liste' },

  { debut: 'Photo portrait', base: 'annuaire', colonne: 'Photo', type: 'fichier' },
  { debut: 'Présentation', base: 'annuaire', colonne: 'Biographie', type: 'texte' },
  { debut: 'Le petit plus', base: 'annuaire', colonne: 'Le + de ce guide', type: 'texte' },
  { debut: 'Visite phare – titre', base: 'annuaire', colonne: 'Visite phare – titre', type: 'texte' },
  { debut: 'Visite phare – description', base: 'annuaire', colonne: 'Visite phare – description', type: 'texte' },
  { debut: 'Visite phare – image', base: 'annuaire', colonne: 'Visite phare – image', type: 'fichier' },
  { debut: 'Site internet', base: 'annuaire', colonne: 'Site Web', type: 'lien' },
  { debut: 'Instagram', base: 'annuaire', colonne: 'Instagram', type: 'lien' },
  { debut: 'Facebook', base: 'annuaire', colonne: 'Facebook', type: 'lien' },
  { debut: 'LinkedIn', base: 'annuaire', colonne: 'LinkedIn', type: 'lien' },
  { debut: 'YouTube', base: 'annuaire', colonne: 'Youtube', type: 'lien' },
  { debut: 'Quelles coordonnées souhaitez-vous afficher', type: 'special', cle: 'coordonnees' },

  { debut: 'Comment avez-vous connu', base: 'adherent', colonne: 'Comment a connu Grenat', type: 'texte' },
  { debut: 'Pourquoi adhérez-vous', base: 'adherent', colonne: 'Attentes', type: 'texte' },
  { debut: 'Quels e-mails souhaitez-vous', type: 'special', cle: 'mailing' },
  { debut: "Acceptez-vous que l'association diffuse", base: 'adherent', colonne: "Droit à l'image", type: 'choix' },
  { debut: "Acceptez-vous d'apparaître dans l'annuaire", type: 'special', cle: 'annuaire' },
  { debut: 'Règlement intérieur', type: 'special', cle: 'reglement' },
  { debut: 'Signature', base: 'adherent', colonne: 'Signature règlement', type: 'fichier' },
];

// =============================================================================
//  Le reste du fichier est la mécanique : il n'est normalement pas à modifier.
// =============================================================================

const NOTION_VERSION = '2022-06-28';

export const norm = (s) =>
  String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const normId = (s) => String(s || '').replace(/-/g, '').toLowerCase();

export async function notion(path, { method = 'GET', body, token } = {}) {
  const r = await fetch(`https://api.notion.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token || process.env.NOTION_ADHESIONS_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Notion ${method} ${path} : ${r.status} ${data.message || ''}`);
  return data;
}

// --- Construction des valeurs Notion -----------------------------------------

const decouper = (txt) => {
  const s = String(txt || '');
  const out = [];
  for (let i = 0; i < s.length; i += 1900) out.push({ text: { content: s.slice(i, i + 1900) } });
  return out.slice(0, 50);
};
const optionNom = (s) => String(s).replace(/,/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);

export const val = {
  titre: (s) => ({ title: decouper(s) }),
  texte: (s) => ({ rich_text: decouper(s) }),
  email: (s) => ({ email: s ? String(s).trim().toLowerCase() : null }),
  telephone: (s) => ({ phone_number: s ? String(s).trim() : null }),
  lien: (s) => {
    let u = String(s || '').trim();
    if (u && !/^https?:\/\//i.test(u)) u = `https://${u}`;
    return { url: u || null };
  },
  liste: (arr) => ({
    multi_select: [...new Set((arr || []).map(optionNom).filter(Boolean))].map((name) => ({ name })),
  }),
  choix: (s) => ({ select: s ? { name: optionNom(s) } : null }),
  case: (b) => ({ checkbox: !!b }),
  date: (iso) => ({ date: iso ? { start: iso } : null }),
  nombre: (n) => ({ number: n == null ? null : Number(n) }),
  relation: (ids) => ({ relation: ids.map((id) => ({ id })) }),
};

// --- Lecture de la réponse Tally ---------------------------------------------

// Transforme un champ Tally en valeur simple : texte, liste de textes, ou fichiers.
function lireChamp(f) {
  const opts = Object.fromEntries((f.options || []).map((o) => [o.id, o.text]));
  const v = f.value;
  if (v == null || v === '') return null;
  if (f.type === 'FILE_UPLOAD' || f.type === 'SIGNATURE') {
    if (typeof v === 'string') return [{ url: v, name: 'signature.png', mimeType: 'image/png' }];
    return Array.isArray(v) ? v : [];
  }
  if (Array.isArray(v)) return v.map((x) => (typeof x === 'string' ? opts[x] ?? x : x?.text ?? x)).filter(Boolean);
  if (typeof v === 'object') return JSON.stringify(v);
  return v;
}

export function lireReponse(payload) {
  const champs = payload?.data?.fields || [];
  const caches = {};
  const reponses = [];
  for (const f of champs) {
    if (typeof f.value === 'boolean') continue; // doublons « une case = un champ » envoyés par Tally
    if (f.type === 'HIDDEN_FIELDS') {
      caches[f.label] = f.value;
      continue;
    }
    if (['CALCULATED_FIELDS', 'PAYMENT'].includes(f.type)) continue;
    reponses.push({ label: f.label || '', type: f.type, valeur: lireChamp(f) });
  }
  return { caches, reponses, date: payload?.data?.createdAt || payload?.createdAt, id: payload?.data?.responseId };
}

function trouverQuestion(label) {
  const l = norm(label);
  return QUESTIONS.find((q) => (q.exact ? l === norm(q.debut) : l.startsWith(norm(q.debut))));
}

const enListe = (v) => (v == null ? [] : Array.isArray(v) ? v : String(v).split(/[,;\n]/)).map((x) => String(x).trim()).filter(Boolean);
const enTexte = (v) => (Array.isArray(v) ? v.join(', ') : v == null ? '' : String(v));

// Répartit les réponses entre fiche annuaire et fiche adhérent.
export function repartir({ reponses }) {
  const annuaire = {};
  const adherent = {};
  const fichiers = []; // { colonne, fichiers: [{url,name,mimeType}] }
  const autres = [];
  const info = {};

  for (const r of reponses) {
    const q = trouverQuestion(r.label);
    if (!q) {
      if (r.valeur != null && !['FILE_UPLOAD', 'SIGNATURE'].includes(r.type)) autres.push(`${r.label.replace(/<[^>]*>/g, '').trim()} : ${enTexte(r.valeur)}`);
      continue;
    }
    if (q.type === 'special') {
      info[q.cle] = r.valeur;
      continue;
    }
    // Question interne masquée ou laissée vide : on garde l'ancienne valeur
    if (q.base === 'adherent' && (r.valeur == null || r.valeur === '')) continue;
    const cible = q.base === 'annuaire' ? annuaire : adherent;
    if (q.type === 'fichier') {
      if (Array.isArray(r.valeur) && r.valeur.length) fichiers.push({ base: q.base, colonne: q.colonne, fichiers: r.valeur });
      continue;
    }
    if (q.type === 'liste') {
      let items = enListe(r.valeur)
        .filter((x) => !['autre', 'other'].includes(norm(x))) // la case « Autre » elle-même
        .map((x) => (q.renommer?.[x]) || x);
      if (q.ajouter && cible[q.colonne]) items = [...cible[q.colonne].multi_select.map((o) => o.name), ...items];
      if (q.ajouter && !items.length) continue;
      cible[q.colonne] = val.liste(items);
    } else if (q.type === 'choix') cible[q.colonne] = val.choix(enTexte(r.valeur));
    else if (q.type === 'lien') cible[q.colonne] = val.lien(enTexte(r.valeur));
    else cible[q.colonne] = val.texte(enTexte(r.valeur));
  }

  // Champs communs aux deux bases
  const nom = enTexte(info.nom).trim();
  const prenom = enTexte(info.prenom).trim();
  const email = enTexte(info.email).trim().toLowerCase();
  const tel = enTexte(info.telephone).trim();
  Object.assign(annuaire, { Nom: val.titre(nom.toUpperCase()), 'Prénom': val.texte(prenom), Email: val.email(email), 'Téléphone': val.telephone(tel) });
  Object.assign(adherent, { Nom: val.titre(nom), 'Prénom': val.texte(prenom), Email: val.email(email), 'Numéro de téléphone': val.telephone(tel) });

  // Situation
  const sit = norm(enTexte(info.situation));
  const situation = SITUATIONS.find(([k]) => sit.includes(k))?.[1];
  if (situation) adherent.Situation = val.choix(situation);

  // Coordonnées : on enregistre ce qui est MASQUÉ (cases non cochées)
  if ('coordonnees' in info) {
    const coches = enListe(info.coordonnees);
    annuaire['Coordonnées masquées'] = val.liste(
      Object.entries(COORDONNEES).filter(([libelle]) => !coches.includes(libelle)).map(([, n]) => n)
    );
  }

  // Listes de diffusion : « Informations Lyon » -> « Lyon »
  if ('mailing' in info) adherent.Mailing = val.liste(enListe(info.mailing).map((x) => x.replace(/^Informations\s+/i, '')));

  // Apparaître dans l'annuaire
  const visible = norm(enTexte(info.annuaire)) !== 'non';
  adherent["Apparaître dans l'annuaire"] = val.choix(visible ? 'Oui' : 'Non');
  annuaire['Masquer la fiche'] = val.case(!visible);

  // Règlement + RGPD (deux cases)
  const reglement = enListe(info.reglement).map(norm);
  adherent['Règlement intérieur accepté'] = val.case(reglement.some((x) => x.includes('reglement')));
  adherent['Consentement RGPD'] = val.case(reglement.some((x) => x.includes('donnees')));

  adherent['Autres réponses'] = val.texte(autres.join('\n'));

  return { annuaire, adherent, fichiers, email, nom, prenom, base: enTexte(info.base ?? '').trim(), autres };
}

// --- Recherche des fiches existantes -----------------------------------------

export async function chercherParEmail(base, email) {
  if (!email) return null;
  const r = await notion(`databases/${base}/query`, {
    method: 'POST',
    body: { filter: { property: 'Email', email: { equals: email } }, page_size: 5 },
  });
  if (r.results[0]) return r.results[0];
  // Les e-mails ont parfois été saisis avec des majuscules : 2e essai insensible à la casse
  const r2 = await notion(`databases/${base}/query`, {
    method: 'POST',
    body: { filter: { property: 'Email', email: { contains: email.split('@')[0] } }, page_size: 20 },
  });
  return r2.results.find((p) => (p.properties.Email?.email || '').toLowerCase() === email) || null;
}

export async function lirePage(id) {
  try {
    const p = await notion(`pages/${normId(id)}`);
    return p.archived ? null : p;
  } catch {
    return null;
  }
}

// --- Copie des images dans Notion (pour ne pas dépendre de Tally) ------------

async function copierFichier(f) {
  const token = process.env.NOTION_ADHESIONS_TOKEN;
  try {
    const src = await fetch(f.url);
    if (!src.ok) throw new Error(`téléchargement ${src.status}`);
    const blob = await src.blob();
    const nom = (f.name || 'image').slice(0, 90);
    const up = await notion('file_uploads', { method: 'POST', body: { filename: nom, content_type: f.mimeType || blob.type } });
    const form = new FormData();
    form.append('file', blob, nom);
    const send = await fetch(`https://api.notion.com/v1/file_uploads/${up.id}/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Notion-Version': NOTION_VERSION },
      body: form,
    });
    if (!send.ok) throw new Error(`envoi ${send.status}`);
    return { type: 'file_upload', file_upload: { id: up.id }, name: nom };
  } catch (e) {
    console.error('Copie du fichier impossible, lien Tally conservé :', e.message);
    return { type: 'external', name: (f.name || 'image').slice(0, 90), external: { url: f.url } };
  }
}

// --- Traitement complet d'une réponse ----------------------------------------

export async function enregistrerReponse(payload) {
  const lu = lireReponse(payload);
  const { annuaire, adherent, fichiers, email, base, autres } = repartir(lu);
  const dateReponse = (lu.date || new Date().toISOString()).slice(0, 10);
  adherent['Dernière réponse formulaire'] = val.date(dateReponse);

  // Images
  for (const { base, colonne, fichiers: liste } of fichiers) {
    const cible = base === 'adherent' ? adherent : annuaire;
    cible[colonne] = { files: await Promise.all(liste.slice(0, 3).map(copierFichier)) };
  }

  // Où le guide est basé : écrit dans la colonne qui existe dans Notion
  if (base) {
    const schema = (await notion(`databases/${BASE_ANNUAIRE}`)).properties || {};
    const col = NOMS_COLONNE_BASE.find((n) => schema[n]);
    const type = col && schema[col].type;
    if (type === 'rich_text') annuaire[col] = val.texte(base);
    else if (type === 'select') annuaire[col] = val.choix(base);
    else adherent['Autres réponses'] = val.texte([...autres, `Basé(e) à : ${base}`].join('\n'));
  }

  // 1. Fiche annuaire : via le lien personnel, sinon par e-mail
  let fiche = lu.caches.guide_id ? await lirePage(lu.caches.guide_id) : null;
  if (fiche && normId(fiche.parent?.database_id) !== BASE_ANNUAIRE) fiche = null;
  if (!fiche) fiche = await chercherParEmail(BASE_ANNUAIRE, email);

  // 2. Fiche adhérent : liée à la fiche annuaire, sinon par e-mail
  let adh = null;
  const lien = fiche?.properties?.['Adhérent (interne)']?.relation?.[0]?.id;
  if (lien) adh = await lirePage(lien);
  if (!adh) adh = await chercherParEmail(BASE_ADHERENTS, email);

  // 3. Écriture fiche annuaire
  if (fiche) {
    await notion(`pages/${fiche.id}`, { method: 'PATCH', body: { properties: annuaire } });
  } else {
    annuaire.Statut = val.choix('Guide actif');
    fiche = await notion('pages', { method: 'POST', body: { parent: { database_id: BASE_ANNUAIRE }, properties: annuaire } });
  }

  // 4. Écriture fiche adhérent (avec le lien vers la fiche annuaire)
  adherent['Fiche annuaire'] = val.relation([fiche.id]);
  if (adh) {
    await notion(`pages/${adh.id}`, { method: 'PATCH', body: { properties: adherent } });
  } else {
    adh = await notion('pages', { method: 'POST', body: { parent: { database_id: BASE_ADHERENTS }, properties: adherent } });
  }

  return { fiche: fiche.id, adherent: adh.id, nouveau: !lien && !lu.caches.guide_id };
}
