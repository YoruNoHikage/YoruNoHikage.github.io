---
id: 421
title: Thoughts about relationship deletion in Redux with Normalizr
date: "2015-11-08T14:14:57.000Z"
author: YoruNoHikage
layout: post
guid: http://blog.yorunohikage.fr/?p=421
path: "/2015/11/08/thoughts-about-relationship-deletion-in-redux-with-normalizr/"
categories:
  - Development
---
![Twitter Like = LOL](heart.png)

When working with Redux, you have to consider keeping your entities normalized and in a single place. I chose to inspire myself from the real-world example written in the Redux repository. But when you consume your API, you want to be able to link or unlink entities just by adding or removing an element from an array. I had to struggle a bit for this part, and I’m still open to a better suggestion.

So, here’s the basic implementation given in the Redux’s real-world example :

```js
function entities(state = initialEntities, action) {
  if(action.response && action.response.entities) {
    return merge({}, state, action.response.entities);
  }
  return state;
}
```

This is the entities reducer. It takes all the actions and merge the normalizr’s results within the state, returning the new one.

Here comes the problem : let’s say we have two **entities**, **tweet** and **user** for example. A user can _like/unlike_ (yes, goodbye favorite) a tweet. These _actions_, I omit the request/response/normalizing process, will then be dispatched like this :

```js{
  type: 'LIKE_TWEET',
  response: {
    entities: {
      users: {
        1: {
          likedTweets: [123456789, ...]
        }
      },
      tweets: {
        123456789: {
          likedBy: [1, ...]
        }
      }
    }
  },
}
```

Passing the reducer, it works, yay! You get your new state with each entity referencing the other one. Now I want to unlike it… And… BOOM, user is still liking it. So, what do we do now ? Here’s the first solution I came with :

```js
function entities(state = initialEntities, action) {
  if(action.response && action.response.entities) {

    let newState = null;
    // you change your state manually to remove the relationship
    if(action.type === 'UNLIKE_TWEET') {
      let { users, tweets } = state;

      // params used to get the entities concerned
      const userId = // wherever in action;
      const tweetId = // wherever in action;

      // filtering to remove the relationship in user's side
      const likedTweets = users[userId].likedTweets.filter(e => e != tweetId);
      // same with tweet's side
      const likedBy = tweets[tweetId].likedBy.filter(e => e != userId);

      // always immutable state
      newState = {
        ...state,
        tweets: {...tweets, [tweetId]: {...tweets[tweetId], likedBy}},
        users: {...users, [userId]: {...users[userId], likedTweets}},
      };
    }

    return merge({}, newState || state, action.response.entities);
  }

  return state;
}
```

When creating the new state, you obviously want to keep immutability in place. So you assign (or spread into a new object) the new entity with the filtered relationship array.

But I felt unsatisfied with this, we don’t need to know about the global state here. I came across this <a href="https://github.com/rackt/redux/issues/994#issuecomment-153341165" target="_blank">issue in the redux official repo</a>, making me remember how the reducers can be useful to modify only part of the state. So here’s the second solution :

```js
// one reducer for each entity
function users(state = {}, action) {
  switch(action.type) {
    case 'UNLIKE_TWEET':
      const userId = // wherever in action;
      const tweetId = // wherever in action;

      const likedTweets = state[userId].likedTweets.filter(e => e != tweetId);
      return {
        ...state,
        [userId]: {
          ...state[userId],
          likedTweets,
        }
      };
    default:
      return defaultEntitiesReducer(state, action, 'users');
  }
}

function tweets(state = {}, action) {
  switch(action.type) {
    case 'UNLIKE_TWEET':
      const userId = // wherever in action;
      const tweetId = // wherever in action;

      const likedBy = state[tweetId].likedBy.filter(e => e != userId);
      return {
        ...state,
        [tweetId]: {
          ...state[tweetId],
          likedBy,
        }
      };
    default:
      return defaultEntitiesReducer(state, action, 'tweets');
  }
}

function defaultEntitiesReducer(state, action, entityName) {
  if(action.response && action.response.entities && action.response.entities[entityName]) {
    return merge({}, state, action.response.entities[entityName]);
  }
  return state;
}

const entities = combineReducers({
  users,
  tweets,
})
```

The defaultEntitiesReducer is acting when nothing is catched in the switch statement. Its behavior is the same as the entities reducer in the redux real-world example. There’s a lot of boilerplate code in here, but I’m sure we can come up with something removing all of this. I’ll update this post if I find a better way.

Update 12th november 2015 :

I came up with a better solution by using combineReducers inside the reducer itself.

```js
function entities(state = initialEntities, action) {
  // do some common computation
  let newState = state;
  if(action.response && action.response.entities) {
    newState = merge({}, newState, action.response.entities);
  }

  // your reducers can now just return the state when nothing is catched in the switch statements
  return combineReducers({
    anotherReducer: (state, action) => state, // inline example
    users,
    tweets,
  })(newState, action);
}
```
