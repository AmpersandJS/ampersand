/*global monkey jQuery QUnit socket*/
monkey.extend('keyDown', function (id, key, callback) {
    var e = jQuery.Event('keydown');
    e.which = key;
    this.$(id).trigger(e);
    callback();
});

monkey.extend('keyUp', function (id, key, callback) {
    var e = jQuery.Event('keyup');
    e.which = key;
    this.$(id).trigger(e);
    callback();
});

monkey.extend('setValue', function (id, value, callback) {
    var cb;
    if (typeof(id) === 'object') {
        cb = value;
        for (var item in id) {
            this.$(item).val(id[item]).focus().blur();
        }
    } else {
        cb = callback;
        this.$(id).val(value).focus().blur();
    }
    cb();
});

monkey.extend('clearValue', function (id, callback) {
    var selectors = $.isArray(id) ? id : [id],
        i = 0;
    for (i; i < id; i++) {
        this.$(id[i]).val('');
    }
    callback();
});

monkey.extend('clearAllValues', function (callback) {
    $(':input', this.window).val('');
    callback();
});

monkey.extend('omniboxCommand', function (value, callback) {
    var e = jQuery.Event('keyup');
    e.which = 13;
    this.$('#awesomeSauce').val(value).trigger(e);
    callback();
});

monkey.extend('waitForSocketEvent', function (type, howMany, callback) {
    this.expect(howMany);
    var socket = this.window.socket,
       handler = function (message) {
            if (message.event === type) {
                QUnit.ok(true, 'socket got ' + type + ' event');
                callback();
            }
        };

    socket.on('message', handler);
});

monkey.extend('pause', function (ms, callback) {
    setTimeout(callback, ms);
});

monkey.extend('waitForClass', function (selector, className, callback) {
    var self = this;
    self.expect(1);

    var intervalId = setInterval(function () {
        var element = self.window.$(selector);
        if (element.hasClass(className)) {
            QUnit.ok(true, selector + ' has class \'' + className + '\'');
            clearTimeout(intervalId);
            callback();
        }
    }, 100);
});

monkey.extend('waitForAttribute', function (selector, attribute, value, callback) {
    var self = this;
    self.expect(1);

    var intervalId = setInterval(function () {
        var element = self.window.$(selector);
        if (element.attr(attribute) == value) {
            QUnit.ok(true, selector + '\'s \'' + attribute + '\' attribute is \'' + value + '\'');
            clearTimeout(intervalId);
            callback();
        }
    }, 100);
});

monkey.extend('waitForContent', function (selector, content, callback) {
    var self = this;
    self.expect(1);

    var intervalId = setInterval(function () {
        var element = self.window.$(selector);
        if (element.text() == content) {
            QUnit.ok(true, selector + '\'s text content is \'' + content + '\'');
            clearTimeout(intervalId);
            callback();
        }
    }, 100);
});

monkey.extend('open', function (url, callback) {
    var newUrl = '//' + this.window.location.host + url;
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
    this.window.location = newUrl;
    waitForPage(this, newUrl, callback);
});

monkey.extend('waitForVisible', function (selector, callback) {
    var self = this;
    self.expect(1);

    var intervalId = setInterval(function () {
        var element = (self.window.$) ? $(selector, self.window.document)[0] : self.window.document.querySelector(selector);

        if ($(element).is(':visible')) {
            QUnit.ok(true, selector + ' is visible');
            clearTimeout(intervalId);
            callback();
        }
    }, 100);
});

monkey.extend('assertNumberVisible', function (selector, howMany, callback) {
    var self = this;
    self.expect(1);

    var intervalId = setInterval(function () {
        var el = $(selector, self.window.document);

        if (el.is(':visible')) {
            QUnit.equal(el.length, howMany, howMany + ' elements that matched ' + selector + ' are visible');
            clearTimeout(intervalId);
            callback();
        }
    }, 100);
});

monkey.extend('click', function (selector, callback) {
    this.$(selector).trigger('click');
    callback();
});

monkey.extend('goToPage', function (page, callback) {
    var self = this,
        selector,
        intervalId;
    this.window.app.navigate(page);
    self.expect(1);

    self.log('loading page: ' + page);

    intervalId = setInterval(function () {
        var element = $(self.window.app.currentPage.el);
        if (element.hasClass('active')) {
            QUnit.ok(true, 'went to page \'' + page + '\'');
            clearTimeout(intervalId);
            setTimeout(callback, 0);
        }
    }, 100);
});

monkey.extend('waitForNotVisible', function (selector, callback) {
    var self = this;
    self.expect(1);

    var intervalId = setInterval(function () {
        if (!$(selector, self.window.document).is(':visible')) {
            QUnit.ok(true, selector + ' is not visible');
            clearTimeout(intervalId);
            callback();
        }
    }, 100);
});

monkey.extend('waitForEmpty', function (container, callback) {
    var self = this;
    this.expect(1);
    var intervalId = setInterval(function () {
        var element = self.window.$(container);

        if (element.children().length === 0) {
            QUnit.ok(true, container + ' is empty');
            clearTimeout(intervalId);
            callback();
        }
    }, 100);
});

monkey.extend('clearChat', function (callback) {
    monkey.window.team.groupChat.messages.each(function (m) {m.deleteServer(); });
    callback();
});

monkey.extend('clearTasks', function (userSlug, callback) {
    monkey.window.team.getUser(userSlug).tasks.each(function (m) {m.deleteServer(); });
    callback();
});

monkey.extend('postChat', function (team, value, callback) {
    //console.log('called');
    this.window.app.api.sendChat(team, value, function () {
        callback && callback();
    });
});


monkey.extend('mainInput', function (value, callback) {
    this.$('.mainPageInput').val(value);
    callback();
});

monkey.extend('login', function (un, pw, callback) {
    monkey.open('/login')
    .waitForVisible('#login')
    .setValue({
        '#username': un,
        '#password': pw
    })
    .pause(200)
    .click('#loginButton')
    .waitForVisible('#pages');
});
