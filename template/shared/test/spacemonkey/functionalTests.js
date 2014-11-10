/*global monkey, test*/

// these tests assume you've loaded the default fixture
monkey.loadApp('/', {
    height: 500,
    width: 600,
    bugUrl: 'https://github.com/henrikjoreteg/humanjs-sample-app/issues/new'
});

test('basic app experience', function () {
    monkey
        .log('starting')
        .waitForVisible('[data-hook="page-container"] .page')
        .confirm('The app loaded to the home page.')
        .confirm('The "home" nav tab is active')
        .goToPage('/collections')
        .confirm('Collection demo page visible')
        .confirm('List of people are visible each with avatars')
        .instruct('Five users will be added. Please ensure.', [
            'each one is added at the bottom of the list',
            'each has a readable name an avatar'
        ])
        .click('[data-hook="add"]')
        .click('[data-hook="add"]')
        .click('[data-hook="add"]')
        .click('[data-hook="add"]')
        .click('[data-hook="add"]')
        .confirm('Everything look ok?')
        .confirm('I can visually re-arrange them by pressing, "shuffle"')
        .confirm('I can hit reset and they disappear, and fetch and they come back.')
        .confirm('I can delete them by clicking "delete"')
        .goToPage('/info')
        .confirm('Info page is visible')
        .destroy();
});
