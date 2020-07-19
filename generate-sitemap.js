const fs = require('fs');
const glob = require('glob');
const { SitemapStream, streamToPromise } = require('sitemap');

async function generateSitemap() {
  const pagesPaths = glob.sync('**/**.html', { cwd: 'out' });
  console.log('sync cwd', pagesPaths);
  console.log('sync folder', glob.sync('out/**/**.html'));

  glob('out/**/**.html', {}, (err, files) => {
    console.log('async folder', files, err);
  });

  const smStream = new SitemapStream({
    hostname: 'https://blog.yorunohikage.fr',
  });

  pagesPaths.forEach((path) => {
    smStream.write({
      url: path
        .replace('/index.html', '')
        .replace('index.html', '')
        .replace('.html', ''),
    });
  });

  smStream.end();

  const sitemap = await streamToPromise(smStream);

  fs.writeFileSync('public/sitemap.xml', sitemap);
}

generateSitemap();
