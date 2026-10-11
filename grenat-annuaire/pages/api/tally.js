// Reçoit chaque réponse du formulaire d'adhésion envoyée par Tally (webhook)
// et l'enregistre dans Notion. Toute la logique est dans lib/adhesions.js.
//
// Variables à définir dans Vercel (Settings > Environment Variables) :
//   NOTION_ADHESIONS_TOKEN : clé de la connexion Notion « Adhésions Grenat »
//   TALLY_SIGNING_SECRET   : « Signing secret » indiqué par Tally pour ce webhook
//
// En cas d'erreur, Tally affiche l'échec dans Intégrations > Webhooks et
// permet de renvoyer la réponse en un clic : rien n'est perdu.

import crypto from 'crypto';
import { enregistrerReponse } from '../../lib/adhesions';

export const config = { api: { bodyParser: false }, maxDuration: 60 };

async function lireCorps(req) {
  const morceaux = [];
  for await (const m of req) morceaux.push(m);
  return Buffer.concat(morceaux);
}

function signatureValide(corps, signature) {
  const secret = process.env.TALLY_SIGNING_SECRET;
  if (!secret || !signature) return false; // sécurité : on refuse tant que le secret n'est pas configuré
  const attendu = crypto.createHmac('sha256', secret).update(corps).digest('base64');
  const a = Buffer.from(attendu);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erreur: 'POST uniquement' });

  const corps = await lireCorps(req);
  if (!signatureValide(corps, req.headers['tally-signature'])) {
    return res.status(401).json({ erreur: 'Signature Tally invalide' });
  }

  let payload;
  try {
    payload = JSON.parse(corps.toString('utf8'));
  } catch {
    return res.status(400).json({ erreur: 'JSON invalide' });
  }
  if (payload.eventType && payload.eventType !== 'FORM_RESPONSE') return res.status(200).json({ ignore: true });

  try {
    const r = await enregistrerReponse(payload);
    console.log('Réponse enregistrée', payload?.data?.responseId, r);
    return res.status(200).json({ ok: true, ...r });
  } catch (e) {
    console.error('Échec enregistrement', payload?.data?.responseId, e);
    return res.status(500).json({ erreur: e.message });
  }
}
