/*global console */
$(function () {
    $('button').click(function () {
        var accept = $(this).hasClass('accept');
        $.ajax({
            url: 'accept-reject',
            data: {
                accept: accept
            },
            success: function (data) {
                console.log(data);
            },
            method: 'post'
        });
    });
});
