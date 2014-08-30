'use strict';

/**
 * Module dependencies.
 */

var _ = require('lodash');
var mongoose = require('mongoose');
var util = require('util');
var utils = require('mongoose/lib/utils');

/*
 * Helper for `buildLogger`.
 * (copy & paste from mongoose module)
 */

function print (arg) {
  var type = typeof arg;
  if ('function' === type || 'undefined' === type) return '';
  var data = format(arg);
  return typeof data == 'object' ? JSON.stringify(data) : data;
}

/*
 * Helper for `buildLogger`.
 * (copy & paste from mongoose module + removing return statement)
 */

function format (obj, sub) {
  var x = utils.clone(obj);
  if (x) {
    if ('Binary' === x.constructor.name) {
      x = '[object Buffer]';
    } else if ('ObjectID' === x.constructor.name) {
      var representation = 'ObjectId("' + x.toHexString() + '")';
      x = { inspect: function() { return representation; } };
    } else if ('Date' === x.constructor.name) {
      var representation = 'new Date("' + x.toUTCString() + '")';
      x = { inspect: function() { return representation; } };
    } else if ('Object' === x.constructor.name) {
      var keys = Object.keys(x)
        , i = keys.length
        , key
      while (i--) {
        key = keys[i];
        if (x[key]) {
          if ('Binary' === x[key].constructor.name) {
            x[key] = '[object Buffer]';
          } else if ('Object' === x[key].constructor.name) {
            x[key] = format(x[key], true);
          } else if ('ObjectID' === x[key].constructor.name) {
            ;(function(x){
              var representation = 'ObjectId("' + x[key].toHexString() + '")';
              x[key] = { inspect: function() { return representation; } };
            })(x)
          } else if ('Date' === x[key].constructor.name) {
            ;(function(x){
              var representation = 'new Date("' + x[key].toUTCString() + '")';
              x[key] = { inspect: function() { return representation; } };
            })(x)
          } else if (Array.isArray(x[key])) {
            x[key] = x[key].map(function (o) {
              return format(o, true)
            });
          }
        }
      }
    }
    if (sub) return x;
  }
  return x; // modified
}

/**
 * Returns logger.
 *
 * @param {boolean|function}
 * @return {function}
 */

function buildLogger(logger) {
  switch(typeof logger) {
    case 'function':
      return function() {
        logger(util.format(
          '%s.%s(%s) %s %s %s',
          print(arguments[0]),
          print(arguments[1]),
          print(arguments[2]),
          print(arguments[3]),
          print(arguments[4]),
          print(arguments[5])
        ));
      };
    case 'boolean':
      return logger ? console.log : null;
  }
  return null;
}

/**
 * Mongoose connection.
 *
 * @param {object} config
 * @param {object} logger
 * @return {object}
 * @api private
 */

function createConnection(config, logger) {
  // logger installation
  mongoose.set('debug', logger);
  // creating connection
  var conn = mongoose.createConnection(config.uris, config.options);
  // logging errors
  if (logger) conn.on("error", logger);
  // returning connection
  return conn;
};

/**
 * Database connections.
 *
 * @api private
 */

module.exports = {

  /**
   * List of opened connections.
   */

  _connections: {},

  /**
   * Returns database connection.
   *
   * @param {string} name
   * @return {Object}
   */

  object: function(name) {
    return this._connections[name] || null;
  },

  /**
   * Connects to databases. See the expected attribute structure bellow.
   *
   *   {  default: {
   *        'main': {
   *          uris: ['mongodb://user:pass@host:port/database'],
   *          options: {}
   *        }
   *      },
   *      production: {}
   *   }
   *
   * @param {object} config
   * @param {object} options
   */

  connect: function(config, options) {
    var logger = buildLogger(options.logger);
    Object.keys(config).forEach(function(name) {
      this._connections[name] = createConnection(config[name], logger);
    }.bind(this));
  },

  /**
   * Disconnects from databases.
   */

  disconnect: function() {
    Object.keys(this._connections).forEach(function(name) {
      var connection = this._connections[name];
      connection.close();
      delete this._connections[name];
    }.bind(this));
  }

};
