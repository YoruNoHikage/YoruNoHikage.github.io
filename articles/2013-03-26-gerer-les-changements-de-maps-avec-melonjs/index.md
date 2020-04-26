---
id: 78
title: Gérer les changements de maps avec MelonJS
date: "2013-03-26T15:07:00.000Z"
author: YoruNoHikage
layout: post
guid: http://yorunohikage.olympe.in/blog/?p=78
path: "/2013/03/26/gerer-les-changements-de-maps-avec-melonjs/"
categories:
  - Development
tags:
  - changements
  - map
  - MelonJS
  - spawn
  - tiled
---
Voici un premier article sur le développement car j’ai constaté que la communauté autour de MelonJS était assez faible. Si vous avez des remarques concernant cet article, n’hésitez pas à m’en faire part. Je débute sur ce framework, il est donc intéressant pour moi de faire partager mes découvertes et comme je dis toujours, écrire un “tuto” permet de mieux comprendre de quoi l’on parle.

Lorsque le niveau est chargé, une méthode est appelée que nous pouvons récupérer et modifier. Il s’agit de `me.game.onLevelLoaded`. Définissez d’abord une méthode dans votre main que j’ai appelé `goToSpawn` que vous allez assigné à `onLevelLoaded`.

```js
var jsApp =
{
    // autres méthodes
    loaded: function(){
        me.game.onLevelLoaded = this.goToSpawn.bind(this);
    },
    goToSpawn: function() {
        // On s'intéresse à cette partie.
    }
};
```

Vous pouvez dès à présent tester avec un `alert()` le changement de niveau avec la méthode classique expliquée dans le tutoriel officiel.

On crée donc une nouvelle entité LevelEntity que l’on nomme “spawnpoint” et qu’on ajoute à notre `entityPool`.

```js
me.entityPool.add("spawnpoint", me.LevelEntity);

me.gamestat.add('lastlevel', -1);
```

On définit un nom pour les points de spawn pour pouvoir les récupérer dans notre méthode et on initialise un identifiant global du dernier level visité (ici -1 pour l’initialisation et éviter de mettre le personnage à une position autre que le spawn original lors du chargement du jeu).

Venons-en au code qui nous intéresse :

```js
goToSpawn: function() {
    var spawnPoints = me.game.getEntityByName('spawnpoint');
    var player = me.game.getEntityByName('mainPlayer');

    // Pour chaque point de spawn.
    spawnPoints.forEach(function(obj) {
        // On vérifie s'il existe un point de spawn allant vers la précédente map
        if(obj.gotolevel == me.gamestat.getItemValue('lastlevel')) {
            // ici on doit faire un changement de position du personnage
        } // sinon il sera positionné au point de spawn par défaut
    });

    // On remet la variable globale pour la prochaine map
    me.gamestat.setValue('lastlevel', me.levelDirector.getCurrentLevelId());
}
```

A partir de ce moment-là, il y a plusieurs façons d’implémenter la position du personnage. Voici mon bidouillage actuel que je compte améliorer dans le futur (je suis toujours preneur si vous avez mieux).

```js
// On met le personnage aux positions du spawn
player[0].pos.x = obj.pos.x;
player[0].pos.y = obj.pos.y;

// si mon spawn est plus haut qu'un tile en hauteur c'est qu'il est collé sur le côté
// gauche ou droit de la map
if(obj.height >= me.game.currentLevel.tileheight) {
    // on le met à gauche ou à droite du spawn
    if(obj.pos.x >= me.game.currentLevel.realwidth - me.game.currentLevel.tilewidth)
        player[0].pos.x -= player[0].width * 1.5;
    else if(obj.pos.x <= me.game.currentLevel.tilewidth)
	player[0].pos.x += player[0].width * 0.5;
}

// si mon spawn est plus large qu'un tile en largeur c'est qu'il est collé sur le côté
// haut ou bas de la map
if(obj.width >= me.game.currentLevel.tilewidth) {
    // on le met au-dessus ou en-dessous du spawn
    if(obj.pos.y >= me.game.currentLevel.realheight - me.game.currentLevel.tileheight)
        player[0].pos.y -= player[0].height * 1.5;
    else if(obj.pos.y <= me.game.currentLevel.tileheight)
        player[0].pos.y += player[0].height * 0.5;
}
```

Cette technique a plein d’inconvénients, mais c’est actuellement la seule que j’ai trouvé si on ne veut pas s’embêter à gérer des variables supplémentaires lors de la création de la map (il faudra que j’explore cette solution plus complexe).

Il doit exister d’autres moyens (peut-être plus propre) pour gérer ce problème (en héritant de la classe `LevelEntity` ?) c’est pourquoi n’hésitez pas à me donner des retours et pourquoi pas m’aiguiller sur des tutos de personnes plus expérimentées.

**MàJ du 01/04/13 :** Vous pouvez rajouter

```js
player[0].setCurrentAnimation('votre anim');
```

dans chaque if pour rendre les changements de map cohérents.
