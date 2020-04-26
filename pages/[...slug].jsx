import React from 'react';
import glob from 'glob';
import Link from 'next/link';
import moment from 'moment';

import AuthorCard from '../components/AuthorCard';
import avatar from '../images/yorunohikage.png';

export default function Article({ title, date, content }) {
  const dateStyle = {
    textAlign: 'center',
    display: 'block',
    color: 'grey',
    marginBottom: '50px',
  };

  return (
    <div className="wrapper">
      <div>
        <div>
          <Link href="/">
            <a className="gohome">All Articles</a>
          </Link>
        </div>
        <div className="blog-single">
          <div className="text">
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
    </div>
  );
}

export async function getStaticProps({ params }) {
  const { slug } = params;

  try {
    const {content, data} = await import(`../articles/${slug.join('-')}/index.md`);

    return {
      props: {
        ...data,
        content,
      },
    };
  } catch (err) {
    console.log('Couldnt load', slug);
    return {
      props: {},
    };
  }
}

export async function getStaticPaths() {
  const articles = glob.sync('articles/**/*.md');

  const slugs = articles.map((file) => file.split('/')[1]);
  const splittedSlugs = slugs.map((slug) => {
    // removing the full match
    const splits = slug.match(/(\d{4})-(\d{2})-(\d{2})-(.+)/);

    return splits ? splits.slice(1) : [slug];
  });

  return {
    paths: splittedSlugs.map((slug) => ({
      params: { slug },
    })),
    fallback: false,
  };
}
