var StrictModel = require('strictmodel').Model;


module.exports = StrictModel.extend({
    type: 'user',
    props: {
        id: ['string'],
        teams: ['array', true, []],
        teamLimit: ['number', true, 0],
        hasPaidTeam: ['boolean', true, false],
        textSize: ['string', true, 'medium'],
        picUrl: ['string', true],
        firstName: ['string', true, ''],
        lastName: ['string', true, ''],
        free: ['boolean', true, false],
        username: ['string'],
        email: ['string', true],
        jid: ['string', true],
        status: ['string', true],
        activeTask: ['string', true],
        newUser: ['boolean', true],
        didTutorial: ['boolean', true],
        muted: ['boolean', true]
    },
    derived: {
        fullName: {
            deps: ['firstName', 'lastName'],
            cache: true,
            fn: function () {
                return this.firstName + ' ' + this.lastName;
            }
        },
        initials: {
            deps: ['firstName', 'lastName'],
            cache: true,
            fn: function () {
                return (this.firstName.charAt(0) + this.lastName.charAt(0)).toUpperCase();
            }
        }
    },
    session: {
    }
});
