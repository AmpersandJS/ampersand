// this is here for the sake of keepingg the HTML in the app's HTML file as ridiculously minimalistic
// as possible. This is merely a style choice.
document.title = '&!';

$('head').prepend([
    '<link href="/css/bootstrap.css" rel="stylesheet"/>',
    '<link href="/css/app.css" rel="stylesheet"/>',
    '<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0">'
].join(''));

// run the main app and create the global "app"
$(function () {
    window.times.blastoff = new Date;
    require('app').blastoff();
});
