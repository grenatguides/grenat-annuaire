// =============================================================================
//  NOTIFICATION AU CA : nouvelle demande d'adhésion (membre affilié ou partenaire)
// =============================================================================
//
//  Envoie un e-mail via Brevo (e-mail transactionnel) à l'adresse du CA.
//  Variables à définir dans Vercel (Settings > Environment Variables) :
//    BREVO_API_KEY            : clé API Brevo (Brevo > Paramètres > SMTP & API > Clés API)
//    NOTIF_ADHESION_EMAIL     : adresse qui reçoit les alertes (plusieurs : séparées par des virgules)
//    NOTIF_EXPEDITEUR         : (facultatif) expéditeur, par défaut contact@lesguidesgrenat.fr
//
//  Si ces variables ne sont pas définies, rien n'est envoyé (et rien ne casse).
// =============================================================================

const echapper = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function notifierDemande({ categorie, nom, prenom, email, structure, pageId }) {
  const cle = process.env.BREVO_API_KEY;
  const dest = (process.env.NOTIF_ADHESION_EMAIL || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!cle || !dest.length) return { notifie: false };

  const lienNotion = pageId ? `https://www.notion.so/${String(pageId).replace(/-/g, '')}` : '';
  const qui = [prenom, nom].filter(Boolean).join(' ') || email;
  const sujet = `Nouvelle demande d'adhésion – ${categorie} : ${structure || qui}`;
  const html = `
    <p>Bonjour,</p>
    <p>Une nouvelle demande d'adhésion <b>${echapper(categorie)}</b> vient d'arriver et attend la validation du CA.</p>
    <ul>
      ${structure ? `<li>Structure : <b>${echapper(structure)}</b></li>` : ''}
      <li>Nom : ${echapper(qui)}</li>
      <li>E-mail : ${echapper(email)}</li>
    </ul>
    ${lienNotion ? `<p>👉 <a href="${lienNotion}">Voir la fiche dans Notion</a></p>` : ''}
    <p>Si la demande est acceptée, envoyer le lien de paiement HelloAsso à la personne
    (voir le mode d'emploi dans Notion).</p>`;

  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': cle, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Site Grenat', email: process.env.NOTIF_EXPEDITEUR || 'contact@lesguidesgrenat.fr' },
        to: dest.map((e) => ({ email: e })),
        replyTo: email ? { email } : undefined,
        subject: sujet,
        htmlContent: html,
      }),
    });
    if (!r.ok) console.error('Notification Brevo refusée', r.status, await r.text());
    return { notifie: r.ok };
  } catch (e) {
    console.error('Notification Brevo impossible', e);
    return { notifie: false };
  }
}
