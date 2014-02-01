(function () {
var root = this, exports = {};

// The jade runtime:
var jade = exports.jade=function(exports){Array.isArray||(Array.isArray=function(arr){return"[object Array]"==Object.prototype.toString.call(arr)}),Object.keys||(Object.keys=function(obj){var arr=[];for(var key in obj)obj.hasOwnProperty(key)&&arr.push(key);return arr}),exports.merge=function merge(a,b){var ac=a["class"],bc=b["class"];if(ac||bc)ac=ac||[],bc=bc||[],Array.isArray(ac)||(ac=[ac]),Array.isArray(bc)||(bc=[bc]),ac=ac.filter(nulls),bc=bc.filter(nulls),a["class"]=ac.concat(bc).join(" ");for(var key in b)key!="class"&&(a[key]=b[key]);return a};function nulls(val){return val!=null}return exports.attrs=function attrs(obj,escaped){var buf=[],terse=obj.terse;delete obj.terse;var keys=Object.keys(obj),len=keys.length;if(len){buf.push("");for(var i=0;i<len;++i){var key=keys[i],val=obj[key];"boolean"==typeof val||null==val?val&&(terse?buf.push(key):buf.push(key+'="'+key+'"')):0==key.indexOf("data")&&"string"!=typeof val?buf.push(key+"='"+JSON.stringify(val)+"'"):"class"==key&&Array.isArray(val)?buf.push(key+'="'+exports.escape(val.join(" "))+'"'):escaped&&escaped[key]?buf.push(key+'="'+exports.escape(val)+'"'):buf.push(key+'="'+val+'"')}}return buf.join(" ")},exports.escape=function escape(html){return String(html).replace(/&(?!(\w+|\#\d+);)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},exports.rethrow=function rethrow(err,filename,lineno){if(!filename)throw err;var context=3,str=require("fs").readFileSync(filename,"utf8"),lines=str.split("\n"),start=Math.max(lineno-context,0),end=Math.min(lines.length,lineno+context),context=lines.slice(start,end).map(function(line,i){var curr=i+start+1;return(curr==lineno?"  > ":"    ")+curr+"| "+line}).join("\n");throw err.path=filename,err.message=(filename||"Jade")+":"+lineno+"\n"+context+"\n\n"+err.message,err},exports}({});


// create our folder objects
exports["includes"] = {};
exports["pages"] = {};

// body.jade compiled template
exports["body"] = function tmpl_body(locals) {
    var buf = [];
    buf.push('<body><div class="container"><div class="navbar"><div class="navbar-inner"><a href="#" class="brand">{{{appTitle}}}</a><ul class="nav"><li><a href="/">home</a></li><li><a href="/collections">collection demo</a></li><li><a href="/info">more info</a></li></ul></div></div><main id="pages"></main></div></body>');
    return buf.join('');
};

// head.jade compiled template
exports["head"] = function tmpl_head(locals) {
    var buf = [];
    buf.push('<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0"/><meta name="apple-mobile-web-app-capable" content="yes"/>');
    return buf.join('');
};

// includes/person.jade compiled template
exports["includes"]["person"] = function tmpl_includes_person(locals) {
    var buf = [];
    buf.push('<li class="person"><img width="40" height="40" class="avatar"/><span class="name"></span><span> <a href="#" class="delete">delete</a></span></li>');
    return buf.join('');
};

// pages/collectionDemo.jade compiled template
exports["pages"]["collectionDemo"] = function tmpl_pages_collectionDemo(locals) {
    var buf = [];
    buf.push('<section class="page pageOne"><h2>Collection demo</h2><p>Intelligently rendering collections can be a bit tricky. </p><p><a href="https://github.com/henrikjoreteg/human-view">HumanView\'s</a> <code>renderCollection()</code> method makes it simple.</p><p>The only code required to manage the collection is:</p><pre><code>this.renderCollection(\n   this.collection, \n   PersonView, \n   this.$(\'.people\')[0]\n);</code></pre><h3>People container:</h3><div class="people"></div><p>Try it by clicking the buttons</p><div class="buttons"><button class="btn reset">.reset()</button><button class="btn fetch">.fetch()</button><button class="btn shuffle">.shuffle()</button><button class="btn add">Generate Random Person</button></div><p>Events are always managed so you don\'t get any leaks.</p></section>');
    return buf.join('');
};

// pages/home.jade compiled template
exports["pages"]["home"] = function tmpl_pages_home(locals) {
    var buf = [];
    buf.push('<section class="page home"><h2>Welcome to a skeleton for {{{appTitle}}}</h2><p>If you "view source" you\'ll see it\'s 100% client rendered.</p><p>Click around the site using the nav bar at the top. </p><p>Things to note:<ul><li>The url changes, no requests are made to the server.</li><li>Refreshing the page will always get you back to the same page</li><li>Page changes are nearly instantaneous</li><li>In development mode, you don\'t need to restart the server to see changes, just edit and refresh.</li><li>In production mode, it will serve minfied, uniquely named files with super agressive cache headers. To test:<ul> <li>in dev_config.json set <code>isDev</code> to <code>false</code>.</li><li>restart the server.</li><li>view source and you\'ll see minified css and js files with unique names.</li><li>open the "network" tab in chrome dev tools (or something similar). You\'ll also want to make sure you haven\'t disabled your cache.</li><li>without hitting "refresh" load the app again (selecting current URL in url bar and hitting "enter" works great).</li><li>you should now see that the JS and CSS files were both served from cache without making any request to the server at all.</li></ul></li></ul></p></section>');
    return buf.join('');
};

// pages/info.jade compiled template
exports["pages"]["info"] = function tmpl_pages_info(locals) {
    var buf = [];
    buf.push('<section class="page pageTwo"><h2>More Info</h2><p>This is a demo app by <a href="http://twitter.com">Henrik Joreteg</a>.</p><h4>Relevant links:</h4><ul><li> <a href="http://humanjavascript.com">human javascript</a> &mdash; the book</li><li> <a href="https://github.com/HenrikJoreteg/humanjs-sample-app">github repo </a> &mdash; for this app</li><li> <a href="http://andyet.com">&yet</a> &mdash; The company behind this effort.</li></ul><h4>Finding Packages</h4><ul><li><a href="http://projects.joreteg.com/humanjs-resources/">humanjs resources</a> &mdash; A few curated modules with a quick search</li><li><a href="https://github.com/component">Component </a> &mdash; Lots of tools here in tiny modules. Most are on npm as {{name}}-component</li><li><a href="http://browserify.org/search">Browserify module search</a> &mdash; Searches npm for browserify packages</li></ul><h4>Apps Built this way</h4><ul><li> <a href="http://andbang.com">And Bang</a> &mdash; Team same-pagification tool. Realtime chat + task management</li><li> <a href="http://talky.io">Talky </a> &mdash; Free, zero-setup, no-account, peer-to-peer encrypted video calls</li></ul></section>');
    return buf.join('');
};


// attach to window or export with commonJS
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = exports;
} else if (typeof define === "function" && define.amd) {
    define(exports);
} else {
    root.templatizer = exports;
}

})();