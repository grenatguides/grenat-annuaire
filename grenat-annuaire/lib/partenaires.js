// =============================================================================
//  ADHÉSION DES MEMBRES PARTENAIRES (structures)
//  Formulaire Tally « Adhésion 2027 – Membres partenaires » -> base Notion Adhérents
// =============================================================================
//
//  Les partenaires sont enregistrés dans la même base « Adhérents » que les guides,
//  avec la catégorie « Membre partenaire » (filtrer sur cette catégorie pour les voir).
//  Ils n'ont pas de fiche dans l'annuaire des guides.
//
//  Le paiement (campagne HelloAsso dont l'adresse contient « partenaires ») est
//  rattaché automatiquement par l'adresse e-mail, comme pour les guides.
//
//  Pour changer une question du formulaire : garder le début de son titre, ou
//  modifier la ligne correspondante ci-dessous.
// =============================================================================

import { notion, val, lireReponse, norm, chercherParEmail, copierFichier, BASE_ADHERENTS } from './adhesions';

export const FORMULAIRE_PARTENAIRE = 'Qo1dbG';

// début du titre de la question -> [colonne Notion, type]
const QUESTIONS_PARTENAIRE = [
  ['Nom de votre structure', 'Société', 'texte'],
  ["Secteur d'activité", "Secteur d'activité", 'texte'],
  ['Numéro SIRET', 'SIRET', 'texte'],
  ['Site internet', 'Site internet', 'lien'],
  ['Adresse', 'Adresse', 'texte'],
  ['Code postal', 'Code Postal', 'texte'],
  ['Ville', 'Ville', 'texte', true],
  ['Nom', 'Nom', 'titre', true],
  ['Prénom', 'Prénom', 'texte'],
  ['E-mail', 'Email', 'email', true],
  ['Téléphone', 'Numéro de téléphone', 'telephone'],
  ['Logo de votre structure', 'Logo', 'fichier'],
  ['Acceptez-vous que votre logo', 'Logo sur le site Grenat', 'choix'],
  ['Souhaitez-vous recevoir le logo', 'Souhaite le macaron Grenat', 'choix'],
  ['Pourquoi souhaitez-vous soutenir', 'Pourquoi soutenir Grenat', 'texte'],
  ["Qu'attendez-vous", 'Attentes', 'texte'],
  ['Comment avez-vous connu', 'Comment a connu Grenat', 'texte'],
  ['Règlement intérieur', null, 'reglement'],
];

const enTexte = (v) => (Array.isArray(v) ? v.join(', ') : v == null ? '' : String(v)).trim();

export function repartirPartenaire(reponses) {
  const props = {};
  const fichiers = [];
  const autres = [];
  for (const r of reponses) {
    const l = norm(r.label);
    const q = QUESTIONS_PARTENAIRE.find(([debut, , , exact]) => (exact ? l === norm(debut) : l.startsWith(norm(debut))));
    if (!q) {
      if (r.valeur != null && r.type !== 'FILE_UPLOAD') autres.push(`${r.label.replace(/<[^>]*>/g, '').trim()} : ${enTexte(r.valeur)}`);
      continue;
    }
    const [, colonne, type] = q;
    if (type === 'fichier') {
      if (Array.isArray(r.valeur) && r.valeur.length) fichiers.push({ colonne, fichiers: r.valeur });
    } else if (type === 'reglement') {
      const coches = (Array.isArray(r.valeur) ? r.valeur : [r.valeur]).map(norm);
      props['Règlement intérieur accepté'] = val.case(coches.some((x) => x.includes('reglement')));
      props['Consentement RGPD'] = val.case(coches.some((x) => x.includes('donnees')));
    } else if (r.valeur != null && r.valeur !== '') {
      props[colonne] = val[type === 'texte' ? 'texte' : type](enTexte(r.valeur));
    }
  }
  if (props.Email) props.Email = val.email(enTexte(props.Email.email));
  props['Autres réponses'] = val.texte(autres.join('\n'));
  props['Catégorie'] = val.choix('Membre partenaire');
  return { props, fichiers };
}

export async function enregistrerPartenaire(payload) {
  const lu = lireReponse(payload);
  const { props, fichiers } = repartirPartenaire(lu.reponses);
  const email = props.Email?.email || '';
  if (lu.date) props['Dernière réponse formulaire'] = val.date(String(lu.date).slice(0, 10));

  for (const f of fichiers) props[f.colonne] = { files: await Promise.all(f.fichiers.slice(0, 3).map(copierFichier)) };

  const existant = await chercherParEmail(BASE_ADHERENTS, email);
  if (existant) {
    // On ne remplace pas une catégorie mise à la main (ex. membre d'honneur)
    if (existant.properties?.['Catégorie']?.select?.name === "Membre d'honneur") delete props['Catégorie'];
    await notion(`pages/${existant.id}`, { method: 'PATCH', body: { properties: props } });
    return { adherent: existant.id, categorie: 'Membre partenaire' };
  }
  const page = await notion('pages', { method: 'POST', body: { parent: { database_id: BASE_ADHERENTS }, properties: props } });
  return { adherent: page.id, categorie: 'Membre partenaire', nouveau: true };
}
