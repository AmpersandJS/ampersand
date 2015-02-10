/*global $, _, QUnit, ok*/

// mustache style templating
_.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
};

// a few templates
var templates = {};
templates.log = _.template('<li class="log">{{ message }}</li>');
templates.confirmation = _.template('<li class="confirmation">{{ message }} Press "y" or "n".</li>');
templates.instruct = _.template('<li class="instruct">{{ message }} <ul></ul> Press "y" when ready.</li>');

// Prevent QUnit from running the tests at the onload event
// Manually start the tests with QUnit.start();
QUnit.config.autostart = false;

// Reset QUnit session storage because it does more harm than good
sessionStorage.clear();

// Our main container
function SpaceMonkey() {
    this.config = {};
    this.tests = [];
    this.tasks = [];
    this.fn = SpaceMonkey.prototype;
}

SpaceMonkey.prototype.loadApp = function (url, options) {
    var self = this;
    $(window).on('load', function () {
        var iframe = $('#app');
        $.extend(self.config, {
            width: '800',
            height: '500',
            scrolling: 'auto',
            frameborder: '0'
        }, options || {});

        iframe.on('load', function () {
            $(document).trigger('appready');

            // Define the window handle for Dominator to run against
            self.window = document.getElementById('app').contentWindow;

            // shortcut for jQuery accessor
            self.$ = function (selector) {
                return $(selector, self.window.document);
            };

            // grab our instruction container
            self.instructionEl = $('#instructions');

            // Run QUnit tests
            QUnit.start();
        });

        iframe.attr({
            height: self.config.height,
            width: self.config.width,
            frameborder: 0,
            src: url
        });
    });
};

SpaceMonkey.prototype.addTest = function (name, fn) {
    var self = this;
    this.tasks.push({
        name: name,
        task: function (callback) {
            fn.apply(self);
        }
    });
};

SpaceMonkey.prototype.extend = function (name, fn) {
    var self = this;

    SpaceMonkey.prototype[name] = function () {
        var args = Array.prototype.slice.call(arguments);

        self.tasks.push({
            name: name,
            task: function (callback) {
                args.push(callback);
                fn.apply(self, args);
            }
        });

        return self;
    };
};

SpaceMonkey.prototype.expect = function (count) {
    QUnit.expect(QUnit.config.current.expected + count);
};

SpaceMonkey.prototype.destroy = function () {
    var self = this;
    QUnit.stop();

    (function runner() {
        if (self.tasks.length <= 0) {
            QUnit.start();
            return;
        }

        var task = self.tasks.shift();

        // @todo need to allow tasks indicate that they must preceed an action.
        //       example: extend('waitForEvent', { waitForAction:true }, function () {});

        if (self.tasks.length > 0 && (self.tasks[0].name === 'waitForEvent' ||
                                      self.tasks[0].name === 'waitForPage')) {
            // run the wait task and allow it to call the next task (continue the chain).
            self.tasks.shift().task(runner);
            // run the action task and block it from calling the next task.
            task.task(function () {});
        }
        else {
            task.task(runner);
        }
    })();
};

window.monkey = new SpaceMonkey();

//
// Default Actions
//
// Feel free to override these by creating a new file
// such as 'SpaceMonkey.mine.js' and replace actions using:
//
//     SpaceMonkey.extend('open', function (id, callback) {
//         console.log('my take on open.');
//         callback();
//      });
//
(function (monkey) {

    function toPage(id) {
        return 'default/' + id.replace(/^#/, '') + '.html';
    }

    function waitForPage(self, page, callback) {
        self.expect(1);

        var intervalId = setInterval(function () {
            if (self.window && self.window.location.href.indexOf(page) >= 0) {
                QUnit.ok(true, page + ' loaded');
                clearTimeout(intervalId);
                callback();
            }
        }, 100);
    }

    monkey.extend('open', function (id, callback) {
        id = toPage(id);
        this.window.location.href = id;
        waitForPage(this, id, callback);
    });

    monkey.extend('click', function (selector, callback) {
        var e = document.createEvent('MouseEvents');
        e.initEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

        var els = this.window.document.querySelectorAll(selector);

        console.log('els', els);
        els.forEach(function (el) {
            console.log('hre');
            el.dispatchEvent(e);
        });
        callback();
    });

    monkey.extend('waitForVisible', function (selector, callback) {
        var self = this;
        self.expect(1);

        var intervalId = setInterval(function () {
            var element = self.$(selector)[0],
                style = self.window.getComputedStyle(element, null);

            if (style && style.display !== 'none' && style.visibility === 'visible') {
                QUnit.ok(true, selector + ' is visible');
                clearTimeout(intervalId);
                callback();
            }
        }, 100);
    });

    monkey.extend('waitForNotVisible', function (selector, callback) {
        var self = this;
        self.expect(1);

        var intervalId = setInterval(function () {
            var element = self.window.document.querySelector(selector);
            var style   = self.window.getComputedStyle(element, null);

            if (!element || !style || style.display === 'none' || style.visiblity !== 'visible') {
                QUnit.ok(true, selector + ' is not visible');
                clearTimeout(intervalId);
                callback();
            }
        }, 100);
    });

    monkey.extend('waitForEvent', function (selector, event, callback) {
        var self = this;
        self.expect(1);

        self.window.document.querySelector(selector).addEventListener(event, function () {
            ok(true, event + ' event fired on ' + selector);
            self.window.removeEventListener(event, arguments.callee, false);
            callback();
        }, false);
    });

    monkey.extend('waitForPage', function (id, callback) {
        var self = this;
        waitForPage(this, toPage(id), callback);
    });

    monkey.extend('log', function (message, callback) {
        this.instructionEl.append('<li class="log">' + message + '</li>');
        callback();
    });

    monkey.extend('instruct', function (message, items, callback) {
        if (arguments.length === 3) {
            if (!_.isArray(items)) {
                throw new Error('Second argument to instruct must be an array');
            }
        } else {
            callback = items;
            items = false;
        }

        var newEl = $(templates.instruct({message: message}));

        // TODO this should happen in the template, but underscore templates are painfully ugly, IMO.
        if (items) {
            _.each(items, function (item) {
                newEl.find('ul').append('<li>' + item + '</li>');
            });
        } else {
            newEl.find('ul').remove();
        }


        this.instructionEl.append(newEl);

        $(document).on('keypress.confirm', function (e) {
            if (e.which === 121) {
                $(document).off('keypress.confirm');
                callback();
            }
        });
    });

    monkey.extend('confirm', function (message, callback) {
        var li = $('<li class="confirmation">' + message + ' Press "y" or "n".</li>'),
            self = this;

        this.expect(1);
        $(document).on('keypress.confirm', function (e) {
            function done(ok) {
                $(document).off('keypress.confirm');
                QUnit.ok(ok, message);
                callback();
            }
            if (e.which === 121) {
                li.addClass('confirmed');
                done(true);
            }
            if (e.which === 110) {
                li.addClass('failed');
                if (self.config.bugUrl) {
                    li.append(' <a target="_blank" href="' + self.config.bugUrl + '?title=' + encodeURIComponent(message) + '&body=' + encodeURIComponent('Encountered while running SpaceMonkey tests.\n\nBrowser:\n' + navigator.userAgent) + '">report bug</a>');
                }
                done(false);
            }
        });
        this.instructionEl.append(li);
    });

    monkey.extend('repeat', function (fn, times, callback) {
        var self = this;
        function next() {
            if (times) {
                fn.call(self, next, times--);
            } else {
                callback();
            }
        }
        next();
    });

})(window.monkey);
