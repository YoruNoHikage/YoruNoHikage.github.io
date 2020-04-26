import React from 'react';
import glob from 'glob';
import moment from 'moment';

import Sidebar from '../components/Sidebar';
import Link from 'next/link';

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
    } = article;

    category && categories.push(category);

    if (i > 5) {
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
          <time dateTime={moment(datePublished).format('MMMM D, YYYY')}>
            {moment(datePublished).format('MMMM YYYY')}
          </time>
          <h2
            style={{
              display: 'inline',
              fontSize: '16px',
              marginLeft: '5px',
            }}
          >
            <Link href={slug}>
              <a style={{ borderBottom: 'none' }}>{title}</a>
            </Link>
          </h2>
        </div>
      );
    }

    return (
      <div className="blog-post" key={slug}>
        <time dateTime={moment(datePublished).format('MMMM D, YYYY')}>
          {moment(datePublished).format('MMMM YYYY')}
        </time>
        <ul style={{ display: 'inline-block', margin: '0', padding: '0' }}>
          {categories.map((category) => (
            <li key={category} className="blog-category">{category}</li>
          ))}
        </ul>
        <h2>
          <Link href={slug}>
            <a>{title}</a>
          </Link>
        </h2>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  });

  return (
    <div className="wrapper">
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
  const articlesPaths = glob.sync('articles/**/*.md');

  const articles = await Promise.all(
    articlesPaths.map(async (path) => {
      const folder = path.split('/')[1];
      const splits = folder.match(/(\d{4})-(\d{2})-(\d{2})-(.+)/);
      const slug = splits ? splits.slice(1).join('/') : folder;

      const { content, data } = await import(
        '../articles/' + folder + '/index.md'
      );

      return {
        ...data,
        slug,
        content,
      };
    })
  );

  return {
    props: {
      articles,
    },
  };
}
