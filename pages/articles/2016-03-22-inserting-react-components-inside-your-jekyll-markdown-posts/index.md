---
id: 438
title: Inserting React components inside your Jekyll markdown posts
date: "2016-03-22T23:19:01.000Z"
author: YoruNoHikage
layout: post
guid: http://blog.yorunohikage.fr/?p=438
path: "/2016/03/22/inserting-react-components-inside-your-jekyll-markdown-posts/"
categories:
  - Development
---
![Jekyll React](jekyll-react.png)

_TL;DR: I wanted to do a Jekyll post with React components inside without having to pre-compile something. I just wanted to drop files on GitHub without the need of the command line. Demo time : [Poole with React Components](http://poole.yorunohikage.fr/2016/01/04/introducing-react-components/)_.

I’m being tired of WordPress these days, I want to migrate to a GitHub Pages (based on Jekyll) but I want to be able to write my posts easily from anywhere and you can now drop files on repository directly on GitHub, so it’s better to have a blog without the need of pre-rendering !

So, you want to show your super-cool new React component that you just wrote ? I started thinking about what we all want and this is pretty easy :

```md
Awesome **markdown**, yeah !

<AwesomeComponent />
```

But, the browser change it to **<awesomecomponent></awesomecomponent>** as it was a HTML entity. We don’t want that, we need our component to be rendered when the client will execute Babel / React and so on. So, it’s a script we’re trying to display, right ? Besides, it’s the only element (I think) capable of keeping its children as-is.

```md
Awesome **markdown**, yeah !

<script type="jsx">
  <AwesomeComponent />;
</script>
```

This way, you just get an element containing the script text you need to render the component. Now we need Babel to transform JSX because it’s cool to add components directly in your article just as in your code. Babel-browser being deprecated, we still have a great solution named Babel Standalone, you can find it [on GitHub](https://github.com/Daniel15/babel-standalone) or use the [direct link to the UMD source](https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.4.4/babel.min.js). And of course, [React](https://cdnjs.cloudflare.com/ajax/libs/react/0.14.7/react.js) / [ReactDOM](https://cdn.jsdelivr.net/react/0.14.7/react-dom.js).

```js
Babel.transform(
  '<AwesomeComponent />;',
  { presets: ['es2015', 'react'] }
).code;
```

The result from this transform is a string:

```js
"use strict";

React.createElement('AwesomeComponent');
```

You need to evaluate this string to get the result and what you need. But this just represents the component, we have no render for now. What we need to do is to get the string representing the component and replace it with the result of the evaluation. The script tag is quite annoying in this case, because you can’t render onto it, we need to replace it with another tag, a div to be neutral.

```js
var element = document.querySelector('script[type=jsx]');
var code = eval(Babel.transform(element.textContent, { presets: ['es2015', 'react'] }).code);

var newElement = document.createElement('div');
element.parentNode.replaceChild(newElement, element);
ReactDOM.render(code, newElement);
```

_Note: I use eval here because of the “use strict” Babel is adding._

**textContent** gives the code we can render into the DOM after transform. **replaceChild** is going to replace the script tag with the newly created div. Currently we don’t have a way to load the component, so we’re going to use Jekyll’s Front matter to load the external scripts.

```yaml
---
  custom_js: AwesomeComponent
  # or if you have multiple files you want
  custom_js:
    - AwesomeComponent
    - AnotherAwesomeComponent
---
```

```html
<!-- _includes/foot.html -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.4.4/babel.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.14.7/react.js"></script>
<script src="https://cdn.jsdelivr.net/react/0.14.7/react-dom.js"></script>
{% if page.custom_js %}
  {% for js_file in page.custom_js %}
    <script src="/javascripts/{{ js_file }}.js"></script>
  {% endfor %}
{% endif %}
<script>
  (function() {
    var codeElements = document.getElementsByClassName('react');
    Array.forEach(codeElements, (element) => {
      var code = eval(Babel.transform(element.innerText, { presets: ['es2015', 'react'] }).code);
      ReactDOM.render(code, element);
    });
  })();
</script>
```

First, we load Babel, React and ReactDOM. Then we load every script specified in the front matter. With this, we get what we wanted, rendering our component into an article but any external can’t use ES2015/16. So if you’re like me and already using Babel (stage 0 :-°), you’ll probably want to copy-paste your components into your blog without doing much. We need Babel to transform every script included and to do that we need System, a cool new feature (again) that will be available in our browsers in the future. For now, there is [System.js](https://github.com/systemjs/systemjs), a library that does this for us. It brings some cool stuff like this :

```js
// works like require() but for browsers
System.import('/javascripts/MyComponent');
```

And we can configure it to use Babel at every import just like this :

```js
System.config({
  baseURL: './',
  transpiler: 'Babel',
  babelOptions: {
    plugins: ["transform-es2015-modules-systemjs"],
    presets: ['es2015', 'react']
  },
  map: {
    Babel: '/javascripts/babel-standalone.js'
  }
});
```

We need to inject globals for the components we use in the articles :

```liquid
{% for js_file in page.custom_js %}
  var {{ js_file }};
  System.import('/javascripts/{{ js_file }}.js')
        .then(e => {{ js_file }} = e.default);
{% endfor %}
```

**System.import** returns a Promise that will resolve with an object containing the exports. I found the best way was to assign the default to the name of your file but it can be easily changed to something else. I then used **Promise.all** to wait for every dependency to load to execute the component replacement.

Currently, this is the best thing I have, you can drop any article in your repository and inject components to enhance your posts. There’s still improvements to make: it is not available in the home page, React components are just stripped out, we should for example make a specific script explaining the user he has to view the full article to see the live components. I was inspired by this [example](https://github.com/Treri/systemjs-example) of SystemJS combined with Babel Standalone. You can fork and / or see the changes on my [GitHub fork](https://github.com/YoruNoHikage/poole) and see the [demo](http://poole.yorunohikage.fr/2016/01/04/introducing-react-components/).

That will be all, thanks folks !
