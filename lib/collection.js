module.exports = Collection;

var Model = require('./model'),
    CollectionPage = require('./collection_page'),
    utils = require('./utils');

/**
 * Collections are arrays of models
 * Given a model, and url, this load in
 * chunks using the Recurly API's cursors
 */
function Collection(model, url, force, api) {
  this.model = model;
  this._url = url;
  this.set('length', 0);
  this._api = api;
  this._forced = force;
  this.name = model.key + 's';

  utils.extend(this, force);
}

Collection.prototype = [];

Model.mixin(Collection, {
  isNew: function() {
    return false;
  }
, toString: function() {
    return this.model.key + 's';
  }
, find: function(params) {
    var m = new this.model(params, this._api);
    return m;
  }
, page: function(perPage, pageNum) {
    var p = new CollectionPage(this, perPage, pageNum);
    return p;
  }
, load: function(limit, callback) {
    return false;
  }
, symbolicName: function() {
    return this.model.key + 's';
  }
, build: function(params) {
    return new this.model(params, this._api);
  }
});


