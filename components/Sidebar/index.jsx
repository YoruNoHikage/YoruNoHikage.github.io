import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Nav from '../Nav';
import SiteLinks from '../SiteLinks';

export default function Sidebar() {
  const router = useRouter();
  const isHome = router.pathname === '/';

  // const allCategories = new Set()
  // this.props.route.pages.forEach(({ data: {category, categories = []} }) => {
  //   category && categories.push(category)

  //   categories.forEach(cat => allCategories.add(cat))
  // })

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
                <Image
                  src="/images/yorunohikage.png"
                  width="75"
                  height="75"
                  alt="Profile picture of the author"
                />
              </a>
            </Link>
            <h1>
              <Link href="/" locale={false}>
                <a>
                  Alexis Launay
                  <span className="username">
                    @YoruNoHikage
                  </span>
                </a>
              </Link>
            </h1>
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
