// init code highlighting
Array.prototype.forEach.call(document.querySelectorAll('pre'), function (node) {
  hljs.highlightBlock(node);
});

// grab all our h* tags
var hTags = document.querySelector('main').querySelectorAll('h1, h2, h3, h4, h5');

var nav = document.querySelector('nav');

Array.prototype.forEach.call(hTags, function (h) {
  if (h.id) {
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.innerHTML = h.dataset && h.dataset.nav || h.innerHTML;
    a.classList.add(h.tagName.toLowerCase());
    nav.appendChild(a);
  }
});

// grab all our nav a tags
var aTags = document.querySelector('nav').querySelectorAll('a');

var slider = document.getElementById('slider');

function markActive(selected) {
  var id = selected && selected.id;
  var found;
  if (id) {
    window.selected = selected;
    Array.prototype.forEach.call(aTags, function (a) {
      if (a.hash.slice(1) === id) {
        found = a;
        slider.style.top = a.offsetTop + 'px';
      }
    });
  }
}

function selectCurrent() {
  var found;
  var i = 0;
  var l = hTags.length;
  for (; i < l; i++) {
    if (hTags[i].offsetTop > (document.body.scrollTop || window.scrollY)) {
      found = window.current = hTags[i - 1];
      break;
    }
  }
  markActive(found);
}

setInterval(selectCurrent, 200);

