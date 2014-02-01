# Documentation

## Introduction

human-view is a 

## Bindings

Bindings are view-level objects that map model properties to specific DOM selectors in the view's template. Once bindings are declared, human-view will automatically update the appropriate DOM elements or attributes when the bound model property changes.


### textBindings

Text bindings are used to directly bind the inner text of an element to the model.

```js
textBindings: {
	'liveStreamCount': '.live-stream-count'
} 
```
```html
<div class='.live-stream-count'>0</div>
```

Here, the contents of the `.liveStreamCount` element (or elements) within the view will be replaced with and bound to the value retrived by `model.get('liveStreamCount')`.


### srcBindings

Source bindings are used to bind the `src` attribute of a DOM element to the model.

```js
srcBindings: {
	'userProfilePic': 'img .profile-pic'
}
```
```html
<img class='profile-pic' src='' alt='Profile Picture' />
```

Here, the `src` tag of the `.profile-pic` image element will be bound to `model.get('userProfilePic')`.


### hrefBindings

You're probably getting the idea by now, but href bindings are just like the src bindings, but for the `href` attribute.

```js
hrefBindings: {
	'logoutURL': 'a .logout'
}
```
```html
<a class='logout' href=''>Logout</a>
```

Here, the `href` tag of the `.logout` anchor element will be bound to `model.get('logoutURL')`.


### classBindings

Class bindings are a bit special. They maintain a class on the element according to the following rules:
    
1. **If the bound property is a boolean**: the name of the property will be used as the name of the class. The class will be present on the element when the boolean is `true`, and removed when the propety is `false`.

```js
// within your view definition
classBindings: {
    'active': 'a .options-page'
}
```
```html
<a class='options-page' href=''>Options</a>
```

```js
// some other code
model.set('active', true); // element with have `active` class

model.set('active', false); // `active` class will be removed (if present)
```


2. **If the property is a string**: the current value of the property will be used as the class name. When the property value changes the previous class will be removed and be replaced by the current value. No other classes on that element will be disturbed.


```js
// within your view definition
classBindings: {
    'status': 'a .options-page'
}
```
```html
<a class='options-page' href=''>Options</a>
```

```js
// some other code
model.set('status', 'available'); // element with have an `available` class

// when setting to something else 
model.set('status', 'away'); // `available` class will be removed and `away` class added.
```


## Methods

### renderCollection(collection, ViewClass, container [, opts])
human-view includes a `renderCollection` method that works as follows:

```js
// some view for individual items in the collection
var ItemView = StrictView.extend({ ... });

// the main view
var MainView = StrictView.extend({
    template: '<section class="page"><ul class="itemContainer"></ul></section>',
    render: function (opts) {
        // render our template as usual
        this.renderAndBind();
        
        // call renderCollection with these arguments:
        // 1. collection
        // 2. which view to use for each item in the list
        // 3. which element within this view to use as the container
        // 4. options object (not required):
        //      {
        //          // function used to determine if model should be included
        //          filter: function (model) {},
        //          // boolean to specify reverse rendering order
        //          reverse: false,
        //          // view options object (just gets passed to item view's `initialize` method)
        //          viewOptions: {}
        //      }
        this.renderCollection(this.collection, ItemView, this.$('.itemContainer')[0], opts);
        return this;
    }  
})
```

The `renderCollection()` call will maintain the collection within the `.itemContainer` element, including proper handling of add, remove, sort, reset, etc. You can optionally specify a filter function or choose to reverse the collection when rendering.

### renderAndBind([context, template])
This is a convenience method which will render the template and fully replace the root element with the rendered template content. 

Either define a `template` property in your view, or pass in a template directly. The template can either be a function or a string. If the template is a function, it will be passed the `context` argument.

### listenToAndRun(object, events, handler)	
The same as Backbone's `listenTo()`, except it will call `handler` immediately after applying the listener.
