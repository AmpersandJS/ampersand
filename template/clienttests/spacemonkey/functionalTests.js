/*global monkey test*/

// these tests assume you've loaded the default fixture
monkey.loadApp('/app', {
    height: 500,
    width: 600,
    bugUrl: 'https://github.com/andyet/andbang.com/issues/new'
});

test('basic app experience', function () {
    monkey
        .log('starting')
        .waitForVisible('#pages .page')
        .confirm('The app should have loaded to chat page of first team.')
        .confirm('The app scrolled all the way to the bottom')
        .instruct('Some chats will be posted. Please ensure.', [
            'embedded images are loaded',
            'chat stays scrolled to bottom',
            'new chats from same user are grouped'
        ])
        .postChat('hackers', "Hello there, you're testing, this is good.")
        .postChat('hackers', "So I saw this awesome image: http://cl.ly/image/0V220112140t")
        .postChat('hackers', "and this neat video: http://vimeo.com/55830910")
        .confirm('Did it work?')
        .instruct("We're going to slam a bunch of chats in very fast", [
            'They should appear instantly and somewhat faded',
            'when API confirms, they should be replaced by "solid" versions',
            'no greyed out ones should be left'
        ])
        .repeat(function (cb, index) {
            this.window.app.api.sendChat('hackers', 'hello ' + index);
            cb();
        }, 50)
        .confirm('Did it work? The last one should say "hello 1"')
        .goToPage('stooges/moe')
        .confirm('Add a task. Task page looks ok')
        .goToPage('stooges/larry/chat')
        .destroy();
});





        /*
        .log('invite someone')
            .goToPage('stooges/settings')
            .click('.noAdd a')

            .waitForVisible('#cardnumber')
            .setValue({
                '#cardnumber': '4111111111111111',
                '#expmonth': '01',
                '#expyear': '2012',
                '#cvv': '123'
            })
            .pause(200)
            .click('.submit')
            .waitForVisible('.showSuccess')
            .click('.showSuccess a')
            .waitForVisible('#emailField')
            .setValue({
                '#emailField': 'henrik@joreteg.com'
            })
            .click('.submit')

        .log('go to join team page')
            .open('/join-team?team=stooges&invite=team_invite')
            .pause(200)
            .waitForVisible('#differentUser')
            .click('#differentUser')
        .log('go to login page')
            .waitForVisible('#login')
            .pause(200)
            .click('#registerLink')
            .waitForVisible('#registerLink')
            .pause(200)
        .log('go to registration page')
            .pause(200)
            .setValue({
                '#firstName': 'Henrik',
                '#lastName': 'Tester',
                '#username': 'bob2',
                '#email': 'henrik@andyet.net'
            })
        .log('submitting with incomplete should fail')
            .click('#signupSubmit')
            .waitForClass('#register article', 'fail')
        .log('adding password')
            .pause(200)
            .setValue('#password', 'tester')
            // submitting with complete... should now work
            .click('#signupSubmit')
            .waitForClass('#signup article', 'victory')
            .waitForVisible('#pages')
        .log('we should now have some tasks for first login')
            .goToPage('bob2')
            .waitForVisible('.page > .me .tasks .task')
            .pause(200)
            .click('.page > .me a.ship')
        .log('deleting tasks')
            .waitForNotVisible('.page > .me .tasks .task')
        .log('we should also have some chat messages')
            .goToPage('backchannel')
            .assertNumberVisible('.messages li', 12)
            .pause(200)
        .log('send a team invitation')
            .goToPage('inviteUser')
            .waitForVisible('#emailField')
            .setValue({'#emailField': 'henrik@andyet.net'})
            .pause(5000)
            .click('button.submit')
            .log('should be a real email')
            .waitForVisible('.showSuccess h4')
        .log('log in as bob test again')
            .open('/login')
            .waitForVisible('#login')
            .setValue({
                '#username': 'bob2',
                '#password': 'tester'
            })
            .pause(200)
            .click('#loginButton')
        .log('app should load this time without any tasks')
            .waitForVisible('#pages')
            .goToPage('bob2')
            .waitForVisible('.page > .me .tasks')
            .pause(200)
            .waitForNotVisible('.page > .me .tasks .task')
        .log('we should still have the same number of chat messages')
            .goToPage('backchannel')
            .assertNumberVisible('.messages li', 12)
            .destroy();
});

    */

/*
test('omnibox commands', function () {
    monkey
        .goToPage('stooges/moe')
        .log('add a task to own list')
            .omniboxCommand('test task')
            .waitForVisible(':contains("test task")')
        .log('ship the task')
            .click(':contains("test task") a.ship')
            .waitForNotVisible(':contains("test task")')
        .log('delegate a task to the team')
            .omniboxCommand('$team do something')
            .waitForVisible('.page.me :contains("do something")')
        .log('check larrys page')
            .goToPage('stooges/larry')
            .waitForVisible(':contains("do something")')
        .log('ship my own task')
            .goToPage('stooges/moe')
            .click('.page.me a.trash')
            .waitForNotVisible('.page.me :contains("do something")')
            .destroy();
});
*/

/*
test('send invitation', function () {
    monkey
        .log('send test team invitation')
            .click('#inviteMember a')
            .waitForVisible('#inviteDialog')
        .log('invite dialog visible')
            .pause(200)
            .setValue({'#inviteInput': 'henrik@andyet.net'})
            .waitForVisible('.upgradeNotice')
            .waitForContent('.upgradeNotice span.change', '50')
            .click('button.send')
            .waitForNotVisible('#inviteDialog')
        .log('now we do it again')
            .pause(2000)
            .click('#inviteMember a')
            .waitForVisible('#inviteDialog')
        .log('dialog open again')
            .destroy();
});
*/

/*
test('join team', function () {
    monkey
        .log('new team member signing up')
            .open('/join-team?team=stooges&invite=team_invite')
            .waitForVisible('#joinTeam')
            .setValue({
                '#firstName': 'Other',
                '#lastName': 'Guy',
                '#username': 'other',
                '#email': 'other@andyet.net',
                '#password': 'tester'
            })
            .pause(200)
            .click('#joinTeamSubmit')
        .log('form validation should fail')
            .waitForClass('#joinTeam article', 'fail')
            .setValue('#password2', 'tester')
            .click('#joinTeamSubmit')
            .waitForClass('#joinTeam article', 'victory')
        .log('he should be able to log in')
            .waitForVisible('#pages')
            .pause(200)
            .destroy();
});
*/
