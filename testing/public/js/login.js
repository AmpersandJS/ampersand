$(function () {
    var loginEl = $('#login article');

    function fail() {
        loginEl.addClass('fail');
        $('#username').val('').focus();
        $('#password').val('');
        $('#loginFail').show();
        setTimeout(function () {
            loginEl.removeClass('fail');
        }, 1000);
    }

    // first form
    $('#loginForm').isHappy({
        async: true,
        fields: {
            '#username': {
                message: ""
            },
            '#password': {
                message: ""
            }
        },
        unHappy: function () {
            fail();
        },
        happy: function () {
            $.ajax({
                url: '/login',
                data: $('form').serialize(),
                type: 'post',
                success: function (data) {
                    if (data === 'fail') {
                        fail();
                    } else {
                        $('#loginFail').hide();
                        loginEl.addClass('victory');
                        setTimeout(function () {
                            window.location.assign(data);
                        }, 700);
                    }
                }
            });
            return false;
        },
        submitButton: '#loginButton'
    });
});
