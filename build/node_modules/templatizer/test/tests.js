/* globals test, ok, templatizer, templatizer_unaltered, templatizer_multiple_dirs */

var data = {
    users: [{
        name: 'larry',
        url: 'http://andyet.com',
        id: 1
    }, {
        name: 'curly',
        url: 'http://andbang.com',
        id: 2
    }, {
        name: 'moe',
        url: 'http://talky.io',
        id: 3
    }]
};

test("Test mixins", function () {
    var users = templatizer.usersMixins({users: data.users});
    var user_li = templatizer.usersMixins.user_li(data.users[0], 0);
    var user_a = templatizer.usersMixins.user_a(data.users[0], 0);
    
    var _users = '<ul>';
    for (var i = 0, m = data.users.length; i < m; i++) {
        _users += templatizer.usersMixins.user_li(data.users[i], i);
    }
    _users += '</ul>';

    ok(users === _users);
    ok(users.indexOf(user_li) > -1);
    ok(users.indexOf(user_a) > -1);
    ok(user_li.indexOf(user_a) > -1);
});

test("Test calling templates with different context", function () {
    var usersObj = {template: templatizer.usersMixins};
    var user_liObj = {template: templatizer.usersMixins.user_li};
    var user_aObj = {template: templatizer.usersMixins.user_a};

    var users = usersObj.template({users: data.users});
    var user_li = user_liObj.template(data.users[0], 0);
    var user_a = user_aObj.template(data.users[0], 0);
    
    var _users = '<ul>';
    for (var i = 0, m = data.users.length; i < m; i++) {
        _users += templatizer.usersMixins.user_li(data.users[i], i);
    }
    _users += '</ul>';

    ok(users === _users);
    ok(users.indexOf(user_li) > -1);
    ok(users.indexOf(user_a) > -1);
    ok(user_li.indexOf(user_a) > -1);
});

test("Test multiple dirs", function () {
    ok(templatizer_multiple_dirs.hasOwnProperty('test'));
    ok(!templatizer.hasOwnProperty('test'));

    ok(templatizer_multiple_dirs.otherfolder.hasOwnProperty('othertweet'));
    ok(templatizer_multiple_dirs.otherfolder.hasOwnProperty('othertweet2'));
    ok(templatizer.otherfolder.hasOwnProperty('othertweet'));
    ok(!templatizer.otherfolder.hasOwnProperty('othertweet2'));
});

test("Test altered vs unaltered mixins", function () {
    var users = templatizer.usersMixins({users: data.users});
    var _users = templatizer_unaltered.usersMixins({users: data.users});

    ok(users === _users);
});

test("Test for valid identifiers", function () {
    var page404 = templatizer['404'];

    ok(typeof page404 === 'function');
});

test("Test for nested mixins", function () {
    var nestedMixin = templatizer.otherfolder.nestedMixin;

    ok(typeof nestedMixin.user_li === 'function');
});