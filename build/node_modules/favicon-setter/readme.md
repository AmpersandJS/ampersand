# favicon-setter

Super simple util for setting the favicon of a page:

- No dependencies
- Only works in browsers that let you dynamically set favicons: FF, Opera, Chrome
- Is exported as CommonJS for those who like that <3
- Becomes a jQuery plugin if not commonJS and jquery is on the page
- Else add a `setFavicon` function to the `window`

## How to use it:


Step 1. include it:

```html
<script src="favicon-setter.js"></script>
```

Step 2. Set your favicon like so:

```js
window.setFavicon('/new-url.png'); // should be 16x16 image (pngs are best)
```

That's it!


## CommonJS Version

If you're using this on the client but your project is in node.js you can install this with: https://github.com/henrikjoreteg/clientmodules and npm:

```
npm install favicon-setter
```

Then just do this:

```js
var setFavicon = require('favicon-setter');

setFavicon('/new-url.png');
```

## jQuery

If you've got jquery on the page, insert this after including jQuery.

```js
$.setFavicon('/new-url.png');
```

## Restoring the original

Just one other little trick. If the original favicon was set by using a `<link rel="shortcut icon">` tag then you can restore the original after setting it by calling `setFavicon()` without any arguments.

## Credits

Props to [@mathias](http://twitter.com/mathias) for this: https://gist.github.com/428626 which served as starting point for this code.


## License

MIT

If you like this, follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on the twitterwebz.
