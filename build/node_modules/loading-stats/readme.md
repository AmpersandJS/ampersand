# loading-stats

Getting real-world performance metrics from deployed single page webapps is super useful. 

You can see how caching strategies affect load times and also make sure you're not causing speed regressions over time. When you're working on localhost or fast internet you may do things that seem like acceptable speed tradeoffs that actually are significantly more impactful for your users who may be on slower connections. By having these metrics reported back from each user you can very quickly get great perspective on how your app is performing for people.

This is a very simple client side module (compatible with [clientmodules](https://github.com/henrikjoreteg/clientmodules) and [browserify](https://github.com/substack/node-browserify)) for tracking that load time and the various pieces of it and is designed to be used for reporting back to a metrics service. At &yet we send this as metadata for our "applicationLoaded" event that gets sent to (usually) mixpanel. But which one doesn't really matter, this just tracks the times and reports them. 

Ultimately this approach is still flawed. The real way to do this is using the HTML5 performance API: http://www.html5rocks.com/en/tutorials/webperformance/basics/.

The trick is, it isn't basically only available in Chrome at the moment, which doesn't give us a very complete picture. So we do this for now to get some idea. I'm trying to figure out a good way to use the performance API if it exists without muddying up the data here.

Anyway, here's how it works.


## How to use it

Add this bit of vanilla JS to your base HTML as high up in the `<head>` as you can. To get as accurate of a load start time as possible:

```html
<!DOCTYPE html>
<script>window.times = {start: Date.now()};</script>
<script src="app.js"></script>
```

Then at various points that you want to track within your app's load sequence, just call `recordTime()` with whatever description makes sense for your app:


```js
// require our module
var loadStats = require('loading-stats');

// for example
loadStats.recordTime('begin launch sequence');

// sometime later you may do...
loadStats.recordTime('initial data fetched');

// then get your summary and send it off to your
// metrics service. For example
mixpanel.track('web app loaded', loadStats.getSummary());

/*
the .getSummary(); method will return an object
that looks like this. With each event being miliseconds
from the start time we put in our HTML above.

{
    'begin launch sequence': 100,
    'begin launch sequence': 323,
    'fully loaded': 431
}
*/

```

There's also a `recordStat` that just takes a name/value. Say you want to count bytes of initial data or something.

```js

var loadStats = require('loading-stats');

// this just adds it in so when you call .getSummary()
// this will be listed in there too. 
loadStats.recordStat('number of teams', teams.length);

```

This is useful since additional stats about the amount of data we're pulling down or if they're a power user who has gobs of data, that will help give context to and explain the longer load times.


## Getting *real* stats in the wild is awesome

yup.


## Installing

```
npm i loading-stats
```

Add it to your clientmodules or user browserify to include it in your app. voila!


## Feedback

If you dig it, follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on the twitterwebs. If not, file issues or send pull requests :)

## License

MIT
