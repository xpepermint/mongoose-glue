'use strict';

/**
 * Module dependencies.
 */

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');

/*
 * Loads a model and returns an instance.
 *
 * @param {object} conn
 * @param {string} name
 * @param {object} data
 * @return {object}
 */

function loadModel(conn, name, data) {
  var schema = createModelSchema(data);
  return conn.model(name, schema);
};

/*
 * Loads a discriminator and returns an instance.
 *
 * @param {object} conn
 * @param {string} name
 * @param {object} mdata
 * @param {object} ddata
 * @return {object}
 * @see http://mongoosejs.com/docs/api.html#model_Model-discriminators
 */

function loadDiscriminator(conn, name, mdata, ddata) {
  var schema = createModelSchema(_.merge({}, mdata, ddata));
  return conn.model(ddata.extends).discriminator(name, schema);
};

/*
 * Creates model schema instance based on model data.
 *
 * @param data
 * @returns {object}
 * @see http://mongoosejs.com/docs/guide.html
 */

function createModelSchema(data) {
  // new mongoose schema instance
  var instance = new mongoose.Schema(data.attributes, data.options);
  // instance methods
  if (data.instanceMethods) {
    Object.keys(data.instanceMethods).forEach(function(name) {
      instance.method(name, data.instanceMethods[name]);
    });
  }
  // class methods
  if (data.classMethods) {
    Object.keys(data.classMethods).forEach(function(name) {
      instance.static(name, data.classMethods[name]);
    });
  }
  // plugins
  if (data.plugins) {
    data.plugins.forEach(function(plugin) {
      instance.plugin(plugin.fn, plugin.options);
    });
  }
  // middleware
  if (data.middleware) {
    Object.keys(data.middleware).forEach(function(when) {
      data.middleware[when].forEach(function(middleware) {
        instance[when](middleware.event, middleware.fn);
      });
    });
  }
    //virtuals
  if(data.virtuals){
    Object.keys(data.virtuals).forEach(function(when) {
      if(data.virtuals[when].get){
        instance.virtual(when).get(data.virtuals[when].get);
      }
      if(data.virtuals[when].set){
        instance.virtual(when).set(data.virtuals[when].set);
      }
    });
  }
  // returning model schema instance
  return instance;
};

/*
 * Loads models/discriminators and returns an array of them.
 *
 * @param {object} connections
 * @param {string} rootPath
 * @param {boolean} discriminator
 * @return {array}
 */

function loadModels(connections, rootPath, discriminator) {
  var models = {};
  // looping through files
  fs.readdirSync(rootPath).forEach(function(fname) {
    var fpath = rootPath+"/"+fname;
    // ignoring directories
    if (fs.statSync(fpath).isFile()) {
      // loading model data
      var data = require(fpath);
      var name = path.basename(fpath, path.extname(fpath));
      var conn = connections.object(data.connection);
      // load discriminator
      if (discriminator && data.extends) {
        var pdata = require(rootPath+"/"+data.extends);
        models[name] = loadDiscriminator(conn, name, pdata, data);
      }
      // load model
      else if (!discriminator && !data.extends) {
        models[name] = loadModel(conn, name, data);
      }
    }
  });
  // returning models
  return models;
};

/*
 * Models.
 *
 * @api private
 */

module.exports = {

  /**
   * List of defined models.
   */

  _models: {},

  /**
   * Returns a model object.
   *
   * @param {string} name
   * @return {Object}
   */

  object: function(name) {
    return this._models[name] || null;
  },

  /**
   * Loads models.
   *
   * @param {object} connections
   * @param {string} rootPath
   */

  load: function(connections, rootPath) {
    this._models = _.merge({},
      // Loading models.
      loadModels(connections, rootPath, false),
      // Loading discriminators.
      loadModels(connections, rootPath, true)
    );
  },

  /**
   * Unloads models.
   */

  unload: function() {
    this._models = {};
  }

};
