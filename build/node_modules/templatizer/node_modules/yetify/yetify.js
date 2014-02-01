var colors = require('colors');

function repeat(string, times) {
    return (new Array(times)).join(string);
}

module.exports = {
    logo: function () {
        return '&'.magenta.bold + 'yet'.blue.bold;
    },
    logoTab: function (spacing) {
        this._tabify(spacing, 'by: ' + this.logo());
    },
    liftLogo: function () {
        return '^'.magenta.bold + 'lift'.blue.bold + ' security';
    },
    liftTab: function (spacing) {
        this._tabify(spacing, this.liftLogo());
    },
    andBangLogo: function () {
        return '&'.magenta.bold + '!'.blue.bold + ' And Bang';
    },
    andBangTab: function (spacing) {
        this._tabify(spacing, this.andBangLogo());
    },
    _tabify: function (spacing, text) {
        spacing = (spacing === 0) ? 0 : spacing || 50;
        console.log('\n');
        console.log(repeat(' ', spacing) + text + '  ');
        console.log('\n');
    }
}