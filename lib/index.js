'use strict';

/**
 * Module dependencies.
 */

var _ = require('lodash');
var mongoose = require('mongoose');
var connections = require('./connections');
var models = require('./models');
var cfg = require('config-keys');

/**
 * Main class.
 *
 * @api public
 */

module.exports = {

  /*
   * Opens database connections and loads models.
   *
   * @param {object} opts
   * @api public
   */

  connect: function(opts) {
    // configuration
    var options = _.merge({
      configPath: process.cwd()+'/config/mongoose.js',
      modelsPath: process.cwd()+'/app/models',
      logger: false
    }, opts);
    // connection definition
    var config = cfg.read(options.configPath);
    // opening connections
    connections.connect(config, options);
    // defining models
    models.load(connections, options.modelsPath);
  },

  /*
   * Disconnects open connections and unload models.
   *
   * @return {generator}
   * @api public
   */

  disconnect: function() {
    // destroying models
    models.unload(options.modelsPath);
    // closing connections
    connections.disconnect();
  },

  /*
   * Mongoose ODM module.
   */

  mongoose: mongoose,

  /**
   * Mongoose data types.
   */

  types: mongoose.Schema.Types,

  /*
   * Returns database connection.
   *
   * @param {string} name
   * @return {object}
   * @api public
   */

  connection: function(name) {
    return connections.object(name);
  },

  /*
   * Returns model.
   *
   * @param {string} name
   * @return {object}
   * @api public
   */

  model: function(name) {
    return models.object(name);
  }

};
