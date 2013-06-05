var StrictModel = require('strictmodel').Model,
    _ = require('underscore'),
    templates = require('templates'),
    omni = require('omnibox');


module.exports = StrictModel.extend({
    type: 'message',
    props: {
        id: ['string', true],
        team: ['string', true],
        created: ['date', true],
        to: ['string', true],
        from: ['string', true],
        message: ['string', true],
        body: ['string', true],
        meta: ['object', false],
        pause: ['string', false],
        continuation: ['boolean', true, false],
        messageType: ['string']
    },
    session: {
        alreadyTried: ['boolean', false, false],
        pending: ['boolean', true, false]
    },
    derived: {
        me: {
            cache: true,
            fn: function () {
                return this.from === me.id;
            }
        },
        paused: {
            cache: true,
            fn: function () {
                return this.pause > 1200000;
            }
        },
        messageCompat: {
            cache: true,
            fn: function () {
                return this.body || this.message;
            }
        },
        teamModel: {
            cache: true,
            fn: function () {
                return app.teams.get(this.team);
            }
        },
        formattedTime: {
            cache: true,
            fn: function () {
                return this.created.format('{MM}/{dd} {h}:{mm}{t}');
            }
        },
        htmlMessage: {
            cache: true,
            fn: function () {
                return omni.toHTML(this.messageCompat, this.teamModel);
            }
        },
        memberModel: {
            cache: true,
            fn: function () {
                return this.shippedBy || app.getModel('member', this.from, this.teamModel.id);
            }
        },
        taskUrl: {
            cache: true,
            fn: function () {
                return (this.messageType === 'shipped' || this.messageType === 'unshipped') && this.teamModel.url + '/task/' + this.taskId;
            }
        },
        taskId: {
            cache: true,
            fn: function () {
                return this.meta && this.meta.taskId;
            }
        },
        shippedBy: {
            cache: true,
            fn: function () {
                var memberId = this.meta && this.meta.memberId,
                    member;
                if (memberId) {
                    member = app.getModel('member', memberId, this.teamModel.id);
                }
                return member || '';
            }
        },
        taskTitleHtml: {
            cache: true,
            fn: function () {
                var taskTitle = this.meta && this.meta.taskTitle;
                return taskTitle ? omni.toHTML(taskTitle, this.teamModel) : '';
            }
        },
        html: {
            cache: true,
            fn: function () {
                return templates.includes.chatMessage({chat: this});
            }
        },
        partialHtml: {
            cache: true,
            fn: function () {
                return templates.includes.chatWrap({chat: this});
            }
        },
        mentionsMe: {
            cache: true,
            fn: function () {
                return ~this.messageCompat.search(new RegExp("(^|\\s)@(all|team|" + me.username.toLowerCase() + ")\\b", "i"));
            }
        },
        // the list of classes we want to render with this message
        classList: {
            cache: true,
            fn: function () {
                var msgType = this.messageType || this.type,
                    res = [msgType, 'chat'];
                if (this.paused) res.push('paused');
                if (this.me) res.push('fromMe');
                if (this.from === '&!' && msgType !== 'shipped' && msgType !== 'unshipped') res.push('system');
                if (this.pending) res.push('pending');
                else res.push('newSpeaker');
                return res.join(' ');
            }
        },
        messageClassList: {
            cache: true,
            fn: function () {
                var res = [];
                if (this.mentionsMe && this.messageType === 'chat') res.push('mentionsMe');
                if (this.pending) res.push('pending');
                return res.join(' ');
            }
        },
        permaLink: {
            cache: true,
            fn: function () {
                return this.teamModel.chatUrl + '/' + this.created.format('{M}-{d}-{yyyy}') + '/' + this.id;
            }
        },
        isChat: {
            fn: function () {
                return this.messageType === 'chat' || this.messageType === 'directChat';
            }
        }
    },
    shouldGroupWith: function (previous) {
        return previous && !this.paused && this.isChat && previous.isChat && previous.from === this.from;
    }
});
