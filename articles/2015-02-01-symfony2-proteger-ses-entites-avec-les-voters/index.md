---
id: 378
title: 'Symfony2 : Protéger ses entités avec les voters'
date: "2015-02-01T18:04:55.000Z"
author: YoruNoHikage
layout: post
guid: http://blog.yorunohikage.fr/?p=378
path: "/2015/02/01/symfony2-proteger-ses-entites-avec-les-voters/"
categories:
  - Development
---
Hier, je me devais d’avancer sur mon projet Symfony2. Il fallait que je sécurise mes entités pour restreindre l’accès en fonction de divers paramètres. Posons déjà les bases pour comprendre mon objectif :

On dispose de plusieurs entités : User, Game et  Team. **L’entité à sécuriser est Game**. En effet, le site étant communautaire, tout utilisateur peut créer un jeu qui appartient à une équipe.

## La base de la sécurité : l’accès par rôle

**Une première sécurisation reste l’accès par rôle.** Chaque contrôleur dispose d’une vérification (soit par l’annotation `@Security`, soit directement une condition). On veut que les jeux ne soient créés uniquement que par des membres du site. Je rappelle que depuis Symfony 2.6, le service `security.context` a été déprécié en faveur de `security.token_storage` pour la récupération de l’utilisateur courant et `security.authorization_checker` pour autoriser ou non l’utilisateur.

```php
// Acme/AppBundle/Controller/DemoController.php
<?php
if(false === ($auhorizationChecker->isGranted()))
{
    throw new AccessDeniedHttpException();
}
```

**Il s’agit là d’une première sécurisation mais qui montre néanmoins ses limites ! On veut que l’utilisateur ne puisse pas modifier les jeux qui ne lui appartiennent pas.**

## Pourquoi j’ai laissé tomber les ACLs au profit des voters

Je me suis donc lancé dans l’implémentation d’un système d’ACLs. Bien pratiques, ces listes permettent d’affiner les droits à chaque entité ou même à chaque champ de l’entité. Mais après réflexion et quelques petites recherches sur le net, **je me suis rendu compte qu’il s’agissait d’une solution coûteuse et qui n’apporterait pas beaucoup dans ce cas-là**. Je vous conseille de jeter un oeil à ces slides qui résument le pourquoi : **[Drop ACE, use voters](slides.com/marieminasyan/drop-ace-use-role-voters "Drop ACE, use voters par Marie Minasyan")** et [le talk que je n’ai pas vu](https://www.youtube.com/watch?v=e7HfW4TgnUY "Drop ACE, use voters in SymfonyCon Warsaw 2013").

Peut-être y reviendrai-je si je dois implémenter un système hyper précis mais dans mon cas j’ai choisi les voters. Voici l’implémentation à partir de [cet exemple](http://symfony.com/blog/new-in-symfony-2-6-simpler-security-voters " New in Symfony 2.6: Simpler Security Voters ") qui rend plus simple leur utilisation :

Je définis dans un premier temps, les différentes actions que l’on peut effectuer (ça sera amené à évoluer).

```php
// Acme/AppBundle/Security/GameVoter.php

const VIEW = 'view';
const EDIT   = 'edit';
const DELETE   = 'delete';

protected function getSupportedAttributes()
{
    return array(self::VIEW, self::CREATE, self::EDIT, self::DELETE);
}
```

Dans un second temps, on peut établir la fonction `isGranted`, dans laquelle vous devez faire les tests vérifiant les autorisations ou non d’accès.

```php
// Acme/AppBundle/Security/GameVoter.php

protected function isGranted($attribute, $game, $user = null)
{
    // On vérifie que l'utilisateur est bien de l'instance de notre classe
    if(!$user instanceof User) {
        return false;
    }

    // Ce code est introduit pour vérifier la hiérarchie des droits      
    // en fonction du rôle de l'utilisateur
    $roleHierarchyVoter = new RoleHierarchyVoter($this->roleHierarchy);
    $adminAccess = $roleHierarchyVoter->vote($this->token, null, array('ROLE_ADMIN'));

    // Le propriétaire et les admins peuvent tout faire
    if($adminAccess === VoterInterface::ACCESS_GRANTED
        || $user->getId() === $game->getOwner()->getId())
        return true;

    // Lorsque l'on cherche à éditer
    if($attribute === self::EDIT)
    {
        // Soit on doit être modérateur
        $modoAccess = $roleHierarchyVoter->vote($this->token, null, array('ROLE_MODERATOR'));
        if($modoAccess === VoterInterface::ACCESS_GRANTED)
                return true;

        // ou bien membre de l'équipe du jeu
        if(in_array($game->getTeam(), $user->getTeams(), true))
            return true;
    }

    return false;
}
```

Comme vous pouvez le constater, on renvoie `true` pour valider l’accès mais on aurait très bien pu adopter une politique inverse et renvoyer `false` à chaque condition. Il ne tient qu’à vous de choisir, bien que généralement, on préfère valider l’accès à quelques trucs et refuser tout le reste.

Je suppose que vous avez remarqué l’utilisation du `RoleHierarchyVoter` **qui permet de valider en fonction de la hiérarchie des roles**. En effet, lorsque qu’un membre possède le rôle `ROLE_SUPER_ADMIN`, il possède le `ROLE_ADMIN` seulement via la hiérarchie définie dans `security.yml`. Il faut donc injecter le service `RoleHierarchy` dans notre voter de cette manière :

```yaml
# Acme/AppBundle/Resources/config/services.yml
acme_app.game_voter:
    class:      Acme\AppBundle\Security\GameVoter
    arguments: [@security.role_hierarchy]
    public:     false
    tags:
       - { name: security.voter }
```

Et le récupérer dans la classe :

```php
// Acme/AppBundle/Security/GameVoter.php

private $roleHierarchy;

public function __construct(roleHierarchy $roleHierarchy)
{
    $this->roleHierarchy = $roleHierarchy;
}
```

Et voilà, juste une dernière chose. Étant donné que la classe `AbstractVoter` ne permet pas la récupération du `TokenStorage` présent dans `vote()`, j’ai réécris la fonction afin de le récupérer.

```php
// Acme/AppBundle/Security/GameVoter.php
private $tokenStorage;

public function vote(TokenInterface $token, $object, array $attributes)
{
    $this->token = $token;

    return parent::vote($token, $object, $attributes);
}
```

**Le gros avantage de cette méthode, c’est qu’elle est complètement découplée de la base de données** (vous pourriez très bien choisir d’utiliser un stockage local que ça marcherait), contrairement aux ACE qui ont besoin d’être initialisés et stockés.
