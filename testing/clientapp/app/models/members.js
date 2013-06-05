var BaseCollection = require('models/baseCollection'),
    Member = require('models/member');


module.exports = BaseCollection.extend({
    type: 'members',
    model: Member,
    initialize: function (models, options) {
        this.on('dataloaded', this.initBindings, this);
    },
    initBindings: function () {
        this.bind('add remove reset change:presence', this.setMemberOrder, this);
        this.setMemberOrder();
    },
    canAdd: function () {
        return true;
    },
    getByUserId: function (userId) {
        return this.detect(function (member) {
            return ~member.id.indexOf(userId);
        });
    },
    getByUsername: function (username) {
        var lcase = (username || '').toLowerCase();
        return this.find(function (member) {
            // this craziness is to avoid an annoying heisenbug that I don't understand
            if (member && member.username && member.username.toLowerCase) {
                return member.username.toLowerCase() === lcase;
            } else {
                return false;
            }
        });
    },
    isValidLink: function (username) {
        var lcase = (username || '').toLowerCase();
        return !!this.getByUsername(username) || lcase === 'team' || lcase === 'all';
    },
    setMemberOrder: function (forceChange) {
        var sorted = this.models.sort(function (model1, model2) {
            if (model1.presence === model2.presence) {
                var invert = (model1.presence === 'offline') ? -1 : 1;
                if (model1.lastLogin > model2.lastLogin) {
                    return 1 * invert;
                } else {
                    return -1 * invert;
                }
            } else {
                if (model1.presence === 'offline') {
                    return 1;
                } else {
                    return -1;
                }
            }
        });
        sorted.forEach(function (member, index) {
            // this lets us programatically re-sort to trigger change events
            // and thus animations
            if (forceChange) member.order = -1;
            member.order = index;
        });
    }
});
