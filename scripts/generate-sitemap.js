const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');

function importAll(r) {
  return r.keys().map((key) => ({ path: key, module: r(key) }));
}

const pages = importAll(require.context('../pages', false, /.jsx$/));

async function generateSitemap() {
  const smStream = new SitemapStream({
    hostname: 'https://blog.yorunohikage.fr',
  });

  await Promise.all(
    pages.map(async ({ path, module }) => {
      // filename starting with _ are ignored
      if (/_[^/]+\.jsx/.test(path)) return;

      // has brackets -> find getStaticPaths or ignore
      if (/\[.+\]\.jsx/.test(path)) {
        const { getStaticPaths } = module;

        if (getStaticPaths) {
          const { paths } = await getStaticPaths();

          paths.forEach(({ params }) => {
            let pathToBuild = path.replace('./', '');
            Object.entries(params).forEach(([key, value]) => {
              const isSplat = Array.isArray(value);
              pathToBuild = pathToBuild.replace(
                `[${isSplat ? '...' : ''}${key}]`,
                isSplat ? value.join('/') : value,
              );
            });

            smStream.write({
              url: pathToBuild.replace('index.jsx', '').replace('.jsx', ''),
            });
          });
        }

        return;
      }

      smStream.write({
        url: path.replace('index.jsx', '').replace('.jsx', ''),
      });
    }),
  );

  smStream.end();

  const sitemap = await streamToPromise(smStream);

  fs.writeFileSync('public/sitemap.xml', sitemap);
}

generateSitemap();
