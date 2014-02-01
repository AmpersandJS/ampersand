# slugger

Dead simple slugification for node and browser.

## What it does:

Converts any string into a url friendly veresion:

```js
slugger('Hello yOu CRAZY Swede!'); // returns 'hello-you-crazy-swede'

// optionally maintain case
slugger('Hello yOu CRAZY Swede!', {maintainCase: true}); // returns 'Hello-yOu-CRAZY-Swede'

// optionally use a different replacement character
slugger('Hello yOu CRAZY Swede!', {replacement: '_'}); // returns 'hello_you_crazy_swede'

// optionally trim to max length while not breaking any words
slugger('Hello yOu CRAZY Swede!', {smartTrim: 9}); // returns 'hello-you'

```

That's all there is to it!

## Installing

```
npm install slugger
```

Or just grab the slugger.js file and drop it into your project.

It also plays nicely with: https://github.com/henrikjoreteg/clientmodules

## Why did I write this when there's already https://github.com/dodo/node-slug ?

Because I wanted something simpler that didn't try to do anything with special characters or unicode and I wanted something that worked well in the browser or node.

## Tests? 

yup.

## Dig it?

Then you should probably follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter.

## License
 
MIT
