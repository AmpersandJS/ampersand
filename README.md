# The Ampersand CLI

<!-- starthide -->
Part of the [Ampersand.js toolkit](http://ampersandjs.com) for building clientside applications.
<!-- endhide -->

The idea behind the CLI is not to solve all your problems and write all your code but to help you with the tedious parts of building an app, that you know, computers are supposed to help us with.

## installation

```
npm i -g ampersand
```

## Starting a new app

Just, `cd` into whatever directory you normally put your projects in and just run `ampersand`.

The CLI will walk you through some basic questions and kick out an app, that runs, out of the box.

It's meant as a loose guide, not an edict. Just delete whatever isn't relevant.


## Generating stuff

```
ampersand gen {{type}}
```

Type can be `form`, `view`, `model` or `collection`.


## Generating models (from JSON)

You can use the CLI to generate a model and collection for that model. If you already know what the JSON is going to look like you can pipe it into the generator to create a model with matching properties.

On a mac, if you've copied some JSON to your clipboard you can do this from anywhere within your project folder:

```
pbpaste | ampersand gen model MyModel
```

And it'll kick out two files in your models folder (which is configurable, see below):

```
my-model.js
my-model-collection.js
```

And it will create the properties in the JSON object as model propeties.

Don't worry it won't overwrite anything unless you use the the `-f` option.


## Generating forms from models

You can also use a model to generate the starting point of a form-view for editing that model. 

```
ampersand gen form ./path/to/your/model.js
```

It will create a form view in your `/client/forms` folder.


Don't worry it won't overwrite anything unless you use the the `-f` option so it's safe to just experiment with.


## Configuring the generated code

The cli looks for config options from a number of sources, starting with default, applying configs from a `.ampersandrc` in your home folder, then your project root, then by parsing option flags from stdin. 

Those files can be JSON or ini format.

The available options and defaults are as follows:

```js
{
    framework: 'hapi',
    indent: 4,
    view: '', // default template
    router: '', // default template
    model: '', // default template
    page: '', // default template
    collection: '', // default template
    clientfolder: 'client',
    viewfolder: 'views',
    pagefolder: 'pages',
    modelfolder: 'models',
    formsfolder: 'forms',
    collectionfolder: 'models',
    // whether to create collection when making a model
    makecollection: true,
    // if it was called without the 'gen' argument we're building a new one
    // so we won't look for an application root
    approot: '', // starts walking up folders looking for package.json
    f: false, // overwrite
    force: false, // overwrite flag, longform
    quotes: 'single' // can be 'single' or 'double'
};
```

## license

MIT
