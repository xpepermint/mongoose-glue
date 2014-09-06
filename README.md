# mongoose-glue

![Build Status](https://travis-ci.org/xpepermint/mongoose-glue.svg?branch=master)&nbsp;[![NPM version](https://badge.fury.io/js/mongoose-glue.svg)](http://badge.fury.io/js/mongoose-glue)&nbsp;[![Dependency Status](https://gemnasium.com/xpepermint/mongoose-glue.svg)](https://gemnasium.com/xpepermint/mongoose-glue)

[Mongoose](http://mongoosejs.com/) is one of the best ODMs for MongoDB. Mongoose provides a straight-forward, schema-based solution to modeling your application data and includes built-in type casting, validation, query building, business logic hooks and more, out of the box.

`Mongoose` does not require a specific structure of your project files. This is great but it always rises a common question on how to use a library within a project in a proper way. We do not want to manually figure the right way on how to split the code into multiple files every time we start a new Mongoose project. Things can be quite complicated especially when dealing with multiple database instances.

`Mongoose-glue` optimizes your code and brings the following features into your NodeJS project:
- Unified MVC-style structure for models.
- Multiple Mongoose database/cluster connections.
- Single point of configuration.
- Powerful model schema and inheritance.
- Support for all Mongoose features including middlewares, plugins and discriminators.
- Support fro MongoDB [GridFS](http://docs.mongodb.org/manual/core/gridfs/) over [gridfs-stream](https://github.com/aheckmann/gridfs-stream).

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

### .connect(options)

Type: `Function`

Connects to all databases/clusters defined inside `mongoose.js` and loads models.

```js
var _ = require('mongoose-glue');

_.connect({
  logger: console.log
});
```

### .disconnect()

Type: `Function`

Disconnects from all databases/clusters and unloads models.

### .connection(name)

Type: `Function`
Returns: `Object`

Returns a database/cluster instance of the `name` connection.

```js
var _ = require('mongoose-glue');
var conn = _.connection('mongo1');
```

### .model(name)

Type: `Function`
Returns: `Object`

Returns a model instance defined inside `name` file.

```js
var _ = require('mongoose-glue');
var Bird = _.model('bird');

Bird.create({ name: "Fluppy" }, function(err, data) {
  console.log('Mongoose Fluppy bird created.');
});
```

### .gfs(name)

Type: `Function`
Returns: `Object`

Returns a configured `gridfs-stream` instance for the `name` connection.

```js
var _ = require('mongoose-glue');
var gfs = _.gfs('mongo1');
```

### .mongoose

Type: `Object`

Direct access to mongoose model.

```js
var _ = require('mongoose-glue');
var ObjectId = _.types.ObjectId;
```

### .types

Type: `Object`

Direct access to mongoose data types.

```js
var _ = require('mongoose-glue');
var ObjectId = _.types.ObjectId;
```

## Examples

Use models anywhere in your app.

```js
var _ = require('mongoose-glue');
var Bird = _.model('bird');

Bird.create({ name: "Fluppy" }, function(err, data) {
  console.log('Mongoose Fluppy bird created.');
});
```

Store your files inside your MongoDB database.

```js
var fs = require('fs');
var gfs = require('mongoose-glue').gfs('mongo1');

// read file on local disk, save into mongodb
fs.createReadStream('./tmp/myfile.txt').pipe( gfs.createWriteStream({ filename: 'myfile.txt' }) );
// read file stored inside mongodb, save to local disk
gfs.createReadStream({ filename: 'myfile.txt' }).pipe( fs.createWriteStream('./tmp/myfile.txt') );
```
