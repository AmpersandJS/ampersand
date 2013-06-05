var validation = require('validation');


$(function () {
    var form = $('#interestForm');

    $(".lines")
        .lettering('lines')
        .children('span')
        .lettering('words');

    function subscribe() {
        form.attr('class', 'submitting');
        $.post('/subscribe', {email: $('#email').val()}, function (data) {
            form.attr('class', 'success');
        });
    }

    $('#interestSubmit').click(function () {
        form.submit();
        return false;
    });

    form.submit(function () {
        if (validation.isEmail($('#email').val())) {
            $('#normal').removeClass('invalid');
            subscribe();
        } else {
            $('#normal').addClass('invalid');
        }
        return false;
    });
});
