var code = require('./code');

module.exports = {
    launch: function () {
        window.app = this;
        code.docWrite('Woo! View source to see what rendered me.');
    }
};

module.exports.launch();
