# cookie-getter

Super simple, performant, clientside CommonJS cookie reader and nothing else.

CommmonJS and [browserify](http://browserify.org/) compatible.


## Why publish another cookie tool?

Dead simple 4-line function that has the best performance according to: http://jsperf.com/cookie-parsing

Handy to have as a seperate module for easy installation with npm.


## Usage

installing: 

```
npm install cookie-getter
```

using:

```js
var cookies = require('cookie-getter');

// returns the value of the cookie if it's just a simple string
var username = cookies('username');

// if the cookie is a JSON string it will parse it as well
user = cookies('user');

console.log(user.firstName); // logs out name of firstName value if encoded as JSON in cookie.
```

## License

MIT
