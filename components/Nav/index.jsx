import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Nav() {
  const router = useRouter();

  return (
    <nav className="blog-nav">
      <ul>
        <li>
          <Link href="/" locale={false}>
            <a className={router.pathname === '/' ? 'current' : undefined}>
              Articles
            </a>
          </Link>
        </li>
        <li>
          <Link href="/about" locale={false}>
            <a className={router.pathname === '/about' ? 'current' : undefined}>
              About me
            </a>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
