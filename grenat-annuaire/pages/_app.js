import '../styles/globals.css';
import { SiteHeader, SiteFooter } from '../components/SiteChrome';

export default function App({ Component, pageProps }) {
  return (
    <>
      <SiteHeader />
      <Component {...pageProps} />
      <SiteFooter />
    </>
  );
}
