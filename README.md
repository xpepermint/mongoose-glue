# mongoose-glue

![Build Status](https://travis-ci.org/xpepermint/mongoose-glue.svg?branch=master)&nbsp;[![NPM version](https://badge.fury.io/js/mongoose-glue.svg)](http://badge.fury.io/js/mongoose-glue)&nbsp;[![Dependency Status](https://gemnasium.com/xpepermint/mongoose-glue.svg)](https://gemnasium.com/xpepermint/mongoose-glue)

[Mongoose](http://mongoosejs.com/) is one of the best ODMs for MongoDB. Mongoose provides a straight-forward, schema-based solution to modeling your application data and includes built-in type casting, validation, query building, business logic hooks and more, out of the box.

Mongoose does not require a specific structure of your project files. This is great but it always rises a common question on how to use a library within a project in a proper way. We do not want to manually figure the right way on how to split the code into multiple files every time we start a new Mongoose project. Things can be quite complicated especially when dealing with multiple database instances.

`Mongoose-glue` brings a unified MVC-style structure for models into your NodeJS project.

## Installation

Install the [npm](https://www.npmjs.org/package/mongoose-glue) package.

```
npm install mongoose-glue --save
```

## Setup

Let's first configure project's **database connections**. By default the module will try to read the `config/mongoose.js` configuration file so let's create one. The file content should look like the example bellow.

```
// config/mongoose.js
module.exports = {

  default: {

    'mongo1': {
      uris: 'mongodb://user:secret@hostname:port/database',
      options: {}
    },

    'mongo2': {
      uris: 'mongodb://user:secret@hostname:port/database',
      options: {}
    }
  },

  production: {}
};
```

The next step is to **define models**. The module will load files found at `app/models`. Let's create two models for `mongo1` database.

```
// app/models/animal.js (mongoose model)
module.exports = {
  connection: 'mongo1',
  attributes: {
    name: 'string'
  },
  classMethods: {},
  instanceMethods: {},
  plugins: [],
  middleware: {},
  options: {}
};
```
```
// app/models/bird.js (mongoose discriminator of animal)
module.exports = {
  connection: 'mongo1',
  extends: 'animal'
};
```

Now we only have to **load and connect** database connections and models together to make it work. The best place to do this is inside your project's main file (e.g. `index.js`).

```js
// index.js
var _ = require('mongoose-glue');
_.connect();
```

## Configuration

The module can be configured by sending options to the `_.connect` method. See the list of available options bellow.

```
_.connect({

  // Path to a file where database connections are defined.
  configPath: 'new/file/path.js',

  // Path to a directory with models files.
  modelsPath: 'new/directory/path',

  // Custom logger function (set to `false` by default).
  logger: console.log

});
```

## API

After the project has been setup we can access any model like this:

```js
var _ = require('mongoose-glue');
var Bird = _.model('bird');

Bird.create({ name: "Fluppy" }, function(err, data) {
  console.log('Mongoose Fluppy bird created.');
});
```
You can directly access the mongoose module and its elements.

```js
var _ = require('mongoose-glue');
var mongoose = _.mongoose;
var ObjectId = _.types.ObjectId;
```

You can also access an instance of a database connection.

```js
var _ = require('mongoose-glue');
var conn = _.connection('mongo1');
```
