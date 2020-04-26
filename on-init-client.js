export default async function initClient({ router }) {
  router.events.on('routeChangeComplete', (url) => {
    setTimeout(() => {
      window.gtag('config', 'UA-49971705-2', {
        page_location: url,
        page_title: document.title,
      });
    }, 0);
  });
}
