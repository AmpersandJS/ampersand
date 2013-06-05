exports.home = function (req, res) {
    res.render('home', {pageTitle: 'home', bodyId: 'home'});
};

// simple helper
exports.render = function (view) {
    return function (req, res) {
        res.render(view);
    };
};
