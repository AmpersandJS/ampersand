/*global test equal deepEqual _*/

// ok() checks for truthiness
// equal() tests for equal with '=='
// strictEqual() is '==='
// deepEqual()

module("omniHTML");

test("finds names", function () {
    equal(_('run @henrik run').omniHTML(), "run <span class='name'>@henrik</span> run");
    equal(_('run @@henrik run').omniHTML(), "run @<span class='name'>@henrik</span> run");
    equal(_('@henrik run').omniHTML(), "<span class='name'>@henrik</span> run");
    equal(_('run @henrik @bob').omniHTML(), "run <span class='name'>@henrik</span> <span class='name'>@bob</span>");
});

test("finds tags", function () {
    equal(_('this is #awesome').omniHTML(), "this is <span class='tag'>#awesome</span>");
    equal(_('this is #awesome #indeed').omniHTML(), "this is <span class='tag'>#awesome</span> <span class='tag'>#indeed</span>");
    equal(_('this is #awesome#indeed').omniHTML(), "this is <span class='tag'>#awesome</span>#indeed");
    equal(_('#awesome').omniHTML(), "<span class='tag'>#awesome</span>");
});

test("urlize", function () {
    equal(_('something something.com').omniHTML(), 'something <a href="http://something.com" target="_blank">something.com</a>');
    equal(_("@chuck_norris - email bob@dole.gov regarding @recon project.").omniHTML(), "<span class='name'>@chuck_norris</span> - email <a href=\"mailto:bob@dole.gov\" target=\"_blank\">bob@dole.gov</a> regarding <span class='name'>@recon</span> project.");
});

test("parsing", function () {
    var input, result;

    input = '!';
    result = _.omniParse(input);
    equal(result.command, 'active_task');
    equal(result.title, '');

    input = '! @henrik';
    result = _.omniParse(input);
    equal(result.command, 'active_task');
    deepEqual(result.targets, {'henrik': true});
    deepEqual(result.mentions, {});
    equal(result.title, '');

    input = '!henrik do something';
    result = _.omniParse(input);
    equal(result.command, 'active_task');
    deepEqual(result.targets, {'henrik': true});
    deepEqual(result.mentions, {});
    equal(result.title, "do something");
    equal(result.details, null);

    input = '!henrik do something -- something amazing, that is';
    result = _.omniParse(input);
    equal(result.command, 'active_task');
    deepEqual(result.targets, {'henrik': true});
    deepEqual(result.mentions, {});
    equal(result.title, "do something");
    equal(result.details, "something amazing, that is");

    input = '!henrik do something -- something amazing, that is #andbang';
    result = _.omniParse(input);
    equal(result.command, 'active_task');
    deepEqual(result.targets, {'henrik': true});
    deepEqual(result.mentions, {});
    equal(result.title, "do something");
    equal(result.details, "something amazing, that is");
    deepEqual(result.tags, {'andbang': true});

    input = '$ do another thing';
    result = _.omniParse(input);
    equal(result.command, 'task');
    deepEqual(result.targets, {});
    deepEqual(result.mentions, {});
    equal(result.title, "do another thing");
    equal(result.details, null);

    input = '$henrik @adam - do something else';
    result = _.omniParse(input);
    equal(result.command, 'task');
    deepEqual(result.targets, {'henrik': true, 'adam': true});
    deepEqual(result.mentions, {});
    equal(result.title, "do something else");
    equal(result.details, null);

    input = '$henrik $adam - do something else -- @andyet assumes it will be amazing -- because it usually is.  ';
    result = _.omniParse(input);
    equal(result.command, 'task');
    deepEqual(result.targets, {'henrik': true, 'adam': true});
    deepEqual(result.mentions, {'andyet': true});
    equal(result.title, "do something else");
    equal(result.details, "@andyet assumes it will be amazing -- because it usually is.");

    input = ' do @henrik a favor -- the @client has requested it';
    result = _.omniParse(input);
    equal(result.command, null);
    deepEqual(result.targets, {});
    deepEqual(result.mentions, {'henrik': true, 'client': true});
    equal(result.title, "do @henrik a favor");
    equal(result.details, "the @client has requested it");

    input = 'here are some tags #we #love #tags';
    result = _.omniParse(input);
    equal(result.command, null);
    deepEqual(result.targets, {});
    deepEqual(result.mentions, {});
    equal(result.title, "here are some tags");
    equal(result.details, null);
    deepEqual(result.tags, {'we': true, 'love': true, 'tags': true});

    input = 'here are ignored #extra #twitter #seo tags -- we don\'t #play that way. #real #tags';
    result = _.omniParse(input);
    equal(result.command, null);
    deepEqual(result.targets, {});
    deepEqual(result.mentions, {});
    equal(result.title, "here are ignored #extra #twitter #seo tags");
    equal(result.details, "we don\'t #play that way.");
    deepEqual(result.tags, {'real': true, 'tags': true});
});
