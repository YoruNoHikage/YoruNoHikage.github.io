import React from 'react';
import glob from 'glob';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import hydrate from 'next-mdx-remote/hydrate'
import renderToString from 'next-mdx-remote/render-to-string';
import matter from 'gray-matter';

import AuthorCard from '../components/AuthorCard';
import avatar from '../images/yorunohikage.png';
import CodeBlock from '../components/CodeBlock';
import Gallery from '../components/Gallery';
import Video from '../components/Video';
import YouTube from 'react-youtube';
import { TwitterTweetEmbed as Tweet } from 'react-twitter-embed';

const components = {
  pre: props => <div {...props} />,
  code: CodeBlock,
  Gallery,
  Video,
  YouTube,
  Tweet,
};

const baseUrl = 'https://blog.yorunohikage.fr';

const getAbsoluteURL = (lang, path) =>
  `https://blog.yorunohikage.fr/${lang !== 'en' ? lang + '/' : ''}${path}`;

export default function Article({
  title,
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
    if (typeof window !== 'undefined') replace(`/${redirectToLang}/${path}`);

    return (
      <Head>
        <meta httpEquiv="refresh" href={`0;url=/${redirectToLang}/${path}`} />
      </Head>
    );
  }

  const content = hydrate(source, { components });

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
        {ogImage && <meta property="og:image" content={baseUrl + ogImage} />}
        {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}

        <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
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
          {content}
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

  const articles = glob.sync('index*.@(md|mdx)', {
    cwd: `articles/${articleSlug}/`,
  });

  // redirect
  if (locale === defaultLocale && !articles.includes('index.md') && !articles.includes('index.mdx')) {
    const redirectToLang = articles[0].match(/index\.(.+)\.mdx?/)[1];
    return { props: { redirectToLang, path } };
  }

  const otherLangs = articles
    .map((path) =>
      path.includes('index.md') ? defaultLocale : path.match(/index\.(.+)\.mdx?/)[1]
    )
    .filter((otherLang) => otherLang !== locale);

  const isMDX = articles.includes(`index${locale === 'en' ? '' : '.' + locale}.mdx`);

  try {
    const { default: fileContent } = await import(
      `../articles/${articleSlug}/index${locale === defaultLocale ? '' : '.' + locale}.${isMDX ? 'mdx' : 'md'}`
    );

    let firstImage, firstImageAlt;
    const { content: source, data } = matter(fileContent);

    const content = await renderToString(source, { components, scope: data });

    // match the first image in the document
    // const [, firstImage, firstImageAlt] = content.match(/<img[^>]+src="([^"]+)"[^>]+alt="([^"]+)"/i) || [];

    return {
      props: {
        ...data,
        ogImage: data.cover || firstImage || null,
        ogImageAlt: data.coverAlt || firstImageAlt || null,
        path,
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
    paths.push({params: {slug: arraySlug}, locale: 'en'});

    if (articles.includes('index.mdx')) {
      articles.splice(articles.indexOf('index.mdx'), 1);
    } else if (articles.includes('index.md')) {
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
