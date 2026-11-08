import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { SiteHeader, SiteFooter } from '../components/SiteChrome';

export default function App({ Component, pageProps }) {
  const { pathname } = useRouter();
  const embed = pathname.startsWith('/embed');

  // Pages intégrées dans Framer : on signale leur hauteur à la page parente
  useEffect(() => {
    if (!embed || window.parent === window) return;
    const envoyer = () => window.parent.postMessage({ grenatHauteur: document.body.scrollHeight }, '*');
    envoyer();
    const obs = new ResizeObserver(envoyer);
    obs.observe(document.body);
    return () => obs.disconnect();
  }, [embed]);

  if (embed) return <Component {...pageProps} />;
  return (
    <>
      <a href="#contenu" className="lien-evitement">Aller au contenu</a>
      <SiteHeader />
      <div id="contenu" tabIndex={-1}>
        <Component {...pageProps} />
      </div>
      <SiteFooter />
    </>
  );
}
