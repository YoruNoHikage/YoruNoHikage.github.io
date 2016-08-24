---
title: "REST API made easy with Apex, AWS Lambda and AWS API Gateway"
date: "2016-08-24T22:42:44.672Z"
layout: post
path: "/2016/08/25/rest-api-made-easy-with-apex-aws-lambda-and-aws-api-gateway"
categories:
- Development
---
_Recently, I was asked to rewrite the backend part of the company I'm currently working on with AWS services and Apex, an utility used to facilitate the deployments of [AWS Lambda](https://aws.amazon.com/lambda/) functions. In short terms, AWS Lambda is a FaaS (Functions as a Service): you code simple functions that get input and return output, that's it, nothing else. Similarly, it exists [hook.io](http://hook.io) or [Google Cloud Functions](https://cloud.google.com/functions/). When it comes to [AWS API Gateway](https://aws.amazon.com/api-gateway/), it is a way of mapping your Lambda functions to endpoints, it can do content type matching, security, and stuff you often repeat in your code. So let's dive in!_

An AWS Lambda function can be represented like this:  
```js
function(event, context, callback) {}
```

You can use either the context methods `success` and `fail` or the callback method whose first argument is error and second is the response. We can now dive into the Apex world that makes everything Lambda-related easier.

## Apex

Start with downloading and installing APEX CLI from [apex.run](http://apex.run), the website is very useful and well-explained.

1. You get the software
2. You run `apex init` in a new project folder
3. You get a structure like this :
   ```
   project.json
   functions
   ├── bar
   │   ├── function.json
   │   └── index.js
   └── foo
       ├── function.json
       └── index.js
   ```
4. You deploy your functions with `apex deploy`!

And that's it, boom, done, you have functions in the cloud! To use and test them, you just have to call them with `apex invoke <function name>`.

**Bonus for Node.js users**

You can `npm install apex.js`, a [nice package](https://www.npmjs.com/package/apex.js) that let you express your functions using `Promise` and forget about `try { ... } catch { ... }` blocks.

From there :
```js
export default ({ name }, ctx, cb) => {
  try {
    // doing Promise stuff and throwing errors
    cb(null, `Hello ${name}`);
    // or ctx.succeed(`Hello ${name}`)
  } catch(err) {
    cb(err);
    // or ctx.fail(err)
  }
}
```

You get there:
```js
import λ from 'apex.js'

export default λ(({ name }) => {
  // doing Promise stuff and throwing errors
  return `Hello ${name}`
})
```

## API Gateway

### Definitions and deployment

Now let's talk about API Gateway because it's not (yet?) integrated in Apex, so... pretty hard to set up with code you can auto-deploy. But, going deep in Apex issues, you can find some [odd Python script](http://github.com/rotemtom/serverless-ci-example) that let you express swagger definition along with your functions. Let's look at an example:

```js
// function.json
{
  "description": "Say hello to a given name",
  "x-api-gateway": {
    "method": "get",
    "path": "/hello/{name}",
    "parameters":[{
      "name": "name",
      "in": "path",
      "description": "Name of the person we want to say hello",
      "required": true,
      "type": "string"
    }]
  }
}
```

This file is originally used by Apex to configure your lambda function precisely. But you can add more to the definition and that's why we put the swagger definition here, very convenient way of doing things. So you got this **`x-api-gateway` which is a swagger extension AWS is using to add parameters to the API**. Currently the Python script is not really flexible about everything you can do with AWS Swagger extensions. You can check out everything on the AWS docs to extend your Swagger interface.

Now about the main and most complex changes you need to have in your `project.json`:

```js
"x-api-gateway": {
  "base_path": "/api",
  "stage_name":"dev",
  "rest-api-id":"<rest-api-id>",
  "swagger-func-template": {
    "consumes": ["application/json"],
    "produces": ["application/json"],
    "responses": { /* mapping HTTP codes to schemas */ },
    "x-amazon-apigateway-integration": {
      "responses": { /* mapping responses to HTTP codes */ },
      "requestTemplates": { /* See below, this one needs a loooong explanation */ },
      "uri": "arn:aws:apigateway:<region>:lambda:path/2015-03-31/functions/arn:aws:lambda:<region>:<account_id>:function:{{functionName}}/invocations",
      "credentials":"arn:aws:iam::<account_id>:role/APIGatewayLambdaInvokeRole",
      "passthroughBehavior": "when_no_match", /* This thing is important, I spent a lot of time because of it */
      "httpMethod": "{{functionMethod}}",
      "type": "aws"
    },
    "x-amazon-apigateway-auth" : { /* Everything security related */ }
  }
}
```

I've shorten everything but there is a link to a boilerplate at the end of the article that contains a more complete example file. First things first, you need to create a REST API on API Gateway (tip: you can use AWS CLI like this `aws apigateway create-rest-api 'My Awesome API'`), this will gives you an id you need to put on your configuration file.  
`swagger-func-template` is kind of global configuration for every function. For more information on how to define responses and stuff, you can check out on [AWS docs](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-swagger-extensions.html#api-gateway-swagger-extensions-integration). Let met explain in a list what's interesting here:

- `uri`: this property needs to be filled with the `arn`(s) Amazon gives you, but no worries, you can fill it by hands. The `{{functionName}}` parameter will be automatically replaced with the function name, leave it like this.
- `credentials`: I didn't search that much for this one, but replace `account_id` and it should work. :)
- `requestTemplates`: This is a mixed format template from [VTL](http://velocity.apache.org/engine/devel/vtl-reference.html) and [JSON Path](http://goessner.net/articles/JsonPath/) used to transform the shape of the input data to transfer it to your lambda. Currently my configuration looks like this:

  ```js
  "application/json": "{\n   \"method\": \"$context.httpMethod\",\n   \"body\" : $input.json('$'),\n   \"headers\": {\n     #foreach($param in $input.params().header.keySet())\n     \"$param\": \"$util.escapeJavaScript($input.params().header.get($param))\" #if($foreach.hasNext),#end\n \n     #end\n   },\n   \"queryParams\": {\n     #foreach($param in $input.params().querystring.keySet())\n     \"$param\": \"$util.escapeJavaScript($input.params().querystring.get($param))\" #if($foreach.hasNext),#end\n \n     #end\n   },\n   \"pathParams\": {\n     #foreach($param in $input.params().path.keySet())\n     \"$param\": \"$util.escapeJavaScript($input.params().path.get($param))\" #if($foreach.hasNext),#end\n \n     #end\n   }\n}"
  ```

  Okay okay, I know this doesn't look good but what if I do this:

  ```vtl
  {
    "method": "$context.httpMethod", // GET, POST, PUT...
    "body" : $input.json('$'), // your payload
    "headers": { // Content-Type and stuff like that
      #foreach($param in $input.params().header.keySet())
        "$param": "$util.escapeJavaScript($input.params().header.get($param))" #if($foreach.hasNext),#end
      #end
    },
    "queryParams": { // for example /sweets?sort=asc will gives you a sort property into queryParams
      #foreach($param in $input.params().querystring.keySet())
        "$param": "$util.escapeJavaScript($input.params().querystring.get($param))" #if($foreach.hasNext),#end
      #end
    },
    "pathParams": { // for example /sweets/{name} will gives you a name property into pathParams
      #foreach($param in $input.params().path.keySet())
        "$param": "$util.escapeJavaScript($input.params().path.get($param))" #if($foreach.hasNext),#end
      #end
    }
  }
  ```

  Better, huh? And we can see that's a kind of enhanced JSON used with $ variables representing input. **What we are doing here is mapping method, body, headers, query parameters and the path parameters into their own property in an object that will be sent to our lambda.** You can even add hardcode properties if you need to. **This structure is really opinionated** : one one hand, it's really convenient because everything is well-separated, but on the other hand, **your lambda needs to know where is the parameters it needs**. _It's your choice to define it like this or putting every properties into the main object._ You could also writing it differently in every `function.json`.
- `passthroughBehavior`: **This one is very important**, it represents the way Amazon will call your lambda using the `requestTemplates`.

  - `when_no_match`: Mapping body with `requestTemplates` and if no content type is matched, content passes through as-is.
  - `when_no_template`: same as `when_no_match` when templates are defined, but if no templates, it passes through as-is.
  - `never`: rejects the method request if the content-type doesn't match anything in mapping template.

  This option made me go crazy during an hour, I had my request mapped only when I was not sending any body (it was set on the `never` option).  

### Apex API Gateway

Python may not be what your co-worker wants to install for a tiny simple script... That's why I **rewrote and enhanced this in Node.js, less code, no Python required** and more flexibility coming if you or other people gets interested.

A simple `npm install -g`[`apex-api-gateway`](https://www.npmjs.com/package/apex-api-gateway) and here you go. _You can also install it locally in your project and call it from an NPM script._

So you might first want to create an API:

`apex-api-gateway create 'My Awesome API'`

This will add a `rest-api-id` field in your `project.json` that can be used later to update your Swagger schema. This way, you don't need to repeat yourself with the AWS CLI. And as we talk about updating, here's how:

`apex-api-gateway update`

Now you can develop and deploy without bothering about AWS user interface, you only need, of course, appropriate security roles.

## Conclusion

Thanks for reading this, you can check out my **[Apex API Gateway boilerplate on GitHub](https://github.com/YoruNoHikage/apex-api-gateway-boilerplate) (Node.js), it has (almost) everything you need to get you started!** Tell me about the [`apex-api-gateway`](https://www.npmjs.com/package/apex-api-gateway) script and/or don't hesitate to file issues or contribute on the [GitHub repository](https://github.com/YoruNoHikage/apex-api-gateway)

_PS: A friend told me about [ClaudiaJS](https://claudiajs.com/), I never tried it nor saw it before, maybe it is a good alternative for your Lambda functions being written the express.js way._
