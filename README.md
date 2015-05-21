# The Ampersand CLI

<!-- starthide -->
Part of the [Ampersand.js toolkit](http://ampersandjs.com) for building client-side applications.
<!-- endhide -->

Lead Maintainer: [Drew Fyock](https://github.com/fyockm)

The idea behind the CLI is not to solve all your problems and write all your code, but to help you with the tedious parts of building an app, which is what computers are supposed to help us with.

## Installation

```
npm install -g ampersand
```

## Starting a new app

Just, `cd` into whatever directory you normally put your projects in and just run `ampersand`.

The CLI will walk you through some basic questions, and kick out an app that runs out of the box.

It's meant to be a loose guide, not an edict. Just delete whatever isn't relevant.


## Generating stuff

```
ampersand gen {{type}}
```

Type can be `form`, `view`, `model` or `collection`.


## Generating models (from JSON)

You can use the CLI to generate a model and collection for that model. If you already know what the JSON is going to look like you can pipe it into the generator to create a model with matching properties.

On a Mac, if you've copied some JSON to your clipboard you can do this from anywhere within your project folder:

```
pbpaste | ampersand gen model MyModel
```

And it'll kick out two files in your models folder (which is configurable, see below):

```
my-model.js
my-model-collection.js
```

And it will create the properties in the JSON object as model properties.

Don't worry, nothing will be overwritten unless you use the the `--force` (or `-f`) option


## Generating forms from models

You can also use a model to generate the starting point of a form-view for editing that model.

```
ampersand gen form ./path/to/your/model.js
```

It will create a form view in your `/client/forms` folder.

Nothing will be overwritten unless you use the the `--force` (or `-f`) option, so it's safe to just experiment.


## Configuring the generated code

The cli looks for config options from a number of sources, starting with default, applying configs from a `.ampersandrc` in your home folder, then your project root, then by parsing option flags from stdin.

Those files can be JSON or ini format.

The available options and defaults are as follows:

- `framework`: default framework to be prompted with, options are `express` or `hapi`
- `indent`: indent size
- `view`: default template
- `router`: default template
- `model`: default template
- `page`: default template
- `collection`: default template
- `clientfolder`: name for the 'client' folder
- `viewfolder`: name for the 'views' folder
- `pagefolder`: name for the 'pages' folder
- `modelfolder`: name for the 'models' folder
- `formsfolder`: name for the 'forms' folder
- `collectionfolder`: name for the collection folder - grouped with 'models' by default
- `makecollection`: whether to create collection when making a model
- `approot`: if called without the 'gen' command build a new one, so we won't look for an application root. starts walking up folders looking for `package.json`.
- `quotes`: options are 'single' or 'double'

### Sample JSON with default options

```json
{
    "framework": "hapi",
    "indent": 4,
    "view": "",
    "router": "",
    "model": "",
    "page": "",
    "collection": "",
    "clientfolder": "client",
    "viewfolder": "views",
    "pagefolder": "pages",
    "modelfolder": "models",
    "formsfolder": "forms",
    "collectionfolder": "models",
    "makecollection": true,
    "approot": "",
    "quotes": "single"
}
```

## License

MIT
