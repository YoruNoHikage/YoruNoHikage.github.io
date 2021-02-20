import React, { useState } from 'react';
import glob from 'glob';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import matter from 'gray-matter';
import hydrate from 'next-mdx-remote/hydrate';
import renderToString from 'next-mdx-remote/render-to-string';

import Sidebar from '../components/Sidebar';

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

export default function Home({ articles, featuredArticles }) {
  return (
    <div className="wrapper">
      <Head>
        <title>YoruNoHikage's blog</title>
      </Head>

      <div>
        <Sidebar />
        <div className="content">
          <div className="main">
            <div className="main-inner">
              {featuredArticles.map((article) => {
                const {
                  title,
                  content: source,
                  date: datePublished,
                  category,
                  categories = [],
                  slug,
                  path,
                  lang,
                  otherLangs,
                } = article;

                const content = hydrate(source, {
                  components: components(path),
                });

                return (
                  <article className="blog-post" key={slug} lang={lang}>
                    <header>
                      <time dateTime={datePublished}>
                        {new Date(datePublished).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </time>
                      <ul
                        style={{
                          display: 'inline-block',
                          margin: '0',
                          padding: '0',
                        }}
                      >
                        {categories.map((category) => (
                          <li key={category} className="blog-category">
                            {category}
                          </li>
                        ))}
                      </ul>
                      <ul
                        style={{
                          padding: '0',
                          margin: '5px 0',
                          listStyle: 'none',
                          float: 'right',
                        }}
                      >
                        {otherLangs.map((l) => (
                          <li
                            key={l}
                            style={{ display: 'inline', margin: '0 5px' }}
                          >
                            <Link href="/[...slug]" as={`/${slug}`} locale={l}>
                              <a hrefLang={l}>[{l}]</a>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <h1>
                        <Link href="/[...slug]" as={'/' + slug} locale={lang}>
                          <a>{title}</a>
                        </Link>
                      </h1>
                    </header>
                    {content}
                  </article>
                );
              })}

              {articles.map((article, i) => {
                const {
                  title,
                  date: datePublished,
                  category,
                  categories = [],
                  slug,
                  lang,
                  otherLangs,
                } = article;

                category && categories.push(category);

                return (
                  <article
                    key={slug}
                    className="blog-post"
                    style={{
                      margin: '0',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <header>
                      <time dateTime={datePublished}>
                        {new Date(datePublished).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </time>
                      <ul
                        style={{
                          padding: '0',
                          margin: '0',
                          listStyle: 'none',
                          float: 'right',
                        }}
                      >
                        {otherLangs.map((l) => (
                          <li
                            key={l}
                            style={{ display: 'inline', margin: '0 5px' }}
                          >
                            <Link href="/[...slug]" as={`/${slug}`} locale={l}>
                              <a hrefLang={l}>[{l}]</a>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <h1
                        style={{
                          display: 'inline',
                          fontSize: '16px',
                          marginLeft: '5px',
                        }}
                      >
                        <Link href="/[...slug]" as={'/' + slug} locale={lang}>
                          <a style={{ borderBottom: 'none' }}>
                            {lang !== 'en' && `[${lang}] `}
                            {title}
                          </a>
                        </Link>
                      </h1>
                    </header>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps({ defaultLocale, locale }) {
  if (locale !== defaultLocale) {
    return {
      notFound: true,
    };
  }

  const folders = glob.sync('articles/*/').reverse();
  const articles = [];
  const featuredArticles = [];

  for (let folderPath of folders) {
    const dirName = folderPath.split('/')[1];

    // removing the full match
    const splits = dirName.match(/(\d{4})-(\d{2})-(\d{2})-(.+)/);
    const slug = splits ? splits.slice(1).join('/') : folder;

    // finding languages
    const articlesPaths = glob.sync('index*.+(md|mdx)', { cwd: folderPath });

    if (articlesPaths.length === 0) continue;

    let filename = 'index.md';
    let lang = 'en';

    if (articlesPaths.includes('index.mdx')) {
      filename = 'index.mdx';
      articlesPaths.splice(articlesPaths.indexOf('index.mdx'), 1);
    } else if (articlesPaths.includes('index.md')) {
      articlesPaths.splice(articlesPaths.indexOf('index.md'), 1);
    } else {
      filename = articlesPaths[0];
      lang = filename.match(/.*index\.(.+)\.mdx?/)[1];
      articlesPaths.pop();
    }

    const otherLangs = articlesPaths.map(
      (article) => article.match(/.*index\.(.+)\.mdx?/)[1]
    );

    let data, content, source;

    try {
      const { default: fileContent } = await import(
        `../articles/${dirName}/${filename}`
      );

      ({ content: source, data } = matter(fileContent));

      // prevent building article if we're not going to display it anyway
      if (featuredArticles.length <= 5) {
        content = await renderToString(source, {
          components: components(dirName),
        });

        featuredArticles.push({
          ...data,
          slug,
          path: dirName,
          content,
          lang,
          otherLangs,
        });
      } else {
        articles.push({
          ...data,
          slug,
          path: dirName,
          lang,
          otherLangs,
        });
      }
    } catch (err) {
      console.log('Error when importing article', err);
      continue;
    }
  }

  return {
    props: {
      articles,
      featuredArticles,
    },
  };
}
