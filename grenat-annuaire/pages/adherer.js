import Head from 'next/head';

// Page « Adhérer » : les liens vers les formulaires d'adhésion.
// Pour changer un tarif ou un texte, modifier la liste ci-dessous.
const FORMULES = [
  {
    titre: 'Membre actif',
    prix: '40 €',
    pour: 'Vous êtes titulaire de la carte professionnelle de guide-conférencier. Vous votez à l\u2019assemblée générale.',
    plus: ['Votre fiche dans l’annuaire des guides', 'Vos visites dans l’agenda', 'La vie de l’association : AG, éductours, JIG…'],
    lien: 'https://tally.so/r/zxpZ4M',
    bouton: 'Adhérer comme guide',
  },
  {
    titre: 'Membre affilié',
    prix: '25 €',
    pour: 'Vous n’avez pas la carte professionnelle (formation, VAE, équivalence…), ou vous l’avez mais ne souhaitez pas être membre actif (par exemple salarié·e).',
    plus: ['La vie de l’association : AG, éductours, JIG…', 'Les informations du réseau'],
    lien: 'https://tally.so/r/zxpZ4M',
    bouton: 'Adhérer comme affilié·e',
  },
  {
    titre: 'Membre partenaire',
    prix: '100 €',
    pour: 'Vous êtes une structure (office de tourisme, musée, agence, entreprise…) et souhaitez soutenir les guides.',
    plus: ['Votre logo sur notre site (si vous le souhaitez)', 'Le macaron « Je soutiens Grenat »'],
    lien: 'https://tally.so/r/Qo1dbG',
    bouton: 'Devenir partenaire',
  },
];

export default function Adherer() {
  return (
    <>
      <Head>
        <title>Adhérer — Les guides Grenat</title>
        <meta name="description" content="Adhérez à Grenat, l'association des guides-conférenciers d'Auvergne-Rhône-Alpes : guides, membres affiliés et partenaires." />
      </Head>
      <header className="hero">
        <div className="container">
          <p className="eyebrow">Adhésion 2027</p>
          <h1>Rejoindre Grenat</h1>
          <p className="intro">
            Remplissez le formulaire qui vous correspond. Les membres actifs règlent ensuite leur
            cotisation sur HelloAsso ; les demandes des membres affiliés et partenaires sont d&#39;abord
            examinées par le conseil d&#39;administration, qui envoie ensuite le lien de paiement.
            L&#39;adhésion est valable jusqu&#39;au 31 décembre 2027.
          </p>
        </div>
      </header>
      <main className="container corps">
        <div className="grille">
          {FORMULES.map((f) => (
            <article key={f.titre} className="carte">
              <h2>{f.titre}</h2>
              <p className="prix">{f.prix}<span> / an</span></p>
              <p className="pour">{f.pour}</p>
              <ul>{f.plus.map((x) => <li key={x}>{x}</li>)}</ul>
              <a className="bouton" href={f.lien} target="_blank" rel="noopener noreferrer">{f.bouton}</a>
              {f.note && <p className="note">{f.note}</p>}
            </article>
          ))}
        </div>
        <p className="aide">
          Déjà adhérent·e en 2026 ? Utilisez de préférence le lien personnel reçu par e-mail :
          vos informations y sont déjà remplies.
        </p>
      </main>
      <style jsx>{`
        .hero { background: linear-gradient(180deg, var(--bg2) 0%, var(--bg) 100%); border-bottom: 1px solid var(--border); padding: 48px 0 40px; }
        .eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--magenta); margin-bottom: 8px; }
        h1 { font-family: 'Fugaz One', cursive; font-weight: 400; font-size: clamp(36px, 6vw, 60px); line-height: 1; text-transform: uppercase; margin-bottom: 16px; }
        .intro { color: #C8C7E8; max-width: 640px; }
        .corps { padding-top: 40px; padding-bottom: 48px; max-width: 1080px; }
        .grille { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .carte { display: flex; flex-direction: column; padding: 28px 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
        h2 { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
        .prix { font-family: 'Fugaz One', cursive; font-size: 34px; color: var(--cyan); margin-bottom: 12px; }
        .prix span { font-family: inherit; font-size: 14px; color: var(--muted); }
        .pour { color: #C8C7E8; font-size: 15px; line-height: 1.55; margin-bottom: 14px; }
        ul { list-style: none; padding: 0; margin: 0 0 22px; flex: 1; }
        li { font-size: 14px; color: var(--muted); padding: 4px 0 4px 20px; position: relative; }
        li::before { content: '✓'; position: absolute; left: 0; color: var(--pink); }
        .bouton { text-align: center; background: var(--magenta); color: var(--white); font-weight: 500; padding: 11px 18px; border-radius: 999px; transition: filter 0.15s; }
        .bouton:hover { filter: brightness(1.15); }
        .note { font-size: 12.5px; color: var(--muted); margin-top: 10px; text-align: center; }
        .aide { margin-top: 28px; font-size: 14px; color: var(--muted); text-align: center; }
      `}</style>
    </>
  );
}
