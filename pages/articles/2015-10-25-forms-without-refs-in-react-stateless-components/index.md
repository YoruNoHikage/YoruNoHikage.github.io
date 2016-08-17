---
id: 407
title: Forms without refs in React stateless components
date: "2015-10-25T13:55:40.000Z"
author: YoruNoHikage
layout: post
guid: http://blog.yorunohikage.fr/?p=407
path: "/2015/10/25/forms-without-refs-in-react-stateless-components/"
categories:
  - Development
---
![Silly forms transforms Cover](forms.png)

Hello there, there’s this silly thing I do with forms in my components and I want to share it with you. I always see people getting form values with refs, things you can’t use in stateless components. But it doesn’t matter, you can use something Javascript has already in itself : events !

If your component looks like this :

```jsx
const RegisterForm = (props) => (
  <form onSubmit={submitHandler}>
    <div>
      <input id="register-username" name="register-username" placeholder="JohnSmith" />
      <input id="register-email" name="register-email" className="form-input" type="email" placeholder="john.smith@example.com" />
      <input id="register-password" name="register-password" type="password" placeholder="p4ssw0rd" />
    </div>
    <Button>Register</Button>
  </form>
);
```

When the user submit the form, an event is sent with all you need :

```jsx
function submitHandler(e) {
  e.preventDefault();
  const {
    ['register-username']: {value: username},
    ['register-email']: {value: email},
    ['register-password']: {value: password},
  } = e.target;

  // do what you want with the data (username, email and password)
}
```

To those who didn’t understand what’s going on : You get the value of the children you want from the submitted form and you rename them into proper name. Of course, if you can’t have a form in your component, you’re forced to use a ref and turn this component into a class.

That’s it, I know it feels kinda hacky but it works and I find it pretty elegant. Don’t hesitate to tell me your opinion about this. 😊
