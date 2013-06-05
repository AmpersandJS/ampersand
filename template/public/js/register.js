
$(function () {
    var container = $('#register article'),
        errorEl = $('#formErrors'),
        loading = $('#loadingImage'),
        _ = require('underscore')._;

    _.mixin(require('validation'));

    var availabilityTest = function (val) {
        return $.ajax({
            type: 'get',
            url: '/name-available',
            data: {name: val},
            success: function (data) {
                /*
                if (data === '1') {
                    $('span.availability').text("Username available");
                } else {
                    $('span.availability').text("Username taken");
                }
                */
            },
            async: false
        }).responseText === '1';
    };

    var fields = {
        '#firstName': {
            message: "Please supply us with your glorious name"
        },
        '#lastName': {
            message: "Please supply us with your glorious name"
        },
        '#username': {
            message: "_",
            when: 'keyup',
            test: function (val) {
                var slug = _.isSlug(val),
                    avail = availabilityTest(val),
                    slugMessage = "must be lowercase and can only contain letters, numbers and underscores.",
                    availMessage = "that username is taken";

                if (!slug) {
                    this.message = slugMessage;
                } else if (!avail) {
                    this.message = availMessage;
                }

                return slug && avail;
            }
        },
        '#email': {
            required: true,
            message: "Err... need a legit email there, bud.",
            test: _.isEmail
        },
        '#password': {
            message: "Password must be at least 6 characters",
            test: _.isPassword
        }
    };

    // first form
    $('#signupForm').isHappy({
        async: true,
        fields: fields,
        unHappy: function () {
            container.addClass('fail');
            setTimeout(function () {
                container.removeClass('fail');
            }, 1000);
        },
        happy: function () {
            var field;
            container.addClass('submitting');
            loading.addClass('go');
            $.post('/register', $('#signupForm').serialize(), function (data) {
                if (data && data.success) {
                    container.addClass('victory');
                    _kmq.push(['record', 'Signed Up']);
                    setTimeout(function () {
                        window.location = data.nextUrl;
                    }, 1000);
                } else {
                    container.addClass('fail').removeClass('submitting');
                    loading.removeClass('go');
                    setTimeout(function () {
                        container.removeClass('fail');
                    }, 1000);
                    errorEl.empty();
                    _.each(data.errors, function (err) {
                        errorEl.append('<li>' + err + '</li>');
                    });
                }
            });
            return false;
        },
        submitButton: '#signupSubmit'
    });
});
