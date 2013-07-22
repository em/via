module.exports = Model;

var ReactiveObject = require('./object')
  , API = require('./api')
  , utils = require('./utils');

/**
 * Common model constructor
 * This gets called directly by more specific models
 */
function Model(obj, api) {
  this.set(obj);

  this._nested = []; // Model properties that should be nested within PUT/POST data
  this._events = {};
  this._filters = {};
  this._sources = [];
  this._api = api || API.defaultAPI;

  // TODO: I think this should just be a generic mode
  // for a pending http request through net start/stop events
  this.on('save load cancel', function() {
    this.trigger('lock');
  });

  this.on('saved loaded canceled error', function() {
    this.trigger('unlock');
  });

  this.on('load', function() {
    this.set({__loading__:true, __loaded__: false});
  });

  this.on('loaded', function() {
    this.set({__loading__:false, __loaded__: true});
  });

  /**
   * Handle nested models in a response 
   * as independent loads for those associations
   */
  this.on('loaded', function(res) {

    var _links = this._links;

    for(var k in _links) {
      if(!_links.hasOwnProperty(k)) continue;

      var link = _links[k];
      if(k === 'self') {
        this._url = link.href;
      }
      else if(this[k]) {
        this[k]._url = link.href;
      }
    }

    for(var i=0; i < this._nested.length; ++i) {
      var nestedKey = this._nested[i];
      var nested = this[nestedKey];

      if(nested) {
        if(res.hasOwnProperty(nestedKey)) {
          nested.handleResult(res[nestedKey]);
        }
      }
    }
  });

  /**
   * When a model is nested it will be saved when the parent is saved
   * We have to propagate the "saved" event through nested records,
   * via handleResult, because we only get one response.
   */
  this.on('saved', function(res) {
    for(var i=0; i < this._nested.length; ++i) {
      var nestedKey = this._nested[i];
      var nested = this[nestedKey];

      if(res.hasOwnProperty(nestedKey)) {
        nested.handleResult(res[nestedKey]);
        nested.trigger('saved',res[nestedKey]);
      }
      else {
        nested.reload(function(err,res) {
          nested.trigger('saved',res);
        });
      }
    }
  });
}; 

