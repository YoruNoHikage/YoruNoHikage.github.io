---
title: "Localizing your blog with Next 10"
date: "2020-11-08T12:06:15.244Z"
categories:
- Development
---
Hey it's me again, with yet another blog post about Next!

Back in June, I explained [how and why I went from Gatsby to Next](/2020/05/06/from-gatsby-to-next-but-still-static/) with my roughly crafted take on i18n. But time has passed and Next 10 came out with a small but efficient way of localizing your app. There are still a few things that aren't very clear at the moment but it's really promising.

## Configuration

First of all, Next 10 introduces a new property called `i18n` where all the localization configuration is set to be.

```js
// next.config.js

export default {
  i18n: {
    locales: ['en', 'en-GB', 'fr', 'br'],
    defaultLocale: 'en',
    localeDetection: false,
  },
};
```

Within this object, you have to specify the languages you want to enable alongside your default locale. You also get language detection and redirects for free if you're interested in such thing. I've disabled it since my case was a bit different, my blog's interface is only in English, but some articles aren't. I've decided to go that way out of convenience but in the future, I might reconsider translating the whole thing and enabling the detection.

If you're interested in having a different domain per locale, it's also possible, check out the [docs](https://nextjs.org/docs/advanced-features/i18n-routing#domain-routing).

## Links

So now, with this configuration settled, the subroutes for your blog are automatically generated so you might want to remove any custom route manipulation like:

```jsx
<Link href={'/' + (lang !== 'en' ? lang + '/' : '') + path}>
  <a>{lang}</a>
</Link>

// simply becomes
<Link href={'/' + path} locale={l}>
  <a>{l}</a>
</Link>
```

_Note: With Next 10, `href` changed and doesn't need to specify the route along the path with the prop `as`. The detection is now done automatically.*_

In my case, I also put a `locale={false}` on every `Link` that goes from a localized page to an english page like `/` or `/about` to opt-out of the automatic locale prefixing.

## Route generation

As I said above, routes are automatically generated for every locales you declare. However, you can change that behavior within `getStaticProps`. As it automatically gets the default locale and the current locale, you can use the `notFound` option to disable the route as I did for my about page.

```jsx
export async function getStaticProps({ defaultLocale, locale }) {
  if (locale !== defaultLocale) {
    return {
      notFound: true,
    };
  }

  // ...
}
```

The same way, within `getStaticPaths` you can specify which locales you want to render for every path. I also chose to generate the english page for every article to keep consistency with the previous behavior I had. It redirects to the first locale found if it has no english version.

## Improvements needed

The internationalization in Next just got its first version and we can expect some updates and features within the coming months. Automatic redirections from the explicit default locale's path (e.g. `/en/my-article` to `/my-article`) and the static export when localeDetection is disabled - or a client support of it - would be little things I'd like to see added and that has no workarounds for now.

If you want to read more about the update, check out [Next 10](https://nextjs.org/blog/next-10)'s official blog post.