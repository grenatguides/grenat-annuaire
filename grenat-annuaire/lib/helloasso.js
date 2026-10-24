// =============================================================================
//  PAIEMENTS HELLOASSO : validation automatique de l'adhésion dans Notion
// =============================================================================
//
//  1. Un guide paie sa cotisation sur une campagne d'adhésion HelloAsso.
//  2. HelloAsso prévient https://annuaire.lesguidesgrenat.fr/api/helloasso
//  3. Ce fichier redemande la commande à HelloAsso (pour être sûr qu'elle est
//     authentique), retrouve l'adhérent par son e-mail et remplit :
//       - Adhérents : Date de paiement, Montant payé, Réf. HelloAsso,
//         Moyen de paiement, Année de cotisation, Valide jusqu'au
//       - Annuaire  : Adhésion valide jusqu'au (ce qui rend la fiche visible)
//
//  Règles :
//   - seules les campagnes de type « Adhésion » dont l'adresse contient
//     « adhesion » comptent (un repas ou un éductour ne valide rien) ;
//   - l'année de cotisation est lue dans l'adresse de la campagne (la plus
//     grande année citée, ex. « adhesion-2027-… » => 2027) ; à défaut, un
//     paiement à partir du 16 octobre compte pour l'année suivante ;
//   - « Valide jusqu'au » = 31 décembre de l'année de cotisation (comme sur
//     HelloAsso). Notion et l'annuaire laissent ensuite 3 mois de délai de
//     grâce : la fiche reste visible jusqu'au 31 mars suivant.
//
//  Si aucun adhérent ne correspond à l'e-mail du paiement, une fiche Adhérents
//  est créée avec un message « à vérifier » dans « Autres réponses ».
//
//  Variables Vercel : HELLOASSO_CLIENT_ID, HELLOASSO_CLIENT_SECRET
// =============================================================================

import { notion, val, chercherParEmail, lirePage, BASE_ANNUAIRE, BASE_ADHERENTS } from './adhesions';

const API = 'https://api.helloasso.com';
const ORGANISATION = 'grenat';

let jeton = null; // { valeur, expire }

async function obtenirJeton() {
  if (jeton && jeton.expire > Date.now() + 60_000) return jeton.valeur;
  const r = await fetch(`${API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.HELLOASSO_CLIENT_ID || '',
      client_secret: process.env.HELLOASSO_CLIENT_SECRET || '',
    }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) throw new Error(`Connexion HelloAsso refusée (${r.status}) : vérifier les identifiants`);
  jeton = { valeur: d.access_token, expire: Date.now() + (d.expires_in || 1800) * 1000 };
  return jeton.valeur;
}

async function lireCommande(id) {
  const r = await fetch(`${API}/v5/orders/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${await obtenirJeton()}` },
  });
  if (!r.ok) throw new Error(`Commande HelloAsso ${id} introuvable (${r.status})`);
  return r.json();
}

// Année de cotisation et date de fin de validité
export function validite(dateIso, formSlug = '') {
  const annees = (String(formSlug).match(/20\d{2}/g) || []).map(Number);
  let cotisation = annees.length ? Math.max(...annees) : null;
  if (!cotisation) {
    const [annee, mois, jour] = new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date(dateIso)).split('-').map(Number);
    cotisation = mois > 10 || (mois === 10 && jour >= 16) ? annee + 1 : annee;
  }
  return { cotisation, valideJusquau: `${cotisation}-12-31` };
}

export function estAdhesion(commande) {
  return commande?.formType === 'Membership' && /adhesion/i.test(commande?.formSlug || '');
}

export async function traiterNotification(notif) {
  const type = notif?.eventType;
  const idCommande = type === 'Order' ? notif?.data?.id : type === 'Payment' ? notif?.data?.order?.id : null;
  if (!idCommande) return { ignore: `événement ${type || 'inconnu'}` };

  const commande = await lireCommande(idCommande);
  if (commande.organizationSlug && commande.organizationSlug !== ORGANISATION) return { ignore: 'autre organisation' };
  if (!estAdhesion(commande)) return { ignore: `campagne ${commande.formSlug} (pas une adhésion)` };

  const paiement = (commande.payments || []).find((p) => p.state === 'Authorized');
  if (!paiement) return { ignore: 'paiement pas encore autorisé' };

  const email = (commande.payer?.email || '').trim().toLowerCase();
  const date = paiement.date || commande.date;
  const { cotisation, valideJusquau } = validite(date, commande.formSlug);
  // Montant de l'adhésion seule (un éventuel don en plus n'est pas compté)
  const lignesAdhesion = (commande.items || []).filter((i) => i.type === 'Membership');
  const montant = (lignesAdhesion.length
    ? lignesAdhesion.reduce((t, i) => t + (i.amount || 0), 0)
    : commande.amount?.total ?? paiement.amount ?? 0) / 100;

  const proprietes = {
    'Date de paiement': val.date(date.slice(0, 10)),
    'Montant payé': val.nombre(montant),
    'Réf. HelloAsso': val.texte(String(commande.id)),
    'Moyen de paiement': val.choix('HelloAsso'),
    'Année de cotisation': val.nombre(cotisation),
    "Valide jusqu'au": val.date(valideJusquau),
  };

  // Adhérent : par e-mail, sinon via la fiche annuaire qui porte cet e-mail
  let adh = await chercherParEmail(BASE_ADHERENTS, email);
  let fiche = null;
  if (adh) {
    const lien = adh.properties?.['Fiche annuaire']?.relation?.[0]?.id;
    if (lien) fiche = await lirePage(lien);
  }
  if (!fiche) fiche = await chercherParEmail(BASE_ANNUAIRE, email);
  if (!adh && fiche) {
    const lien = fiche.properties?.['Adhérent (interne)']?.relation?.[0]?.id;
    if (lien) adh = await lirePage(lien);
  }

  if (adh) {
    await notion(`pages/${adh.id}`, { method: 'PATCH', body: { properties: proprietes } });
  } else {
    const p = commande.payer || {};
    adh = await notion('pages', {
      method: 'POST',
      body: {
        parent: { database_id: BASE_ADHERENTS },
        properties: {
          ...proprietes,
          Nom: val.titre(p.lastName || email),
          'Prénom': val.texte(p.firstName || ''),
          Email: val.email(email),
          'Autres réponses': val.texte(
            "⚠️ Paiement HelloAsso reçu sans fiche correspondante (e-mail différent de celui du formulaire ?). À vérifier et relier à la bonne fiche."
          ),
          ...(fiche ? { 'Fiche annuaire': val.relation([fiche.id]) } : {}),
        },
      },
    });
  }

  if (fiche) {
    await notion(`pages/${fiche.id}`, {
      method: 'PATCH',
      body: { properties: { "Adhésion valide jusqu'au": val.date(valideJusquau) } },
    });
  }

  return { adherent: adh.id, fiche: fiche?.id || null, cotisation, valideJusquau };
}
