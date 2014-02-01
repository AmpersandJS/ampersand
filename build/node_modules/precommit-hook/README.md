What is it?
-----------

This module is a handy little tool that I wrote to help enforce code quality in node.js projects. It will run the JSHint linter over your code,
followed by two optional steps: A custom validator specified by you in your package.json, and unit tests which are also specified in your package.json.

To facilitate the usage of JSHint, as part of the install step two files will be created in the root of your project, .jshintrc and .jshintignore. These
files are configuration for JSHint itself. They are included to provide some sane defaults, such as making sure your installed npm modules are not being
linted, and that some node.js global variables won't trigger errors. You are free to customize these files after they're created, and they will not be
overwritten.

Why should I use it?
--------------------

No one likes a messy code base. When working on a team, it becomes more and more difficult to make sure that your project's code stays consistent
and error free. Since the hook lints all of the project's code, based on your configuration, you can be sure that at the very least standards are
being followed.

In addition to this, the validate script can be used to perform whatever manual checking you like. Whether it's making sure that a file has been
updated, pre-compiling static assets, or whatever other need you may have. Additional steps are easy to forget, so why chance it?

Unit tests are another thing that should always be verified before committing your code. Pushing code that breaks tests is an all too common occurrence.

Having a tool that automates all of these steps has been priceless for us, and has very much improved the quality of our code.

Package.json
------------

As mentioned above, there are two optional steps run by the hook. A validator, and unit tests. Specifying these scripts is done in your package.json, such
as the below example.

```javascript
{
  "name": "your_project",
  "description": "just an example",
  "scripts": {
    "validate": "./command/to/run",
    "test": "./other/command"
  }
}
```

The contents of the validate and test properties are the shell command to be run to perform those functions. Having these specified in your package.json also
lends you the ability to be able to run them manually like so

```
npm run-script validate
npm test
```

These scripts can be any shell executable commands, but must exit with a status code of 0 for success and 1 or greater for failure.

In addition to this, a new feature is the ability to manually override these commands or disable them entirely. To do so you add a precommit config to your
package.json, similar to the below example.

```javascript
{
  "name": "your_project",
  "description": "just an example",
  "scripts": {
    "validate": "./command/to/run",
    "test": "./other/command"
  },
  "config": {
    "precommit": {
      "lint": false,
      "validate": true,
      "test": "mocha"
    }
  }
}
```

This example would disable the linting step entirely, explicitly enables the validation step, and overrides the test step to run "mocha" instead of "./other/command"

Usage
-----

    npm install precommit-hook


Everything else is automatic! The npm install script will create the hook, and place a .jshintrc and .jshintignore file in your project if they don't exist.
To update, just install again. Only the hook itself will be overwritten. I recommend putting precommit-hook in your project's devDependencies to make sure
that anyone who may be contributing to your project will have the hook installed.

```
{
  "name": "your_project",
  "description": "just an example",
  "scripts": {
    "validate": "./command/to/run",
    "test": "./other/command"
  },
  "devDependencies": {
    "precommit-hook": ""
  }
}
```

Contact
-------

Like the project? Hate it? Just want to say hi? Find me on twitter [@quitlahok](http://twitter.com/quitlahok)

License
-------

MIT
