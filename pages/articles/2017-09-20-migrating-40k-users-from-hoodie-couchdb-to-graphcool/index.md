---
title: "Migrating 40k users from Hoodie / CouchDB to Graphcool"
date: "2017-09-20T16:00:00.348Z"
layout: post
path: "/2017/09/20/migrating-40k-users-from-hoodie-couchdb-to-graphcool"
categories:
- Development
---
At Prototypo, we had an old backend system, that wasn't flexible, or should I say too much flexible? So when I joined the team, I had the charge to rewrite the payment system with externals AWS Lamda. I didn't talk that much about it but I dropped some thoughts on the article about [Lambda and API Gateway](http://blog.yorunohikage.fr/2016/08/25/rest-api-made-easy-with-apex-aws-lambda-and-aws-api-gateway/).

But as we were adding features and all, we felt the need to refactor the rest. I guess Hoodie is a great tech when it comes to offline-first capabilities, simple storage like Firebase does and real-time data but we didn't need all of this. It was used in a weird way that I immediately wanted to fix. Everything was loaded at the first page load and it kept sending data everytime there was a change without anything coming down from the server. We also experienced lots of problems where people had their fonts completely reset to a previous state due to multiple active sessions at the same time.

So our needs were:
- Link more data to start working on collaborating features
- Real-time data coming down from the server (again, collaborating features)
- BaaS (Backend as a Service) to avoid the maintenance pain
- Extensibility (like webhooks) to support the different 

And I was using GraphQL for another project, that seemed to me the thing to use (no hype driven development, it's just easier to fetch the data we need). It appears that, between all solutions that exists, [graph.cool](https://graph.cool) was the way to go. They have done a lot for the community, they open-source pretty much everything, they're nice and their solution has a lot to offer!

- Link more data: it's a GraphQL API (compatible with both Relay and custom solutions like Apollo)
- Real-time: They support GraphQL Subscriptions
- "Functions" are a way to transform or react to changes
- Their project plan is free for open-source (we are \o/)
- They also have a way to extend GraphQL mutations with functions

And now, let's dig that migration!
----------------------------------

The database was, if I may, very poorly designed. Users are registered under a `_users` database that contains the basic info like the email, the password and a link to the billing account. Every user is linked to a unique — _or so I thought..._ — database to store its preferences and projects.

### Transfering user accounts first

I first decided to transfer every users we had in the database and that was the easiest since CouchDB has a REST endpoint that can dump everything. Just with `/_users/_all_docs?include_docs=true`. That being set, I had to push them onto GraphCool without bloating the network with 40k requests, that's when GraphQL comes to be handy, **you can batch mutations to avoid sending multiple requests and sending them all at once**. I split my users into groups of 100 and send them while checking no errors were found.

To avoid duplicates, I first used the same batch ability to query every users and see which one were missing. So I could use that script multiple times to push the last users that were registered before we push the new code.

1.  Fetching all users

    ```
    {
      user1: User(email: "user@something.com") {
        id
      }

      user2: User(email: "notyetregistered@something.com") {
        id
      }

      ...
    }
    ```

2.  Filtering the response:

    ```
    {
      "data": {
        "user1": { "id": "some_id_returned_by_graphcool" },
        "user2": null,
        ...
      }
    }
    ```

3.  Sending the new ones:

    ```
    mutation {

      user2: signUpEmail(
        email: "notyetregistered@something.com",
        password: "password"
        oldSignedUpAt: "${signedUpAt}"
        oldCreatedAt: "${createdAt}"
      ) {
        id
      }

      ...
    }
    ```

And that's pretty much everything to get everyone transfered.

### Users' fonts, profile and preferences

The biggest challenge was to sync users' fonts because of the one-database-per-user thing. So if you take a user that have these projects:

- My First Font
  - Regular
  - Bold
  - Custom variant
- My Second Font
  - Regular

His database looked like this:

```
newappvalues/default
newaccountvalues/default

newfontvalues/myfirstfontregular
newfontvalues/myfirstfontbold
newfontvalues/myfirstfontcustomvariant
newfontvalues/mysecondfontregular
```

The first two documents contains the preferences and the profile values, but we'll get to this later.

Each variant has its own document stored under `family_name + variant_name` somewhat sanitized. Now, that makes a terrible problem that I encountered when transferring accounts. What if I'm Japanese and I want to name my font 青空 — because Blue Sky is such a great name — you end up with `newfontvalues/regular` and worse, if you name your variant the same way `newfontvalues/`. You end up with an empty document name, that's pretty bad... So I hope that our non-latin community could forgive us for this and that it should be totally fine from now on!

Font families are stored directly on the user preferences. Every font is just a plain object that has its own variants list pointing to their databases, roughly like this:

```
{
  "library": [
    {
      "name": "My First Font",
      "template": "venus.ptf",
      "variants": [
        { "name": "Regular", "db": "myfirstfontregular" },
        { "name": "Bold", "db": "myfirstfontbold" },
      ]
    },
    {
      "name": "My Second Font",
      "template": "elzevir.ptf",
      "variants": [
        { "name": "Regular", "db": "mysecondfontregular" }
      ]
    }
  ],
  ...
}
```

But, as far as I know, we only get users' databases by querying them one by one... `GET /__user_database__/_all_docs?include_all=true`.

This time, the script went a bit further: I needed to fetch all users, remove the non-existing common documents from both ends (GraphCool and CouchDB) and query all the data. I made up a small cache system to avoid redownloading the all thing in case of failure. That being done, I could fetch a hundred users' databases and send in one row the mutations I needed.

I used [`glouton`](https://www.npmjs.com/package/glouton), a small utility I made before for another use case. It allows you to retry failing requests and define a concurrency limit if you don't want to send to many requests at the same time. For this migration, the configuration was pretty straightforward:

```
import fetch from 'node-fetch';
import glouton from 'glouton';

const fetchWithRetry = glouton(fetch, {
  concurrency: 1,

  validateResponse: r => {

    // We continue (see below why)
    if (r.status === 404) {
      return true;
    }

    // if request has failed, we'll try again later
    // you can also return a time (ms)
    // pretty useful for API limits
    if (!r.ok) {
      return 0;
    }

    // everything is ok, we shall proceed
    return true;
  },
});

...

fetchWithRetry(...)
  .then(r => {
    // When the resource is not found,
    // we can return a default value or something else
    // to avoid breaking everything
    if (r.status === 404) {
      return { rows: [] };
    }

    return r.json();
  })
  .then(data => {
    // do what you need
  })

```

Having everything I needed, I just had to start creating my mutations. The rough part was knowing which variant belong to which font — assuming people could and would rename them — when they were already transfered.
Basically, I only saved `user_database-document_name` into an oldId field that could allowed me to gather them into a family array.

1. Gather me every variant with their family infos.
2. Look for the ones that were already migrated
3. Prepare the variants attributes
   ```
   const variantProperties = font.map(variant => `
     name: "${variant.name}",
     oldId: "${user.databaseName}-${variant.documentName}",
     values: "${JSON.stringify(variant.values)}",
   `)
   ```
4. Update families and create the missing variants
   ```
   gql`
     updateFamily(id: "${familyId}", name: "${familyName}", template: "${familyTemplate}") {
       id
     }
     
     createVariant(
       ${variantProperties}
       familyId: "${familyId}"
     ) {
       id
     }
   `
   ```
5. Create the missing families with their variants using nested mutations
   ```
   gql`
     createFamily(
       name: "${familyName}",
       template: "${familyTemplate}",
       ownerId: "${user.id}"
       variants: [
         ${
           variantProperties
             .map(properties => `{ ${properties} }`)
             .join(',')
         }
       ]
     ) {
       id
     }
   `
   ```
6. Update families and variants if they have been modified

When everything is done, you concatenate all the mutations and send them in one row to the server and keep going through the users. I won't mention how I did transfer the profile infos and preferences as it is pretty much the same thing but easier.

[And that, kids, is how I](https://www.youtube.com/watch?v=2lYZNNh8A5s) transfered 40 000 users from one place to another!