# clientconfig

Super simple mechanism for passing config items, such as API connection URLs, debug modes, etc from the server to client.

This is handy for apps built as single page apps where you're sending a pre-built js application to the client but still want to be able to pass it configuration information.

This is a very simple client side module for [browserify](https://github.com/substack/node-browserify). For more info on the approaches used here check out [humanjavascript.com](http://humanjavascript.com).

If you want to use it as a standalone, or with AMD etc. You can use `clientconfig.bundle.js`. It has no dependencies.

Since we're using cookies, here are some pertinent warnings as so aptly put by @lauriro [here](https://github.com/litejs/browser-cookie-lite#notes):

>Unless sent over a secure channel (such as HTTPS), the information in cookies is transmitted in the clear text.
>
>All sensitive information conveyed in these headers is exposed to an eavesdropper.
>A malicious intermediary could alter the headers as they travel in either direction, with unpredictable results.
>A malicious client could alter the Cookie header before transmission, with unpredictable results.

In short, don't send sensitive info this way unless you're on https.

## How does it work?

Clientconfig simply looks for a cookie named `config` parses it at JSON and immediately wipes it out to avoid burdening subsequent requests with that extra overhead.

## How do I use it?

On the serverside when serving up your reqeust set a cookie containing the values you'd like to pass to the client in JSON.  

If you're using node.js, express and `getconfig` it'd work like this:

sample config file:

```json
{
    "client": {
        "apiConnectionUrl": "https://dev.api.com",
        "debugMode": true,
        "enviroment": "dev"
    },
    "otherServerConfigItems": {
        "dbpasswords": "etc"
    }
}
```

sample server:

```js
var app = require('express')(),
    config = require('getconfig');

// our sample request handler
app.get('/app', function (req, res) {
    // here we set a cookie called "config" to a JSON encoded settings object
    res.cookie('config', JSON.stringify(config.client));
    // then render the html and respond
    res.render('app');
});

app.listen(80);
```

sample client usage:

```js
var config = require('clientconfig');

console.log(config.apiConnectionUrl); // prints out connection url from server config JSON file

```

## Installing

```
npm i clientconfig
```

Add it to your clientmodules or user browserify to include it in your app. voila!


## Feedback

If you dig it, follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on the twitterwebs. If not, file issues or send pull requests :)

## License

MIT
