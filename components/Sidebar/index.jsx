import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Nav from '../Nav';
import SiteLinks from '../SiteLinks';
import avatar from '../../images/yorunohikage.png';

export default function Sidebar() {
  const router = useRouter();
  const isHome = router.pathname === '/';

  // const allCategories = new Set()
  // this.props.route.pages.forEach(({ data: {category, categories = []} }) => {
  //   category && categories.push(category)

  //   categories.forEach(cat => allCategories.add(cat))
  // })

  const title = (
    <Link href="/" locale={false}>
      <a
        style={{
          textDecoration: 'none',
          borderBottom: 'none',
          color: 'inherit',
        }}
      >
        Alexis Launay
        <span style={{ color: 'grey', fontSize: '14px', fontWeight: '100' }}>
          {' '}
          - @YoruNoHikage
        </span>
      </a>
    </Link>
  );

  return (
    <div className="sidebar">
      <div className="sidebar-inner">
        <div className="blog-details">
          <header>
            <Link href="/" locale={false}>
              <a
                style={{
                  textDecoration: 'none',
                  borderBottom: 'none',
                  outline: 'none',
                }}
              >
                <img
                  src={avatar}
                  width="75"
                  height="75"
                  alt="Profile picture of the author"
                />
              </a>
            </Link>
            {isHome ? <h1>{title}</h1> : <h2>{title}</h2>}
            <p>Pop punk web developer indie game curious guy!</p>
          </header>
        </div>
        <div className="blog-options">
          <Nav />
          <footer>
            <SiteLinks />
            <p className="copyright">
              Made with Next.
              <br />
              Based on Gatsby Lumen theme.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
