import React from 'react';
import glob from 'glob';
import Head from 'next/head';
import Link from 'next/link';

import Sidebar from '../components/Sidebar';
import dynamic from 'next/dynamic';

const componentList = {};

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
                  content,
                  date: datePublished,
                  category,
                  categories = [],
                  slug,
                  folder,
                  lang,
                  otherLangs,
                } = article;

                let Content = () => null;

                if (!content) {
                  const filename = `index${lang === 'en' ? '' : '.' + lang}.mdx`;
                  Content = (componentList[filename] && componentList[filename].default) || dynamic(() => import(`../articles/${folder}/index${lang === 'en' ? '' : '.' + lang}.mdx`));
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
                    {content ? <div lang={lang} dangerouslySetInnerHTML={{ __html: content }} /> : <Content />}
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

    let data, content;

    try {
      const fileContent = await import(`../articles/${dirName}/${filename}`);

      ({ data, default: content } = fileContent);

      componentList[dirName] = fileContent;
    } catch (err) {
      console.log('Error when importing article', err);
      continue;
    }

    const otherLangs = articlesPaths.map(
      (article) => article.match(/.*index\.(.+)\.mdx?/)[1]
    );

    if (featuredArticles.length <= 5) {
      featuredArticles.push({
        ...data,
        slug,
        folder: dirName,
        content: !filename.includes('.mdx') && content,
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
  }

  return {
    props: {
      articles,
      featuredArticles,
    },
  };
}
