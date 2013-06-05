var BaseCollection = require('models/baseCollection'),
    Message = require('models/message');


module.exports = BaseCollection.extend({
    type: 'messages',
    model: Message
});