Model.prototype = new ReactiveObject({
  _constructor: Model 
, toString: function() {
    return this._constructor.key;
  }

/**
 * Does a get request against the resource with query parameters
 * But does not save the result. This allows multiple derivative 
 * data stores to use the same resource.
 */
, query: function(params, callback) {
    var self = this;

    if(typeof params === 'function') {
      callback = params;
      params = {};
    }

    params = params || {};

    return this.getUrl(function(err, url) {
      if(err) return callback(err);

      if(url) {

        self._api.request('GET', url, params, function(err, res) {
          callback && callback(err, res);
        });
      }
      else {
        // TODO: How should we handle this?
      }
    });
  }

/**
 * Generate sanitized JSON for PUT and POST
 * If already loaded, only the differences
 * are generated.
 */
, toJSON: function() {
    var clean = {},
        obj = this,
        original = this._original;

    for(var k in obj) {
      var v = obj.get(k);

      if(k.indexOf('_') === 0)
        continue;

      if(k.indexOf('$') === 0)
        continue;

      if(!obj.hasOwnProperty(k))
        continue;

      if(original &&
         original.hasOwnProperty(k) &&
         original[k] == v) {
        continue;
      }

      var ov = original && original[k];

      if(v instanceof Model) {
        if(obj._nosave) {
          continue;
        }

        if(obj._nested && obj._nested.indexOf(k) >= 0) {
          var tmp = v.toJSON();
          if(!utils.isEmptyObject(tmp)) {
            clean[k] = tmp;
          }
        }
      }
      else if(typeof v === 'object') {
        var tmp = v;
        if(!utils.isEmptyObject(tmp)) {
          clean[k] = tmp;
        }
      }
      else if(typeof v !== 'function') {
        if(v) {
          clean[k] = v;
        }
      }
    }

    return clean;
  }

/**
 * _Ensures_ the model is loaded without always loading
 * 1. If already loaded callback immediately
 * 2. If loading is in-progress, use the pending load
 * 3. Otherwise, do an initial load
 */
, load: function(callback) {
    var self = this;
  
    if(this.__loading__) {
      this.once('loaded', function() {
        callback && callback(null, this);
      });
      return;
    }

    if(this.__loaded__) {
      callback && callback(null, this);
    }
    else {
      this.reload(callback);
    }
  }
, isNew: function() {
    return !this.__loaded__;
  }
, getUrl: function(callback) {
    if(!this._api) {
      callback && callback(null, false);
      return false;
    }

    if(callback) {
      if(this.getUrl()) {
        callback(null, this.getUrl());
      }
      else {
        var self = this;

        // Try to find a source that knows our URL
        var source = this._parent;

        // Use the first loaded source, or the first known
        for(var i=0,l=this._sources.length; i < l; ++i) {
          var candidate = this._sources[i];
          if(candidate.getUrl()) {

            if(candidate.__loaded__) {
              source = candidate;
            }
            else if(!source) {
              source = candidate;
            }

          }
        }

        if(source) {
          if(!source.__loaded__ && !source.__loading__) {
            console.log('loading ' + source + ' to find ' + self);
          }
          
          // Load the source
          source.load(function(err) {
            var url = self.getUrl();
            var name = self.symbolicName();

            if(!url && source._links[name]) {
              self._url = source._links[name].href;
            }

            if(!err && self.getUrl()) {
              // Yay, looks like we got it!
              callback(null, self.getUrl());
            }
            else if(!err) {
              callback(null, false);
              // console.error('no url and no err for ' + self, source);
              // TODO: Need to figure out, when and where this is a real error.
            }
            else {
              callback(new Error('Cannot find ' + self + ' because ' + source + ' failed to load.'));
            }
          });
        }
        else {
          callback(null,false);
          // console.error('no url for ' + self, 'because no sources');
          // TODO: Need to figure out, when and where this is a real error.
        }
      }
    }

    if(this._url) {
      return this._url;
    }

    var baseUrl = this._api.baseUrl;
    var uri = this.getUri();
    return uri && baseUrl + uri + '.json'; 
  }
, getUri: function() {
    if(this._uri) {
      return this._uri;
    }

    if(this._parent && this._parent.getUri()) {
      return this._parent.getUri() + '/' + this.symbolicName();
    }
  }

/**
 * Forces a reload of the model, even if it's already loaded. 
 */
, reload: function(callback) {
    var self = this;

    this.__loading__ = true;
    this.trigger('loading');

    this.query({}, function(err, res) {
      self.handleResponse(err, res, callback);
    });

  }

, symbolicName: function() {
    return this._constructor.key;
  }

/**
 * Universal response handlers.
 * This does catch-all checks for for errors,
 * and looks for result data that will be used
 * to propagate a reload.
 */
, handleResponse: function(err, res, callback, effects) {
  this.trigger('response', res);
  this._lastResponse = res;

  this.__loading__ = false;
  this.__loaded__ = true;

  // TODO: Store this in a better place.
  // And there seems to be issues watching the
  // deep nested non-model objects.
  this.set('_http_status', this.get('_lastResponse.meta.status'));

  if(err) {
    this.handleErrors(err);
    return callback && callback(err);
  }
  else {

   if(res.error) {
      this.handleErrors(res.error);
      return callback && callback(res.error);
    }

    // Look for result model data
    var data = res[this.symbolicName()];

    if(!data) {
      // TODO proper strange error handling
      throw 'response with no data (' + this.symbolicName() + ')';
    }

    if(res.meta.status >= 200
       && res.meta.status < 300) {

      this.trigger(effects, res);
      this.handleResult(data, res.meta);

      return callback && callback(null, res);
    }
    else {
      this.handleErrors(res.error);
      return callback && callback(err);
    }

  }
}

, handleErrors: function(err) {
  this.trigger('error', err);
  this.set('error', err);
  if(console && console.error)
    console.error('Recurly.js error', err.message);
}

/**
 * Handle result data from an API response
 * e.g. direct load, or result from save
 * This could also be nested data from a parent
 */
, handleResult: function(data,meta) {
    this.set(data);
    this._original = data;
    this.trigger('loaded',data,meta);
  }

/**
 * Saves the record.
 * If the record is new and has a URI, PUTs everything
 * If no URI, but has a parent, POSTs to the parent
 * If it's loaded (thereby having a URI), PUTs only the changed attributes
*/
, save: function(callback) {
    var self = this;

    var uri = self.getUrl();

    var data = {};
    data[self._constructor.key] = self.toJSON();

    self.trigger('save');

    // The presence of a URI means we can PUT there
    if(uri) {
      self._api.request('PUT', uri, data, function(err, res) {
        self.handleResponse(err, res, callback, 'updated saved');
      });
    }
    // No URI, see if we can POST to the parent
    else if(self._parent) {
      var uri = self._parent.getUri();

      self._api.request('POST', uri, data, function(err, res) {
        self.handleResponse(err, res, callback, 'created saved');
      });
    }
  }

/**
 * Simply DELETE the record
 */
, destroy: function(callback) {
    var uri = this.getUri();
    this._api.request('DELETE', uri, {}, function(err, res) {
      handleResponse(err, res, callback);
    });
  }

/**
 * Defines a one-to-one association, only for use in model constructors
 */
, _hasOne: function(name, model, force, nested) {
    if(force === true) {
      nested = true;
      force = {};
    }
    force = force || {};

    force[this._constructor.key] = this;
    var child = this[name] = model.build(this[name], force, this._api); 

    if(nested) {
      this._nested.push(name);
      child._sources.push(this);
    }
  }

/**
 * Defines a one-to-many association, only for use in model constructors
 */
, _hasMany: function(name, model, force, nested) {
    if(force === true) {
      nested = true;
      force = {};
    }
    force = force || {};
    force[this._constructor.key] = this;

    var Collection = require('./collection');

    if(!model.Collection) {
      model.Collection = function() {
        Collection.apply(this, arguments);
      };
      model.Collection.prototype = Collection.prototype;
    }

    var coll = this[name] = new model.Collection(model, null, force, this._api); 
    coll._parent = this;
    coll.name = name;

    if(nested) {
      this._nested.push(name);

      // TODO not sure
      coll._inline = true;
    }
  }

/**
 * Setup a one-to-one association and denote that 
 * the child knows the URL of this model
 */
, _belongsTo: function(name, model, force, nested) {
    this._hasOne(name, model, force, nested);
    this[name]._sources.push(this);
  }
});

// 
// /**
//  * Incorporates model behavior into a specific model.
//  * This includes functions on the constructor itself,
//  * in addition to extending the prototype.
//  * e.g. Model.mixin(Account)
//  */
Model.mixin = function(ctor, proto) {
  // Extend the constructor
  utils.extend(ctor, Model);
  ctor.prototype = new Model();

  // Extend the prototype
  proto = proto || {};
  proto._constructor = ctor;
  proto.constructor = ctor;
  proto._key = ctor.key;
  utils.extend(ctor.prototype, proto);
};

/**
 * If passed an existing model this just returns it.
 * Otherwise it tries to build the type of model using
 * the first argument as params.
 */
Model.build = function(param, force, api) {
  var inst,
      model = this;

  force = force || {};
  force._api = api;

  if(force) {
    param = param || {};
    for(var k in force) {
      if(force.hasOwnProperty(k))
        param[k] = force[k];
    }
  }

  if(param && param._constructor && param._constructor === model) {
    inst = param;
  }
  else if(typeof param === 'object') {
    inst = new model(param, api);
  }
  else {
    inst = new model({}, api);
  }

  return inst;
}

Model.prototype.isModel = true;
Model.isModel = function(obj) {
  return (typeof obj === 'object' && !!obj.isModel);
};
