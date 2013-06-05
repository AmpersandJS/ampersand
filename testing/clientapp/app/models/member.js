var NavItems = require('models/navItems'),
    Task = require('models/task'),
    Tasks = require('models/tasks'),
    Messages = require('models/messages'),
    _ = require('underscore'),
    ChatPage = require('pages/member.chat'),
    urlToBase64 = require('urlToBase64'),
    StrictModel = require('strictmodel').Model;


module.exports = StrictModel.extend({
    // we only want to get shipped once, because we'll hang on to them once we have
    // them in memory
    init: function () {
        this.getShippedTasks = _.once(this.getShippedTasks);
        app.jobs.push(_.bind(this.handlePicUrlChange, this));
    },
    // every strict model needs a type
    type: 'member',
    // main properties as available via API
    props: {
        id: ['string', true],
        firstName: ['string', true],
        lastName: ['string', true],
        created: ['date'],
        email: ['string', true],
        username: ['string', true, ''],
        lastLogin: ['date'],
        activeTask: 'string',
        statusMessage: 'string',
        didTutorial: 'boolean',
        muted: 'boolean',
        textSize: ['string', true, 'medium'],
        presence: ['string', true, 'offline'],
        me: ['boolean', true, false],
        lastInteraction: ['date', true, '0'],
        pinned: ['boolean', true, false],
        smallPicUrl: ['string'],
        largePicUrl: ['string'],
        theirLastReadChatId: ['string', true, ''],
        myLastReadChatId: ['string', true, ''],
        latestChatId: ['string', true, '']
    },
    // derived properties and their dependencies. If any dependency changes
    // that will also trigger a 'change' event on the derived property so
    // we know to re-render the template
    derived: {
        team: {
            fn: function () {
                return this.collection.parent;
            }
        },
        fullName: {
            deps: ['firstName', 'lastName'],
            fn: function () {
                return this.firstName + ' ' + this.lastName;
            }
        },
        initials: {
            deps: ['firstName', 'lastName'],
            fn: function () {
                if (!this.firstName) return;
                return (this.firstName.charAt(0) + this.lastName.charAt(0)).toUpperCase();
            }
        },
        activeTaskTitle: {
            deps: ['activeTask'],
            fn: function () {
                var task = app.getModel('task', this.activeTask, this.team.id);
                return task ? task.taskTitleHtml : '';
            }
        },
        url: {
            deps: ['username'],
            fn: function () {
                return this.team.id ? this.team.url + '/' + this.username : '';
            }
        },
        tasksUrl: {
            deps: ['username'],
            cache: true,
            fn: function () {
                return this.url + '/tasks';
            }
        },
        lateredUrl: {
            deps: ['username'],
            fn: function () {
                return this.url + '/latered';
            }
        },
        shippedUrl: {
            deps: ['username'],
            fn: function () {
                return this.url + '/shipped';
            }
        },
        chatUrl: {
            deps: ['username'],
            fn: function () {
                return this.url + '/chat';
            }
        },
        atName: {
            deps: ['username'],
            fn: function () {
                return "@" + this.username;
            }
        },
        working: {
            deps: ['activeTask'],
            fn: function () {
                return !!this.activeTask;
            }
        },
        unread: {
            deps: ['myLastReadChatId', 'latestChatId'],
            fn: function () {
                return this.myLastReadChatId !== this.latestChatId;
            }
        }
    },
    // session variables are browser state for a model
    // these trigger 'change' events when set, but are not
    // included when serializing or saving to server
    session: {
        tasks: ['array', true, []],
        latered: ['array', true, []],
        shipped: ['array', true, []],
        lastPage: ['string', true, 'tasks'],
        active: ['boolean', true, false],
        // used to cache a chat message that you're writing
        // lets you switch pages and come back without losing it
        unsentChatText: ['string', true, ''],
        order: ['number', false, 0],
        hasChatHistory: ['boolean', true, true],
        historyHasBeenFetched: ['boolean', true, false],
        historyHasBeenRendered: ['boolean', true, false]
    },
    // child collections that will be initted. They will
    // be created at as a property of the same name as the
    // key. The child collection will also be given a reference
    // to its parent.
    collections: {
        messages: Messages
    }
});
