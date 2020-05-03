import React from 'react';
import glob from 'glob';
import Head from 'next/head';
import Link from 'next/link';
import moment from 'moment';
import { useRouter } from 'next/router';

import AuthorCard from '../components/AuthorCard';
import avatar from '../images/yorunohikage.png';

export default function Article({
  title,
  path,
  date,
  content,
  lang,
  otherLangs,
  redirectToLang,
}) {
  const { push } = useRouter();

  const dateStyle = {
    textAlign: 'center',
    display: 'block',
    color: 'grey',
    marginBottom: '50px',
  };

  if (redirectToLang) {
    if (typeof window !== 'undefined') push(`/${redirectToLang}/${path}`);

    return (
      <Head>
        <meta httpEquiv="refresh" href={`0;url=/${redirectToLang}/${path}`} />
      </Head>
    );
  }

  return (
    <div>
      <Head>
        <title>{title} - YoruNoHikage</title>

        {otherLangs.length > 0 &&
          [lang, ...otherLangs].map((l) => (
            <link
              rel="alternate"
              hrefLang={l}
              href={'/' + (l !== 'en' ? l + '/' : '') + path}
            />
          ))}
      </Head>

      <div className="top-links">
        <Link href="/">
          <a className="gohome">All Articles</a>
        </Link>

        {otherLangs.length > 0 && (
          <div className="lang-selector">
            {otherLangs.map((l) => (
              <Link
                href="/[...slug]"
                as={'/' + (l !== 'en' ? l + '/' : '') + path}
                hreflang={l}
              >
                <a>{l}</a>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="blog-single">
        <div className="text" lang={lang}>
          <h1>{title}</h1>
          <em style={dateStyle}>
            <time dateTime={date}>{moment(date).format('D MMMM YYYY')}</time>
          </em>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
        <hr />
        <div className="footer">
          <AuthorCard
            name="Alexis Launay"
            username="YoruNoHikage"
            avatar={avatar}
            twitterLink="https://twitter.com/YoruNoHikage"
          >
            Pop punk web developer indie game curious guy!
          </AuthorCard>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps({ params }) {
  const { slug } = params;

  let lang = 'en';
  let articleSlug = slug.join('-');
  let path = slug.join('/');

  if (slug[0].match(/^([a-z]{2})(-[A-Z]{2})?$/)) {
    lang = slug[0];
    articleSlug = slug.slice(1).join('-');
    path = slug.slice(1).join('/');
  }

  const articles = glob.sync('index*.md', {
    cwd: `articles/${articleSlug}/`,
  });

  // redirect
  if (lang === 'en' && !articles.includes('index.md')) {
    const redirectToLang = articles[0].match(/index\.(.+)\.md/)[1];
    return { props: { redirectToLang, path } };
  }

  const otherLangs = articles
    .map((path) =>
      path.includes('index.md') ? 'en' : path.match(/index\.(.+)\.md/)[1]
    )
    .filter((otherLang) => otherLang !== lang);

  try {
    const { content, data } = await import(
      `../articles/${articleSlug}/index${lang === 'en' ? '' : '.' + lang}.md`
    );

    return {
      props: {
        ...data,
        path,
        content,
        lang,
        otherLangs,
      },
    };
  } catch (err) {
    console.log('Couldnt load', articleSlug);
    return {
      props: {},
    };
  }
}

export async function getStaticPaths() {
  const folders = glob.sync('articles/*/');
  const slugs = [];

  for (let folderPath of folders) {
    const dirName = folderPath.split('/')[1];

    // removing the full match
    const splits = dirName.match(/(\d{4})-(\d{2})-(\d{2})-(.+)/);
    const arraySlug = splits ? splits.slice(1) : [slug];

    // finding languages
    const articles = glob.sync('index*.md', { cwd: folderPath });

    if (articles.length === 0) continue;

    // pushing default lang path
    slugs.push(arraySlug);

    if (articles.includes('index.md')) {
      articles.splice(articles.indexOf('index.md'), 1);
    }

    for (let article of articles) {
      const lang = article.match(/.*index\.(.+)\.md/)[1];

      slugs.push([lang, ...arraySlug]);
    }
  }

  return {
    paths: slugs.map((slug) => ({
      params: { slug },
    })),
    fallback: false,
  };
}
