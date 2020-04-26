---
id: 99
title: 'Extensions Gnome-Shell - Requêtes HTTP avec libsoup'
date: "2013-04-27T23:47:06.000Z"
author: YoruNoHikage
layout: post
guid: http://yorunohikage.olympe.in/blog/?p=99
path: "/2013/04/27/extensions-gnome-shell-requetes-http-avec-libsoup/"
categories:
  - Development
---
Aujourd’hui, je vais vous parler d’un sujet qui fâche… Et par là j’entends le fait que la documentation sur la création d’extensions pour Gnome-Shell est ~~presque~~ inexistante.

Pour rappel, Gnome-Shell est l’interface de base de GNOME, un environnement de bureau pour Linux qui est disponible de base sur de nombreuses distributions de Linux comme Ubuntu, Fedora ou encore ArchLinux. Gnome-Shell quant à lui n’est pas forcément l’interface par défaut. Sur Ubuntu par exemple, c’est Unity qui est présente. Personnellement, j’utilise Gnome-Shell sur Fedora 18 Spherical Cow et je développe une extension avec un ami, [@Elektro121](http://twitter.com/Elektro121 "Elektro121 sur Twitter") qui dispose d’ArchLinux. Ma version actuelle de GNOME est la 3.6.

Quand j’ai commencé à développer des extensions, j’étais complètement perdu. Je ne connaissais rien sur les outils de debug présents et j’utilise Fedora de manière occasionnelle. Si certains ont besoin de plus d’explications concernant ces outils, je serai ravi d’écrire un article.

Finis les explications, commençons à jouer ! Pour utiliser les requêtes, nous allons avoir besoin de la libsoup, une bibliothèque écrite en C mais traduite en javascript grâce à l’outil Gjs (si j’ai bien compris). Pour commencer, il faut importer cette lib :

```js
const Soup = imports.gi.Soup;
```

Avec cette ligne, vous l’aurez compris, on raccourci ainsi notre import (question de feignantise). Ensuite, nous arrivons dans le vif du sujet ! On déclare de façon globale notre session HTTP et on ajoute des fonctionnalités spécifiques à l’objet parent de base.

```js
const _httpSession = new Soup.SessionAsync();
Soup.Session.prototype.add_feature.call(_httpSession,
                                        new Soup.ProxyResolverDefault());
Soup.Session.prototype.add_feature.call(_httpSession,
                                        new Soup.ContentDecoder());
```

Ici on déclare notre session HTTP avec un objet deprecated (je sais c’est pas bien). À l’origine, `Soup.Session` était une classe abstraite et `Soup.SessionAsync` et `Soup.SessionSync` étaient toutes les deux des classes filles. On devait choisir entre les deux si on voulait ou non effectuer des requêtes asynchrones ou synchrones. Actuellement, ces deux classes ont été réunis dans la classe mère, seulement Gnome-Shell plante sur son utilisation. Il est donc obligatoire de passer par les anciens objets, ici une session asynchrone. Ce qui nous amène aux lignes suivantes. Ces deux lignes dont une est présente dans l’extension Weather (dont je me suis inspiré pour les requêtes) permettent l’ajout de fonctionnalités que la classe `Soup.Session` intègre automatiquement mais qui ne le sont pas dans les anciennes sous-classes que l’on utilise. La première sert à résoudre les problèmes si un proxy a été défini par l’utilisateur et la seconde à l’ajout de la compression (`Accept-Encoding` et `Content-Encoding`).

Ensuite viens le temps de la requête :

```js
let message = Soup.Message.new('GET', "http://monsite.com");
```

Ici rien de plus simple. On créé une requête GET vers http://monsite.com que l’on nomme message (pour rappel let est un mot-clé non-standard équivalent à var mais qui n’agit pas de la même manière).

On ajoute ensuite notre(nos) header(s) comme par exemple :

```js
message.request_headers.append("Content-Type", "application/json");
```

Et enfin on termine par l’envoi et la gestion de la réponse grâce à la méthode `queue_message()` qui prend en paramètre la requête et le callback à appeler lors de la réception des donneés (la méthode choisie ici est, rappelons-le, asynchrone) :

```js
_httpSession.queue_message(message, function(session, message) {
    if (message.status_code !== 200) {
        // Gestion de l'erreur ici
        return;
    }
    // Gestion du message reçu grâce à message.response_body.data
});
```

Voilà pour cette introduction aux requêtes HTTP, en espérant que cela vous permettra de développer plus rapidement et de moins chercher comme je l’ai fait.
