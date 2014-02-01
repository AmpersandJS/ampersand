// set up test for server
var events = [
        'ms to starting app initiation',
        'ms to main view rendered',
        'ms to connection established',
        'ms to initial data fetched',
        'ms to page specific data fetched',
        'ms to fully rendered'
    ],
    eventsClone = events.slice(0);

// fake the "window" global since we're on the server
global.window = {
    times: {
        start: Date.now()
    }
};

var assert = require('assert'),
    loadStats = require('./loading-stats');


function maybeDone() {
    loadStats.recordTime(eventsClone.shift());
    if (!eventsClone.length) {
        var results = loadStats.getSummary(),
            previous = 0;

        // make sure results has the same number of keys
        // as the original
        assert.equal(Object.keys(results).length, events.length + 1);
        for (var item in results) {
            assert.ok(previous < results[item]);
            previous = results[item];
        }
        console.log(results);
        process.exit();
    } else {
        setTimeout(maybeDone, Math.random() * 500);
    }
}

loadStats.recordStat('number of events to record', 7);

setTimeout(maybeDone, 400);
