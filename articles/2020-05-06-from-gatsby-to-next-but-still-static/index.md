---
title: 'From Gatsby to Next but still static'
date: '2020-06-05T16:36:00.000Z'
categories:
  - Development
---

My last article was almost a year ago! I haven't given up, but as a true programmer, I've been doing more on the technical side than the actual content. If you can relate, you must be the type of people that is always unsatisfied with the tool and very slow when it comes to producing something with it.
Anyway, in this case, I wanted this blog to be multilingual, since the first articles I wrote, back in 2012, were in French but I switched to English at some point. Also, I've been writing a few articles in Japanese to exercise more on the writing side and some of them might also fit in here.

This blog has been powered by different engines throughout the years starting with Wordpress, moving to a simpler Jekyll static site and then Gatsby. And now I'm moving to Next. After working a bit with it, I concluded that it was so much easier to bend it towards what I needed. While Gatsby is nice when you don't do much outside the bounds, it can become cumbersome when you're expecting a bit more. The only downside I found to Next all those previous years was the path routes you had to specify in the config files to get a static site, I found it ugly. But [in a recent update](https://nextjs.org/blog/next-9-3#next-gen-static-site-generation-ssg-support) they introduce new methods to collocate the dynamic paths right with their page templates.

## The good

So I started my Next project right in the Gatsby one, removing all those spread configs files down to just a few ones. Because I was using a pre-built template, I still had to keep some things like `rucksack` and `lost` grid. Maybe I'll get rid of those later. I got it working quickly without the articles. Then I headed onto the most important.

Within the file `[...slug].jsx` which catches every path not predefined and the brand new `getStaticPaths` method, you can specify which dynamic paths you want to be rendered, that's where you have to query your filesystem to get the articles. With a few lines, you can get it working.

```js
// [...slug].jsx
export async function getStaticPaths() {
  // getting all my articles
  const folders = glob.sync('articles/*/index.md');
  const slugs = [];

  for (let folderPath of folders) {
    // the directory's name will be the path
    const dirName = folderPath.split('/')[1];

    // we need to get the year, month, day and slug within the directory's name
    const splits = dirName.match(/(\d{4})-(\d{2})-(\d{2})-(.+)/);
    const arraySlug = splits ? splits.slice(1) : [slug];

    // let's save the slug
    slugs.push(arraySlug);
  }

  return {
    paths: slugs.map((slug) => ({
      params: { slug },
    })),
    fallback: false, // all other paths will go to 404
  };
}
```

What is great with that, it's the complete freedom on where the data comes from and which paths you want to generate. So if I change my data structure let's say to `{year}/{month}/{day}/...` instead later, I can come back, change a few lines and the result will be the same. Now that is working exactly as before. Let's add the internationalization now!

```diff
// [...slug].jsx
- const folders = glob.sync('articles/*/index.md');
+ const folders = glob.sync('articles/*');
const slugs = [];

for (let folderPath of folders) {
  // ...

+   // finding languages (e.g. index.fr.md)
+   const articlesPaths = glob.sync('index*.md', { cwd: folderPath });
+
+   // nothing? let's move on
+   if (articlesPaths.length === 0) continue;
+
+   // pushing default lang path
+   slugs.push(arraySlug);
+
+   // removing the default lang from the list
+   if (articles.includes('index.md')) {
+     articles.splice(articles.indexOf('index.md'), 1);
+   }
+
+   // let's push the lang in the path (to get /{lang}/...)
+   for (let article of articles) {
+     const lang = article.match(/.*index\.(.+)\.md/)[1];
+
+     slugs.push([lang, ...arraySlug]);
+   }

  // ...
}
```

So you get all the paths you need and if the article is not available in English, we'll have to redirect to the first locale we find.

Getting the homepage list of articles with the other available languages is pretty much the same work since we need to find the alternatives but instead of just specifying the path, you load the content of said article within `getStaticProps`.

```js
// index.jsx
export async function getStaticProps() {
  // ...

  for (let folderPath of folders) {
    // ...

    // importing the frontmatter and content
    const { data, content } = await import(`../articles/${dirName}/${filename}`));

    articles.push({
      ...data,
      slug,
      content,
    });
  }

  return {
    props: {
      articles,
    },
  };
}
```

You can also match the languages and add some data to the list, if you want to see how it's done you can look at the [file on GitHub](https://github.com/YoruNoHikage/blog/blob/sources/pages/index.jsx#L137-L191). I made it so all the article are displayed on the homepage but the language is specified if it's not English and alternative languages links are also available.

## The bad

Before going on, let's just dig something, Markdown imports. Next is built on top of Webpack which can imports all sorts of files as long as you have something called a loader for it. Colocating the assets' articles and the article itself was something Gatsby plugins used to do, but I didn't find anything satisfying for Next and after taking example on the `remark-loader`, I've built my tiny loader based on the `html-loader` using the `remarkable` parser.

```js
const matter = require('gray-matter');
const { Remarkable } = require('remarkable');
const HTMLLoader = require('html-loader');
const hljs = require('highlight.js');

const md = new Remarkable();

module.exports = function markdownLoader(content) {
  const callback = this.async();

  // let's parse the frontmatter
  const parsed = matter(content);

  // let's render the markdown and pass it to HTML loader
  const content = HTMLLoader(md.render(parsed.content));

  // exporting the module
  callback(
    null,
    `module.exports = {content: ${
      content.match(/(".+")/)[0]
    }, data: ${JSON.stringify(parsed.data)}};`
  );
};
```

It's not that good but it's working, I might come back to it later.

## The ugly

The paths are generated and you also get the articles within the homepage but now we need to match the URL to the content. `getStaticProps` receives a parameter containing `params` which is what we specified in `getStaticPaths`.

```js
export async function getStaticProps({ params }) {
  const { slug } = params;

  // finding lang and article path within the slug parameter

  // getting article paths...

  // The lang is the default but we don't have it, we need to redirect to the first one we find
  if (lang === 'en' && !articles.includes('index.md')) {
    const redirectToLang = articles[0].match(/index\.(.+)\.md/)[1];
    return { props: { redirectToLang, path } };
  }

  // importing asked article and matching other langs...
}
```

We can use the parameter to do our loading strategy (nothing new here) but we need to specify the need for redirection when English is not available (that will support old URLs). Just use the props within the component:

```jsx
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Article({ path, redirectToLang }) {
  const { replace } = useRouter();

  if (redirectToLang) {
    if (typeof window !== 'undefined') replace(`/${redirectToLang}/${path}`);

    // if JS is disabled, I guess that's the only way to redirect within a static website
    // and without HTTP redirects of course
    return (
      <Head>
        <meta httpEquiv="refresh" href={`0;url=/${redirectToLang}/${path}`} />
      </Head>
    );
  }

  // returning formatted article
}
```

## Now.sh

Finally, I used to host the blog on Netlify (which is great) but Now is made my the same people making Next and the project doesn't have to be exported to a static website to work on it even though it could. It is just statically optimized at build time.

And that's it! I moved my blog to Next and it's multilingual! You can check this article's French version by clicking the FR link or button on top of the article.