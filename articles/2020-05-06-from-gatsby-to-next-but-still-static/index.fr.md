---
title: 'De Gatsby à Next mais toujours statique'
date: '2020-05-06T16:36:00.000Z'
categories:
  - Development
---

Mon dernier article remonte à presque un an ! Je l'ai pas abandonné mais en tant que programmeur, j'en ai fait plus sur le côté technique que sur le contenu en lui-même. Si ça vous parle, vous devez être le genre de personne qui est toujours insatisfaite de l'outil que vous utilisez and plutôt lent quand il s'agit de produire quelque chose avec.
Enfin bref, dans ce cas précis, je voulais que ce blog soit multilingue, sachant que les premiers articles que j'ai écris, qui remontent à 2012, étaient en français mais j'ai changé pour l'anglais à un moment. Et aussi, j'ai écris quelques articles en japonais pour pratiquer mon expression écrite. Quelques-uns de ces articles ont peut-être aussi leur place ici.

Ce blog a vu passer toute sorte de technologies à travers les années à commencer par Wordpress, puis un plus simple site statique en Jekyll et finalement Gatsby. Et maintenant, je re-change pour Next. Après avoir travaillé un peu avec, j'en ai conclu qu'il était plus facile de le tordre vers ce dont j'ai besoin. Alors que Gatsby est plutôt simple à manipuler quand on ne sort pas de ses limites, il peut devenir pénible quand vous lui en demander un peu plus. Le seul problème que j'ai pu trouver à Next ces dernières années, c'était l'obligation de spécifier toutes les routes dans un fichier de configuration afin de générer la version statique, je trouvais ça moche. Mais [dans une récente mise à jour](https://nextjs.org/blog/next-9-3#next-gen-static-site-generation-ssg-support), ils ont ajouté de nouvelles méthodes pour colocaliser les chemins dynamiques avec leurs templates de pages.

# Le bon

Du coup j'ai commencé mon projet Next directement dans le Gatsby, en commençant par supprimer tous les fichiers de config pour n'en ajouter que quelques-uns. Et parce que j'utilisais un thème existant, il a quand même fallu que je garde quelques trucs comme `rucksack` et le système de grille appelé `lost`. Peut-être que je les balancerai plus tard. J'ai pu faire fonctionner le site rapidement sans les articles. Et je suis passé au coeur du problème.

Dans le fichier `[...slug].jsx` qui va "matcher" tous les chemins non prédéfinis et la toute nouvelle méthode `getStaticPaths`, on peut spécifier quels chemins dynamiques sont rendus, et c'est là que vous allez recupérer vos articles sur le système de fichier. En quelques lignes, le taf est fait.

```js
// [...slug].jsx
export async function getStaticPaths() {
  // on récupère tous les articles
  const folders = glob.sync('articles/*/index.md');
  const slugs = [];

  for (let folderPath of folders) {
    // le nom du dossier sera le chemin de l'article
    const dirName = folderPath.split('/')[1];

    // on a besoin de l'année, le mois, le jour et le slug qui constituent le nom du dossier
    const splits = dirName.match(/(\d{4})-(\d{2})-(\d{2})-(.+)/);
    const arraySlug = splits ? splits.slice(1) : [slug];

    // on garde le chemin sous forme de tableau
    slugs.push(arraySlug);
  }

  return {
    paths: slugs.map((slug) => ({
      params: { slug },
    })),
    fallback: false, // tous les autres chemins seront des 404
  };
}
```

Ce qui est pratique avec ça, c'est la liberté totale sur la provenance des données et les chemins que l'on veut générer. Donc si je change ma structure, disons `{année}/{mois}/{jour}/...` plus tard, je peux revenir au fichier, changer 2-3 lignes et le résultat sera le même. Maintenant ça fonctionne exactement comme avant. Ajoutons l'internationalisation !

```diff
// [...slug].jsx
- const folders = glob.sync('articles/*/index.md');
+ const folders = glob.sync('articles/*');
const slugs = [];

for (let folderPath of folders) {
  // ...

+   // on prends les différentes langues (ex : index.fr.md)
+   const articlesPaths = glob.sync('index*.md', { cwd: folderPath });
+
+   // rien ? on passe
+   if (articlesPaths.length === 0) continue;
+
+   // on garde le chemin par défaut
+   slugs.push(arraySlug);
+
+   // on supprime la langue par défaut de la liste
+   if (articles.includes('index.md')) {
+     articles.splice(articles.indexOf('index.md'), 1);
+   }
+
+   // on ajoute la langue au chemin (pour obtenir /{langue}/...)
+   for (let article of articles) {
+     const lang = article.match(/.*index\.(.+)\.md/)[1];
+
+     slugs.push([lang, ...arraySlug]);
+   }

  // ...
}
```

Donc on obtient tous les chemins dont on a besoin et si l'article n'est pas disponible en anglais (la langue par défaut), on fera une redirection vers la première langue que l'on trouve.

Pour obtenir la liste des articles sur la page d'accueil, c'est globalement la même chose vu qu'on doit trouver les langues alternatives mais au lieu de spécifier le chemin, on charge le contenu de l'article voulu à l'intérieur de `getStaticProps`.

```js
// index.jsx
export async function getStaticProps() {
  // ...

  for (let folderPath of folders) {
    // ...

    // on importe le frontmatter et le contenu
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

On peut aussi trouver les langues correspondantes et ajouter les données data à la liste, si vous voulez voir comment c'est fait, vous pouvez jeter un oeil au [fichier sur GitHub](https://github.com/YoruNoHikage/blog/blob/sources/pages/index.jsx#L137-L191). Je l'ai fait de façon à ce que tous les articles soient affichés sur la page d'accueil mais la langue est précisée si ce n'est pas en Anglais et aussi des liens vers les langues disponibles.

## La brute

Mais avant de passer à la suite, faisons une parenthèse sur les imports Markdown. Next est construit au-dessus de Webpack qui peut importer toutes sortes de fichiers tant qu'il a ce qu'on appelle un loader pour ça. Avoir les ressources de l'article et l'article ensemble dans un dossier était quelque chose que les plugins de Gatsby pouvaient manipuler, mais je n'ai rien trouvé de satisfaisant pour Next et après avoir pris exemple sur `remark-loader`, je me suis fabriqué mon petit loader basé sur l'`html-loader` en utilisant le parser `remarkable`.

```js
const matter = require('gray-matter');
const { Remarkable } = require('remarkable');
const HTMLLoader = require('html-loader');
const hljs = require('highlight.js');

const md = new Remarkable();

module.exports = function markdownLoader(content) {
  const callback = this.async();

  // parsons le frontmatter
  const parsed = matter(content);

  // faisons un rendu du markdown pour le donner au loader HTML
  const content = HTMLLoader(md.render(parsed.content));

  // et on exporte le module
  callback(
    null,
    `module.exports = {content: ${
      content.match(/(".+")/)[0]
    }, data: ${JSON.stringify(parsed.data)}};`
  );
};
```

Ce n'est pas si terrible que ça mais ça fonctionne, je reviendrai dessus peut-être plus tard.

## Le truand

Les chemins sont maintenant générés et les articles sont aussi sur la page d'accueil mais il manque la correspondance URL-contenu. `getStaticProps` reçoit pour ça un paramètre qui contient `params` correspondant à ce qu'on a renvoyé dans `getStaticPaths`.

```js
export async function getStaticProps({ params }) {
  const { slug } = params;

  // trouver la langue le chemin de l'article grâce au paramètre slug

  // trouver les chemins des articles...

  // la langue demandée est celle par défaut mais on a pas d'article correspondant
  // on a besoin de redirigé vers la première alternative
  if (lang === 'en' && !articles.includes('index.md')) {
    const redirectToLang = articles[0].match(/index\.(.+)\.md/)[1];
    return { props: { redirectToLang, path } };
  }

  // on importe l'article demandé et on trouve les autres langues...
}
```

On peut utiliser le paramètre pour aller trouver notre article (rien de nouveau sous le Soleil) mais on a besoin de spécifier le besoin de redirection quand l'anglais n'est pas disponible (ça permet de supporter les anciennes URLs des articles). On a qu'à utiliser les props dans le component:

```jsx
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Article({ path, redirectToLang }) {
  const { replace } = useRouter();

  if (redirectToLang) {
    if (typeof window !== 'undefined') replace(`/${redirectToLang}/${path}`);

    // si JS est désactivé, je suppose que c'est la seule façon de faire la redirection
    // dans un site statique
    // sans les redirections HTTP bien évidemment
    return (
      <Head>
        <meta httpEquiv="refresh" href={`0;url=/${redirectToLang}/${path}`} />
      </Head>
    );
  }

  // on retourne l'article formatté ici
}
```

## Now.sh

Pour terminer, le blog était hébergé sur Netlify (qui est génial) mais Now est développé par les mêmes personnes qui font Next et le projet n'a pas besoin d'être exporter statiquement pour fonctionner bien que techniquement il pourrait. Il est juste optimisé statiquement au moment du build.

Et voilà! Je suis passé à Next et c'est multilingue ! Vous pouvez jeter un oeil à la version anglaise en cliquant sur le lien ou le bouton EN en haut de l'article.