---
title: "Setting up a React Native & Web project"
date: "2016-10-10T22:17:59.832Z"
layout: post
path: "/2016/10/11/setting-up-a-react-native-and-web-project"
categories:
- Development
---
Hello guys, it's been a while! I wanted to share about React Native today. I started a small project with a friend recently and we wanted to be able to develop the mobile app as well as the website. For now, the project is really in a early stage so I won't say much about it but I can tell about design considerations for those of you who are hesitating. First things first, we needed something easy to manage our data, so we chose **Firebase** which is a pretty good way of getting something done quickly.

## React Native part

To get started, we start with installing and generating a react native project, which is pretty straightforward, just do:

`npm install -g react-native && react-native init MyProject`

This will create a basic structure that looks like this:
```
MyProject
├── node_modules
├── android
├── ios
├── // bunch of . files
├── index.android.js
├── index.ios.js
└── package.json
```

This way, you can already start developing with `react-native run-ios` or `react-native run-android`.
But now we need our web part, so how can we do that?

## Here comes the web

Maybe this last few months you heard about `create-react-app`, an awesome tool with no configuration to start developing with React on the web. I chose it to get started because it's really easy and fast. This tool is based on something called `react-scripts` that manages the building configuration for you. And since we already have a structure for our project, we need to integrate it, and it's so easy to do.  
First, install it into the project by doing:

`npm install react-scripts --save-dev`

Then, all you need to create is:
- An entry point for your web project located at `src/index.js` (no, I'm not wrong about the `react-native import`, wait for it :P)
  ```jsx
  import { AppRegistry, Text } from 'react-native'

  AppRegistry.registerComponent('App', () => <Text>Hello World!</Text>)
  AppRegistry.runApplication('App', { rootTag: document.getElementById('app') })
  ```
- A public folder with a basic HTML: `public/index.html`
  ```html
  <!doctype html>
  <html lang="en">
    <head>
      <title>MyProject</title>
      <meta charset="utf-8">
      <meta name="description" content="MyProject's description">
      <meta name="author" content="Me">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="theme-color" content="#000000">
      <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    </head>
    <body>
      <div id="app"></div>
    </body>
  </html>
  ```
- Add these lines to your `package.json`
  ```json
  {
    "scripts": {
      "start": "react-scripts start",
      "build": "react-scripts build",
      "eject": "react-scripts eject"
    }
  }
  ```

And that's it, we did the job of `create-react-app` but manually to integrate it into our project.

**Now, you might wonder: Why is there an import from react-native in my web application?** And you're right because it's weird! The reason is because `react-scripts` integrates the `react-native-web` package that allows you to use the component from react-native into the web. Every call to React Native is proxied to React Native Web when the web building part do the job. You don't need to think about it but keep that in mind because it allows you to share more code between your different platforms. _You still can use `ReactDOM.render` if you prefer._

Last, but not least, components and stuff we're going to write!

## Project final structure

There's a cool stuff you can do with React Native when importing files. It automatically resolves the platform it is building from the file's name. Here's some examples:
```js
// will import ./index.js on the web
//
// will import ./index.native.js on React Native build
// - OR -
// will import ./index.ios.js on iOS build
// will import ./index.android.js on Android build
import './index'

// And it works with folders too!!
// will import ./src/components/MyComponent/index.js on the web
// will import ./src/components/MyComponent/index.native.js on React Native
// etc...
import MyComponent from './src/components/MyComponent'
```

This feature is so nice and allows you to have a great project structure like this:
```
MyProject
├── node_modules
├── android
├── ios
├── src
│   ├── components
│   │   ├── ...
│   │   └── MyComponent
│   │       ├── index.js
│   │       ├── index.ios.js
│   │       └── index.android.js
│   ├── containers
│   │   └── MyContainer
│   │       └── index.js
│   └── index.js
├── // bunch of . files
├── index.android.js
├── index.ios.js
└── package.json
```

Containers like `MyContainer` will contain common logic and include components from the `components` folder, no need to differentiate inside the container.

## Bonus: React Router (v4)

You can easily use React Router with React Native to manage your routes inside your application the same way you do in the web app. If you have a `<Root />` component that use a `<Router />` to manage its routes, you can easily import the `MemoryRouter` or `BrowserRouter` according to the platform you target.

```js
// src/index.js
import { Match, BrowserRouter as Router } from 'react-router'

// index.native.js - OR - index.android.js and index.ios.js
import { Match, MemoryRouter as Router } from 'react-router'
```

Hope this article can give some tips to people who aren't aware of this nice features and see you next time! :D
