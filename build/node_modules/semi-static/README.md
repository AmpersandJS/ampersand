# semi-static

Simple, lazy way to serve a directory of semi-static pages in express.js. Handy for building quick "static" pages inside an otherwise "dynamic" app.

Often you have a dynamic web app that also needs a bunch of mostly "static" pages. But you still want to use the same app layouts and template system to build out those pages. Take for instance an FAQ page inside your app that otherwise has a bunch of dynamic content. 

It's silly to build a specifc route for that page when all you really want is a route that at 'http://yourapp.com/faq' renders the `faq.jade` template in your [express.js](http://expressjs.com/) app.

I find myself adding code like this to nearly every express app I write, so I figured why the heck not publish an npm module and re-use that. So, here we are.

## Basic use

1. Install with npm: 
    `npm install semi-static`

2. Create a folder called `static` inside your express views folder.

3. Register a handler that tells it to use semi-static to render and serve template names at urls as if they were static:
    `app.get('*', semiStatic());`

4. Profit!

## Full Example

You can run the example in this repo by changing to the `example` directory and running `node server.js` and both http://localhost:3000/ and http://localhost:3000/help should render the correct templates.

Here's basic sample code (see the example directory for a more elaborate example):

```js
// super simple demo
var express = require('express');
var semiStatic = require('semi-static');

// init our app
app = express();

// use jade
app.set('view engine', 'jade');

// serve our static files
app.use(express.static(__dirname + '/public'))

// register our handler
app.get('*', semiStatic());

// we can still have a normal 404 at the end
// because it will only do something if there's
// a path that matches.
app.all('*', function (req, res) {
    res.send('not found', 404);
});

app.listen(3000);
console.log('started');
```


## Options / How it works

All it needs is the folder where your "static" templates live and the file extension your templates use.

Defaults are `jade` as a file extension and `__dirnam + '/views/static'` as the directory.

If that's not the case you can set the options as follows:

```js
app.get('/hello*', semiStatic({
    folderPath: __dirname + '/my-other-folder',
    fileExt: 'ejs',
    root: '/hello'
}));
```

That's it, easy-peasy.


## Little sneaky static sites within your app (great for docs)

If you want to serve an `index` file you can do that too.

So if you do this:

```js
app.get('*', semiStatic());
```

And put a file called `index.jade` inside `views/static` it will get served at `yoursite.com` as well as `yoursite.com/index`.

This is so you can basically have little mini static sites inside your app. For example, I like doing stuff like this for serving out a little semi-static help site within an app:

```js
app.get('/help*', semiStatic({
    folderPath: __dirname + '/help-site',
    root: '/help'
}));
```

As long as you've got a folder with an `index.jade` file in it your help site will be available at `yoursite.com/help`

## License

MIT


If you think this is handy. Follow [@HenrikJoreteg](https://twitter.com/henrikjoreteg) on the twitters. See you on the interwebz!
