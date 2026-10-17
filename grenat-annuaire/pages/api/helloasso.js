// Reçoit les notifications HelloAsso (paiements) et valide l'adhésion dans Notion.
// Toute la logique est dans lib/helloasso.js.
//
// À configurer dans HelloAsso : Mon compte > Intégrations et API >
//   URL de notification = https://annuaire.lesguidesgrenat.fr/api/helloasso
// Variables Vercel : HELLOASSO_CLIENT_ID, HELLOASSO_CLIENT_SECRET, NOTION_ADHESIONS_TOKEN
//
// Sécurité : on ne fait jamais confiance au contenu reçu. La commande est
// relue directement chez HelloAsso avec nos identifiants avant toute écriture.
// En cas d'erreur, HelloAsso renvoie la notification pendant environ 27 heures.

import { traiterNotification } from '../../lib/helloasso';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erreur: 'POST uniquement' });
  try {
    const r = await traiterNotification(req.body);
    console.log('Notification HelloAsso', req.body?.eventType, r);
    return res.status(200).json({ ok: true, ...r });
  } catch (e) {
    console.error('Échec notification HelloAsso', req.body?.eventType, e);
    return res.status(500).json({ erreur: e.message });
  }
}
