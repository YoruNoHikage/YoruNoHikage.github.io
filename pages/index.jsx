import React from 'react';
import glob from 'glob';
import Head from 'next/head';
import Link from 'next/link';

import Sidebar from '../components/Sidebar';

export default function Home({ articles }) {
  const sortedArticles = [...articles];

  sortedArticles.reverse();
  // sortedArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

  const formattedArticles = sortedArticles.map((article, i) => {
    const {
      title,
      content,
      date: datePublished,
      category,
      categories = [],
      slug,
      lang,
      otherLangs,
    } = article;

    category && categories.push(category);

    if (i >= 5) {
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
                <Link href="/[...slug]" as={`/${l}/${slug}`}>
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
              as={'/' + (lang === 'en' ? '' : lang + '/') + slug}
            >
              <a style={{ borderBottom: 'none' }}>
                {lang !== 'en' && `[${lang}] `}
                {title}
              </a>
            </Link>
          </h2>
        </div>
      );
    }

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
              <Link href="/[...slug]" as={`/${l}/${slug}`}>
                <a hrefLang={l}>[{l}]</a>
              </Link>
            </li>
          ))}
        </ul>
        <h2>
          <Link href="/[...slug]" as={'/' + slug}>
            <a>{title}</a>
          </Link>
        </h2>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  });

  return (
    <div className="wrapper">
      <Head>
        <title>YoruNoHikage's blog</title>
      </Head>

      <div>
        <Sidebar />
        <div className="content">
          <div className="main">
            <div className="main-inner">{formattedArticles}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const folders = glob.sync('articles/*/');
  const articles = [];

  for (let folderPath of folders) {
    const dirName = folderPath.split('/')[1];

    // removing the full match
    const splits = dirName.match(/(\d{4})-(\d{2})-(\d{2})-(.+)/);
    const slug = splits ? splits.slice(1).join('/') : folder;

    // finding languages
    const articlesPaths = glob.sync('index*.md', { cwd: folderPath });

    if (articlesPaths.length === 0) continue;

    let filename = 'index.md';
    let lang = 'en';

    if (articlesPaths.includes('index.md')) {
      articlesPaths.splice(articlesPaths.indexOf('index.md'), 1);
    } else {
      filename = articlesPaths[0];
      lang = filename.match(/.*index\.(.+)\.md/)[1];
      articlesPaths.pop();
    }

    let data, content;

    try {
      ({ data, content } = await import(`../articles/${dirName}/${filename}`));
    } catch (err) {
      console.log('Error when importing article', err);
      continue;
    }

    const otherLangs = articlesPaths.map(
      (article) => article.match(/.*index\.(.+)\.md/)[1]
    );

    articles.push({
      ...data,
      slug,
      content,
      lang,
      otherLangs,
    });
  }

  return {
    props: {
      articles,
    },
  };
}
