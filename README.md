# humanjs app scaffolding

Install it, then follow the prompts to generate a starting point for your app.

```
npm i humanjs -g

humanjs
``` 

## Defaults

You can optionally create a `.humanjsrc` file in your home folder containing JSON with your preferred defaults.

Currently the only options are: 

```json
{
    "name": "Your Name <maybe_your_email@your_domain.com>",
    "framework": "express || hapi"
}
```

This config simply changes the suggested defaults when answering questions. They can still be overwritten when running the generator, but saves a bit of typing.

## Changelog

- 1.0.1 - Fixing bug in console output for directory to install to.
- 1.0.0 - Adding option to generate app that uses either express or hapi 2.0 as the server framework. Moving docs site to its own repo: https://github.com/HenrikJoreteg/docs.humanjavascript.com

## license

MIT
