#getconfig - config reader for node.js

### Why, what, how?
This little config reader uses the `NODE_ENV` environment variable to determine the execution environment we're in and then reads a file that matches that name. 

It will then look for a config file with the corresponding name in the same folder as the entry point of your current application. In most cases, that's the root of your project.

You can set your environment to whatever you want, but we color these nicely:

- `dev` - dev_config.json
- `test` - test_config.json
- `production` - production_config.json

### How to use it

1. install via npm: 

    ```bash
    npm install getconfig
    ```

2. create your config file, for example:

    ```json
    {
        "databasePassword": "something long and silly",
        "andbangClientId": "my-client-id"
    }
    ```

3. get your config: 

    ```js

    // just requiring 'getconfig' will fetch and parse your JSON config
    // based on your environment. 
    var config = require('getconfig')

    // so you can just use it
    console.log(config.databasePassword); // outputs: "something long and silly"
    console.log(config.getconfig.env); // outputs the current environment
    ```

4. (optional) You can also config whether you want it to log out it's environment info and whether or not to use colors in output. By adding the following to your `{{some name}}_config.json` file:

    ```json
    {
        "getconfig": {
            "colors": false, //turns off colors
        }
    }
    ```

    ```json
    {
        "getconfig": {
            "silent": true, //turns off all output
        }
    }
    ```

### Extra

getconfig will also fill in the `getconfig.env` value with the current environment name so you can programatically determine the environment if you'd like.

### License

MIT

if you dig it follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter.
