import React from 'react';
import glob from 'glob';
import Head from 'next/head';
import Link from 'next/link';
import matter from 'gray-matter';
import hydrate from 'next-mdx-remote/hydrate';
import renderToString from 'next-mdx-remote/render-to-string';

import Sidebar from '../components/Sidebar';
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
                  lang,
                  otherLangs,
                } = article;

                const content = hydrate(source, { components });

                return (
                  <div className="blog-post" key={slug}>
                    <time dateTime={datePublished}>
                      {new Date(datePublished).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </time>
                    <ul style={{ display: 'inline-block', margin: '0', padding: '0' }}>
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
                        <li key={l} style={{ display: 'inline', margin: '0 5px' }}>
                          <Link href="/[...slug]" as={`/${slug}`} locale={l}>
                            <a hrefLang={l}>[{l}]</a>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <h2>
                      <Link href="/[...slug]" as={'/' + slug} locale={lang}>
                        <a>{title}</a>
                      </Link>
                    </h2>
                    <div lang={lang}>
                      {content}
                    </div>
                  </div>
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
                  <div
                    key={slug}
                    className="blog-post"
                    style={{
                      margin: '0',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
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
                        <li key={l} style={{ display: 'inline', margin: '0 5px' }}>
                          <Link href="/[...slug]" as={`/${slug}`} locale={l}>
                            <a hrefLang={l}>[{l}]</a>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <h2
                      style={{
                        display: 'inline',
                        fontSize: '16px',
                        marginLeft: '5px',
                      }}
                    >
                      <Link
                        href="/[...slug]"
                        as={'/' + slug}
                        locale={lang}
                      >
                        <a style={{ borderBottom: 'none' }}>
                          {lang !== 'en' && `[${lang}] `}
                          {title}
                        </a>
                      </Link>
                    </h2>
                  </div>
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
      const {default: fileContent} = await import(`../articles/${dirName}/${filename}`);

      ({ content: source, data } = matter(fileContent));

      // prevent building article if we're not going to display it anyway
      if (featuredArticles.length <= 5) {
        content = await renderToString(source, { components });

        featuredArticles.push({
          ...data,
          slug,
          content,
          lang,
          otherLangs,
        });
      }
      else {
        articles.push({
          ...data,
          slug,
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
