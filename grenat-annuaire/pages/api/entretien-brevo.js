// Tâche automatique hebdomadaire (Vercel Cron, voir vercel.json).
// Brevo désactive une clé API après 90 jours sans utilisation : ce petit appel
// (lecture du compte, sans rien modifier ni envoyer) la garde active pour que
// les alertes au CA fonctionnent encore à la rentrée, même après un été sans demande.
// La clé n'a besoin que de l'autorisation « Compte : Lues » en plus de
// « Emails transactionnels : Tous ».

export default async function handler(req, res) {
  const cle = process.env.BREVO_API_KEY;
  if (!cle) return res.status(200).json({ ok: false, raison: 'BREVO_API_KEY non définie' });
  try {
    const r = await fetch('https://api.brevo.com/v3/account', { headers: { 'api-key': cle, accept: 'application/json' } });
    if (!r.ok) console.error('Clé Brevo refusée (expirée ou révoquée ?)', r.status);
    return res.status(200).json({ ok: r.ok, statut: r.status });
  } catch (e) {
    console.error('Brevo injoignable', e);
    return res.status(200).json({ ok: false });
  }
}
