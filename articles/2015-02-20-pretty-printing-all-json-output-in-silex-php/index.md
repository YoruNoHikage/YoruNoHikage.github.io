---
id: 386
title: Pretty printing all JSON output in Silex PHP
date: "2015-02-20T00:48:05.000Z"
author: YoruNoHikage
layout: post
guid: http://blog.yorunohikage.fr/?p=386
path: "/2015/02/20/pretty-printing-all-json-output-in-silex-php/"
categories:
  - Development
---
If you’re doing some REST-ish API with Silex, or at least you need to output JSON. You’re probably doing something like this :

```php
$app = new Silex\Application();

$app->match('/hello', function() use($app) {
    // code

    return $app->json($response, 200);
});

$app->run();
```

But, you surely want something well-presented like with the `JSON_PRETTY_PRINT` flag you pass to the `json_encode` function when you do it in flat PHP.

Don’t worry, here’s the tip using after middleware (if you don’t already know them) :

```php
use Symfony\Component\HttpFoundation\JsonResponse;

// ...

$app->after(function(Request $request, Response $response) {
    if($response instanceof JsonResponse) {
        $response->setEncodingOptions(JSON_PRETTY_PRINT);
    }

    return $response;
});
```

You just have to write this before running your app.
