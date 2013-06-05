/*

helpers/metrics.js

Sample module for tying into event-based metrics systems
like mixpanel, kissmetrics, etc.

*/

/*global mixpanel*/

// flag for tracking if we're in production
var isLive = window.location.hostname === 'YOUR DOMAIN.com';


// It's common for metrics services to have some sort of "identification" step
// where you provide name and metadata about the user.
exports.identify = function (me) {
    if (isLive) {
        mixpanel.identify(me.id);
        mixpanel.name_tag(me.username);
        mixpanel.people.set({
            $email: me.email,
            $first_name: me.firstName,
            $last_name: me.lastName
        });
        mixpanel.people.increment('web app opened');
    }
};


// Logs the given action with the given data.
// action: A string representing the action to be logged.
// dict: A dictionary with additional action information.
// cb: Optional callback if you want to ensure it's tracked
// before say setting window.location
exports.track = function (action, dict, cb) {
    // allow the dict parameter to be omitted.
    if (isLive) {
        mixpanel.track(action, dict || {}, cb);
    }
};
