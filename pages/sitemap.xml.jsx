import { SitemapStream, streamToPromise } from 'sitemap';
import { createGzip } from 'zlib';
import glob from 'glob';

const addUrls = async (smStream) => {
  const pagesPaths = glob.sync('**/**.jsx', { cwd: 'pages' });

  return Promise.all(pagesPaths.map(async (path) => {
    // filename starting with _ are ignored
    if (/_[^/]+\.jsx/.test(path)) return;

    // has brackets -> find getStaticPaths or ignore
    if (/\[.+\]\.jsx/.test(path)) {
      const { getStaticPaths } = await import('./' + path);

      if (getStaticPaths) {
        const { paths } = await getStaticPaths();

        paths.forEach(({params}) => {
          let pathToBuild = path;
          Object.entries(params).forEach(([key, value]) => {
            const isSplat = Array.isArray(value);
            pathToBuild = pathToBuild.replace(`[${isSplat ? '...' : ''}${key}]`, isSplat ? value.join('/') : value);
          });

          smStream.write({ url: pathToBuild.replace('index.jsx', '').replace('.jsx', '') });
        });
      }

      return;
    }

    smStream.write({ url: path.replace('index.jsx', '').replace('.jsx', '') });
  }));
};

let sitemap = null;

export const getServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'application/xml;charset=utf-8');
  res.setHeader('Content-Encoding', 'gzip');

  // If our sitemap is cached, we write the cached sitemap, no query to the CMS.
  if (sitemap) {
    res.write(sitemap);
    res.end();
  }

  const smStream = new SitemapStream({
    hostname: 'https://blog.yorunohikage.fr',
  });

  const pipeline = smStream.pipe(createGzip());

  try {
    await addUrls(smStream);
    smStream.end();
    const resp = await streamToPromise(pipeline);
    // cache the sitemap response (cache will be gone on next build)
    // This cache is only useful if your content is static, and you must build the next app on every content change in the cms
    sitemap = resp;
    res.write(resp);
    res.end();
  } catch (error) {
    console.log(error);
    res.statusCode = 500;
    res.write('Could not generate sitemap.');
    res.end();
  }

  return {
    props: {},
  };
};

export default () => null;