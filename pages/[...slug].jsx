import React from 'react';
import glob from 'glob';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import AuthorCard from '../components/AuthorCard';
import avatar from '../images/yorunohikage.png';

const getAbsoluteURL = (lang, path) =>
  `https://blog.yorunohikage.fr/${lang !== 'en' ? lang + '/' : ''}${path}`;

export default function Article({
  title,
  path,
  date,
  content,
  lang,
  otherLangs,
  redirectToLang,
}) {
  const { replace } = useRouter();

  const dateStyle = {
    textAlign: 'center',
    display: 'block',
    color: 'grey',
    marginBottom: '50px',
  };

  if (redirectToLang) {
    // doesn't seem to work with the locale option
    if (typeof window !== 'undefined') replace(`/${redirectToLang}/${path}`);

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
            <link rel="alternate" hrefLang={l} href={getAbsoluteURL(l, path)} />
          ))}

        <meta property="og:locale" content={getAbsoluteURL(lang, path)} />
        {otherLangs.map((l) => (
          <meta
            property="og:locale:alternate"
            content={getAbsoluteURL(l, path)}
          />
        ))}

        <meta property="og:title" content={title} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={getAbsoluteURL(lang, path)} />

        <meta name="twitter:card" content="summary" />
      </Head>

      <div className="top-links">
        <Link href="/" locale={false}>
          <a className="gohome">All Articles</a>
        </Link>

        {otherLangs.length > 0 && (
          <div className="lang-selector">
            {otherLangs.map((l) => (
              <Link
                href="/[...slug]"
                href={'/' + path}
                locale={l}
              >
                <a hrefLang={l}>{l}</a>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="blog-single">
        <div className="text" lang={lang}>
          <h1>{title}</h1>
          <em style={dateStyle}>
            <time dateTime={date}>
              {new Date(date).toLocaleDateString(lang, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
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

export async function getStaticProps({ defaultLocale, locale, params }) {
  const { slug } = params;

  let articleSlug = slug.join('-');
  let path = slug.join('/');

  const articles = glob.sync('index*.md', {
    cwd: `articles/${articleSlug}/`,
  });

  // redirect
  if (locale === defaultLocale && !articles.includes('index.md')) {
    const redirectToLang = articles[0].match(/index\.(.+)\.md/)[1];
    return { props: { redirectToLang, path } };
  }

  const otherLangs = articles
    .map((path) =>
      path.includes('index.md') ? defaultLocale : path.match(/index\.(.+)\.md/)[1]
    )
    .filter((otherLang) => otherLang !== locale);

  try {
    const { content, data } = await import(
      `../articles/${articleSlug}/index${locale === defaultLocale ? '' : '.' + locale}.md`
    );

    return {
      props: {
        ...data,
        path,
        content,
        lang: locale,
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
  const paths = [];

  for (let folderPath of folders) {
    const dirName = folderPath.split('/')[1];

    // removing the full match
    const splits = dirName.match(/(\d{4})-(\d{2})-(\d{2})-(.+)/);
    const arraySlug = splits ? splits.slice(1) : [slug];

    // finding languages
    const articles = glob.sync('index*.md', { cwd: folderPath });

    if (articles.length === 0) continue;

    // pushing default lang path
    paths.push({params: {slug: arraySlug}, locale: 'en'});

    if (articles.includes('index.md')) {
      articles.splice(articles.indexOf('index.md'), 1);
    }

    for (let article of articles) {
      const lang = article.match(/.*index\.(.+)\.md/)[1];

      paths.push({params: {slug: arraySlug}, locale: lang});
    }
  }

  return {
    paths,
    fallback: false,
  };
}
