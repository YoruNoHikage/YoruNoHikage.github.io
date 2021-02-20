import React, { useState } from 'react';
import glob from 'glob';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import hydrate from 'next-mdx-remote/hydrate';
import renderToString from 'next-mdx-remote/render-to-string';
import matter from 'gray-matter';

import AuthorCard from '../components/AuthorCard';

const components = (slug) => ({
  pre: (props) => <div {...props} />,
  code: dynamic(() => import('../components/CodeBlock')),
  Gallery: dynamic(() => import('../components/Gallery')),
  Video: dynamic(() => import('../components/Video')),
  YouTube: dynamic(() => import('react-youtube')),
  Tweet: dynamic(() =>
    import('react-twitter-embed').then((mod) => mod.TwitterTweetEmbed)
  ),
  img: ({ src, alt }) => {
    if (src.startsWith('http')) return <img src={src} alt={alt} />;

    let importedSrc = '';

    try {
      const getImages = require.context('../articles/', true, /\.(svg|png|jpe?g|gif)$/);

      importedSrc = getImages('./' + slug + '/' + src).default;
    } catch (err) {
      console.error(`Error loading image '../articles/${slug}/${src}'`, err);
    }

    // TODO: better way to scale image
    return (
      <div className="aspect-ratio-box" style={{ position: 'relative' }}>
        <Image src={importedSrc} alt={alt} layout="fill" />
      </div>
    );
  },
});

const baseUrl = 'https://blog.yorunohikage.fr';

const getAbsoluteURL = (lang, slug) =>
  `https://blog.yorunohikage.fr/${lang !== 'en' ? lang + '/' : ''}${slug}`;

export default function Article({
  title,
  slug,
  path,
  date,
  ogImage,
  ogImageAlt,
  content: source,
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
    if (typeof window !== 'undefined') replace(`/${redirectToLang}/${slug}`);

    return (
      <Head>
        <meta httpEquiv="refresh" href={`0;url=/${redirectToLang}/${slug}`} />
      </Head>
    );
  }

  const content = hydrate(source, { components: components(path) });

  return (
    <div>
      <Head>
        <title>{title} - YoruNoHikage</title>

        {otherLangs.length > 0 &&
          [lang, ...otherLangs].map((l) => (
            <link key={l} rel="alternate" hrefLang={l} href={getAbsoluteURL(l, slug)} />
          ))}

        <meta property="og:locale" content={getAbsoluteURL(lang, slug)} />
        {otherLangs.map((l) => (
          <meta
            property="og:locale:alternate"
            content={getAbsoluteURL(l, slug)}
          />
        ))}

        <meta property="og:title" content={title} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={getAbsoluteURL(lang, slug)} />
        {ogImage && <meta property="og:image" content={baseUrl + ogImage} />}
        {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}

        <meta
          name="twitter:card"
          content={ogImage ? 'summary_large_image' : 'summary'}
        />
        {ogImage && <meta name="twitter:image" content={baseUrl + ogImage} />}
        {ogImageAlt && <meta name="twitter:image:alt" content={ogImageAlt} />}
      </Head>

      <div className="top-links">
        <Link href="/" locale={false}>
          <a className="gohome">All Articles</a>
        </Link>

        {otherLangs.length > 0 && (
          <div className="lang-selector">
            {otherLangs.map((l) => (
              <Link href="/[...slug]" href={'/' + slug} locale={l}>
                <a hrefLang={l}>{l}</a>
              </Link>
            ))}
          </div>
        )}
      </div>

      <article className="blog-single" lang={lang}>
        <header>
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
        </header>
        {content}
        <footer className="footer" lang="en">
          <hr />
          <AuthorCard
            name="Alexis Launay"
            username="YoruNoHikage"
            avatar="/images/yorunohikage.png"
            twitterLink="https://twitter.com/YoruNoHikage"
          >
            Pop punk web developer indie game curious guy!
          </AuthorCard>
        </footer>
      </article>
    </div>
  );
}

export async function getStaticProps({ defaultLocale, locale, params }) {
  const { slug } = params;

  let articleSlug = slug.join('-');
  let path = slug.join('/');

  const articles = glob.sync('index*.@(md|mdx)', {
    cwd: `articles/${articleSlug}/`,
  });

  // redirect
  if (
    locale === defaultLocale &&
    !articles.includes('index.md') &&
    !articles.includes('index.mdx')
  ) {
    const redirectToLang = articles[0].match(/index\.(.+)\.mdx?/)[1];
    return { props: { redirectToLang, path } };
  }

  const otherLangs = articles
    .map((path) =>
      path.includes('index.md')
        ? defaultLocale
        : path.match(/index\.(.+)\.mdx?/)[1]
    )
    .filter((otherLang) => otherLang !== locale);

  const isMDX = articles.includes(
    `index${locale === 'en' ? '' : '.' + locale}.mdx`
  );

  try {
    const { default: fileContent } = await import(
      `../articles/${articleSlug}/index${
        locale === defaultLocale ? '' : '.' + locale
      }.${isMDX ? 'mdx' : 'md'}`
    );

    let firstImage, firstImageAlt;
    const { content: source, data } = matter(fileContent);

    const content = await renderToString(source, {
      components: components(articleSlug),
      scope: data,
    });

    // match the first image in the document
    // const [, firstImage, firstImageAlt] = content.match(/<img[^>]+src="([^"]+)"[^>]+alt="([^"]+)"/i) || [];

    return {
      props: {
        ...data,
        ogImage: data.cover || firstImage || null,
        ogImageAlt: data.coverAlt || firstImageAlt || null,
        slug: path,
        path: articleSlug,
        content,
        lang: locale,
        otherLangs,
      },
    };
  } catch (err) {
    console.log('Couldnt load', articleSlug, err);
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
    const articles = glob.sync('index*.+(md|mdx)', { cwd: folderPath });

    if (articles.length === 0) continue;

    // pushing default lang path
    paths.push({ params: { slug: arraySlug }, locale: 'en' });

    if (articles.includes('index.mdx')) {
      articles.splice(articles.indexOf('index.mdx'), 1);
    } else if (articles.includes('index.md')) {
      articles.splice(articles.indexOf('index.md'), 1);
    }

    for (let article of articles) {
      const lang = article.match(/.*index\.(.+)\.mdx?/)[1];

      paths.push({ params: { slug: arraySlug }, locale: lang });
    }
  }

  return {
    paths,
    fallback: false,
  };
}
