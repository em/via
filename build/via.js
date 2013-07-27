;(function(){
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("via/index.js", function(module, exports, require){
module.exports = require('./lib/via');

});
require.register("via/lib/via.js", function(module, exports, require){
var Via = module.exports = {};
Via.utils = require('./utils');
Via.Object = require('./object');
Via.URI = require('./uri');
Via.Window = require('./window');
Via.Element = require('./element');
Via.API = require('./api');
Via.Model = require('./model');
Via.Collection = require('./collection');
Via.CollectionPage = require('./collection_page');

if(typeof window !== 'undefined') {
  Via.window = new Via.Window(window);
}

});
require.register("via/lib/utils.js", function(module, exports, require){
var utils = module.exports = {};

/**
 * Find a nested property from a object with a "keypath"
 * e.g. traverse({foo: {bar: 123}}, 'foo.bar');
 * The last argument is a function that will be call
 * for every object in the path that receives:
 *
 * deepObj: The parent object
 * deepKey: The key of the next child object
 * nearestEmitter: Nearest ancestor that can trigger events 
 * shortestPath: Path from nearestEmitter to deepObj 
 * remainingPath: The remaining keypath from this object down
 *
 * Returning false from the callback stops traversal.
 */
utils.traverse = function(obj, keypath, fn) {
  if(!keypath) return;

  var arr = keypath.split('.');
  var k;

  var nearestEmitter;
  var shortestPath;

  for(var i=0,l=arr.length; i < l; ++i) {
    k = arr[i];

    if(fn && obj && typeof obj !== 'undefined') {
      if(obj.trigger) {
        nearestEmitter = obj;
        shortestPath = k;
      }
      else if(nearestEmitter) {
        shortestPath += '.' + k;
      }

      var keepGoing = fn(obj, k,
                         nearestEmitter,
                         shortestPath,
                         (i+1 < l ? arr.slice(i+1).join('.') : false));
      if(keepGoing === false) break;
    }

    if(obj && Object.prototype.hasOwnProperty.call(obj, k)){
      obj = obj[k];
    }
    else {
      return;
    }
  }

  return obj;
}

var _class2type = {};

var _type = function( obj ) {
  return obj == null ?
    String( obj ) :
    _class2type[ toString.call(obj) ] || "object";
};

var _isWindow = function( obj ) {
  return obj != null && obj == obj.window;
};

var _isFunction = function(obj){
  return typeof obj === "function";
};


utils.inArray = function( elem, arr, i ) {
		var len,
        core_indexOf = Array.prototype.indexOf;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	};

/**
 * Based on jQuery.isArray
 */
var _isArray =  Array.isArray || function( obj ) {
    return _type(obj) === "array";
};


/**
 * Based on jQuery.isPlainObject
 */
var _isPlainObject = function( obj ) {

  return typeof obj === "object";

  // Must be an Object.
  // Because of IE, we also have to check the presence of the constructor property.
  // Make sure that DOM nodes and window objects don't pass through, as well
  if ( !obj || _type(obj) !== "object" || obj.nodeType || _isWindow( obj ) ) {
    return false;
  }

  try {
    // Not own constructor property must be Object
    if ( obj.constructor &&
      !hasOwn.call(obj, "constructor") &&
      !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
      return false;
    }
  } catch ( e ) {
    // IE8,9 Will throw exceptions on certain host objects #9897
    return false;
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.

  var key;
  for ( key in obj ) {}

  return key === undefined || hasOwn.call( obj, key );
};

utils.isEmptyObject = function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
};

/**
 * Based on jQuery.each
 */
utils.each = function( obj, callback, args ) {
  if(typeof obj === 'undefined')
    return;

  var name,
    i = 0,
    length = obj.length,
    isObj = length === undefined || _isFunction( obj );

  if ( args ) {
    if ( isObj ) {
      for ( name in obj ) {
        if ( callback.apply( obj[ name ], args ) === false ) {
          break;
        }
      }
    } else {
      for ( ; i < length; ) {
        if ( callback.apply( obj[ i++ ], args ) === false ) {
          break;
        }
      }
    }

  // A special, fast, case for the most common use of each
  } else {
    if ( isObj ) {
      for ( name in obj ) {
        if ( callback.call( obj[ name ], name, obj[ name ] ) === false ) {
          break;
        }
      }
    } else {
      for ( ; i < length; ) {
        if ( callback.call( obj[ i ], i, obj[ i++ ] ) === false ) {
          break;
        }
      }
    }
  }

  return obj;
};

utils.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
  _class2type[ "[object " + name + "]" ] = name.toLowerCase();
});


utils.map = function(obj,fn) {
  var result = [];
  utils.each(obj, function(i,v) {
    result[i] = fn(v);
  });
  return result;
};

/**
 * Based on jQuery.extend
 */
utils.extend = function() {
  var options, name, src, copy, copyIsArray, clone,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false;

  // Handle a deep copy situation
  if ( typeof target === "boolean" ) {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== "object" && !_isFunction(target) ) {
    // target = {};
  }

  if ( length === i ) {
    target = this;
    --i;
  }

  for ( ; i < length; i++ ) {
    // Only deal with non-null/undefined values
    if ( (options = arguments[ i ]) != null ) {
      // Extend the base object
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if ( target === copy ) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if ( deep && copy && ( _isPlainObject(copy) || (copyIsArray = _isArray(copy)) ) ) {
          if ( copyIsArray ) {
            copyIsArray = false;
            clone = src && _isArray(src) ? src : [];

          } else {
            clone = src && _isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[ name ] = utils.extend( deep, clone, copy );

        // Don't bring in undefined values
        } else if ( copy !== undefined ) {
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};


});
require.register("via/lib/events.js", function(module, exports, require){
var utils = require('./utils');

module.exports = Events;

/**
 * Simple lightweight event emmitter
 */

function Events(){};

Events.prototype	= {
	on: function(events, fct){
    if(!this.hasOwnProperty('_events')) {
      this._events = {};
    }

    var split = events.split(' '); 
    for(var i = 0, l = split.length; i<l; ++i) {
      var event = split[i];

      this._events[event] = this._events[event]	|| [];
      this._events[event].push(fct);
      
    }
	},
  once: function(event, fn) {
    this.on(event, function() {
      this.unbind(event, fn);
      fn.apply(this, arguments);
    });
  },
	unbind	: function(event, fct){
    if(!this.hasOwnProperty('_events')) {
      this._events = {};
    }

		if( event in this._events === false  )	return;
    var i = utils.inArray(fct, this._events[event]);
		this._events[event].splice(i, 1);
	},
	trigger	: function(event /* , args... */){
    if(!event) return;
    // console.log('  ', event);

    if(!this.hasOwnProperty('_events')) {
      this._events = {};
    }

    var split = event.split(' ');
    if(split.length > 1) {
      for(var i = 0, l = split.length; i < l; ++i) {
        event = split[i];
        this.trigger.apply(this, arguments);
      }
      return;
    }

		if( event in this._events === false  )	return;
    var i = this._events[event].length, ret;
    while(i-- && ret !== false) {
			ret = this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
		}

    return ret;
	}
};

Events.mixin	= function(destObject){
	var props	= ['on', 'once', 'unbind', 'trigger'];
  var proto = destObject.prototype || destObject;
	for(var i = 0; i < props.length; i ++){
		proto[props[i]]	= this.prototype[props[i]];
	}
}

});
require.register("via/lib/object.js", function(module, exports, require){
module.exports = ReactiveObject;

var Events = require('./events')
,   utils = require('./utils');

/**
 * Common model constructor
 * This gets called directly by more specific models
 */
function ReactiveObject(obj) {
  this.set(obj);
}; 

ReactiveObject.prototype = {
/**
 * Set a single attribute on the model 
 * or an object of key-value pairs which gets
 * deep merged.
 *
 * Setting always triggers a "set:{key}" event
 * and a "changed" event with the key as an argument
 * against the nearest emitter
 * after each property is assigned.
 */
  set: function(k,v) {
    var self = this;

    function setAttr(target,k,newV) {
      var queue = [];
      var changed = false;

      utils.traverse(target, k, function(deepObj, deepAttr,
                             nearestEmitter, shortestPath, remainingPath) {

        if(remainingPath && (!deepObj.hasOwnProperty(deepAttr)
          || typeof deepObj[deepAttr] === 'undefined')) {
          deepObj[deepAttr] = {};
          changed = true;
        }

        var preV = deepObj[deepAttr];

        if(!remainingPath) {
          deepObj[deepAttr] = newV;

          if(newV !== preV) {
            changed = true;
          }

          self._lastChangedProperty = k;
          self._lastChangedValue = preV;
        }

        queue.push([nearestEmitter, shortestPath, deepObj[deepAttr], preV]);
      });

      // Bubble set and changed events for every node
      // in the path if the leaf actually changed.
      var e;
      if(changed) {
        while(e = queue.pop()) {
          e[0].trigger('set:'+e[1],e[2],e[3]);
          e[0].trigger('changed',e[1],e[2],e[3]);
        }
      }
    }

    if(typeof k === 'object') {
      function recurse(target,src) {
        for(var k in src) {
          var srcv = src[k];
          if(src.hasOwnProperty(k)) {
            if(typeof srcv === 'object' && target.hasOwnProperty(k)) {
              recurse(target[k], srcv);
            }
            else {
              setAttr(target,k,srcv);
            }
          }
        }
      }


      recurse(this,k);
    }
    else {
      if(typeof k !== 'undefined' && k.toString) {
        k = k.toString();
      }

      setAttr(this, k, v);
    }

    // this.trigger('changed', k, v);
  }

/**
 * Get a single attribute after triggering a get:{key}
 * event which gives handlers the opportunity to change 
 * the property's value.
 */
, get: function(keypath, callback, allowDefault) {

   var result = utils.traverse(this, keypath, function(obj,key,
                           nearestEmitter, shortestPath) {
     if(nearestEmitter) {
       nearestEmitter.trigger('get:'+shortestPath);
     }
   });

   if(callback) {
     if(result) {
       callback(result);
     }
     else {
       this.watch(keypath, function() {
         var got = callback.apply(this, arguments);
         this.stop();
       });
     }
   }

   return result;
  }

, debug: function(attr) {
    this.watch(attr, function(newV, preV) {
      console.log(attr, preV, '->', newV);
    });
  }

/**
 * Monitors a space-separated list of attributes for changes,
 * calling a function after any one has changed.
 * The values of the source attributes are passed to the
 * callback in the same order they were given.
 */
, watch: function(attr, fn) {
    var self = this;

    // Substitutions
    var interpolated = (typeof attr === 'string') && attr.match(/\{.+?\}/g);
    if(interpolated) {
      interpolated = utils.map(interpolated, function(a) {
        return a.slice(1, a.length-1);
      });

      return this.watch(interpolated.join(' '), function() {
        var result = attr;
        for(var i=0; i < arguments.length; ++i) {
          var v = arguments[i];
          result = result.replace('{'+interpolated[i]+'}', v);
        }
        fn.call(this, result);
      });
    }

    this.load && this.load();

    // If only a function, we monitor any direct change
    // to the object attributes via the "changed" event
    if(arguments.length === 1 && typeof attr === 'function') {
      fn = attr;
      attr = '*';
    }

    if(attr === '*') {
      var event = this.on('changed', fn);
      fn.call(this); // Initial update
      this.load && this.load();
      return event;
    }

    if(attr instanceof RegExp) {
      var event = this.on('changed', function(k,newV,preV) {
        if(attr.exec(k) !== null) {
          fn.call(this,k,newV,preV);
        }
      });

      for(var k in this) {
        if(attr.exec(k) !== null) {
          var v = this.get(k);
          fn.call(this,k,v);
        }
      }
      // fn.call(this); // Initial update
      this.load && this.load();

      return;
    }

    // If no callback, just return gracefully and do nothing
    if(!fn) return;


    // Split out multiple input attributes
    var multi = attr.split(' ');

    // We encapsulate all of our events
    // under an outside container that only has one
    // attribute point to self
    // This allows us to unbind every event by simply
    // setting root to an eventless object, such as null.
    // This container is returned.
    var container = new ReactiveObject({
      root: self
    });

    var stopping = false;
    container.stop = function() {
      stopping = true;
      this.set('root', null);
      stopping = false;
    }


    var optional = [];

    // Prefix the attributes with root
    multi = utils.map(multi, function(attr) {

      if(attr.slice(-1) === '!') {
        return attr;
      }

      if(attr.slice(-1) === '?') {
        attr = attr.slice(0,-1)
        optional.push(attr);
      }

      return 'root.'+attr;
    });

    // Updater function we call when any invalidation occurs
    // Builds a list of arguments from the input attrs,
    // and envokes the callback with those values.
    function update(preV) {
      if(stopping) return;

      var allDefined = true;
      var args = utils.map(multi, function(attr) {
        var val;
        if(attr.slice(-1) === '!') {
          val = attr.slice(0,-1);
        }
        else {
          val = container.get(attr);
        }
        if(val === undefined)
          allDefined = false;
        return val;
      });

      if(!allDefined)
        return;

      args = args.concat(
        Array.prototype.slice.call(arguments,0)
      );

      fn.apply(container, args);
    }

    utils.each(multi, function(i,attr) {

      if(attr.slice(-1) === '!') {
        return;
      }

      utils.traverse(container, attr, function(deepObj, deepAttr,
                  nearestEmitter, shortestPath, remainingPath) {

        if(nearestEmitter) {
          nearestEmitter.on('set:'+shortestPath, updateAttr);
        }

        if(deepObj && deepObj.load) {
          deepObj.load();
        }

        function updateAttr(newV,preV) {
          if(newV !== preV) {
            utils.traverse(newV, remainingPath, function(deepObj, deepAttr,
                                             nearestEmitter, shortestPath) {
              if(nearestEmitter) {
                nearestEmitter.on('set:'+shortestPath, updateAttr);
              }

              if(deepObj && deepObj.load) {
                deepObj.load();
              }
            });

            utils.traverse(preV, remainingPath, function(deepObj, deepAttr,
                                             nearestEmitter, shortestPath) {
              if(nearestEmitter)
                nearestEmitter.unbind('set:'+shortestPath, updateAttr);
            });
          }

          update(preV, attr);
        }

      });
    });

    update();

    return container;
  }

  // TODO: Do these better...
  // they might not actually be called promises
  // but a special case of something like Watchers
  // This gets the job done for now.
, promise: function(fn) {
    var obj = {
      then: function(thenf) {
        if(this.result) {
          thenf(this.result);
          return;
        }

        this.waiting = thenf;
      }
    , waiting: null
    , result: null
    };

    function done(result) {
      if(obj.waiting) {
        obj.waiting(result);
        return;
      }

      obj.result = result;
    }

    fn.call(this, done);

    return obj;
  }

/**
 * Use watch parameters to set a single result attribute
 */ 
, synth: function(output,input,fwdFn,revFn) {
    function straight() {
      return arguments[0];
    };

    if(!fwdFn) {
      // We can only default reverse
      // if forward is default, so
      // we default them together.
      fwdFn = straight;
      revFn = straight;
    }

    var self = this;
    self.watch(input, function() {
      var result = fwdFn.apply(self, arguments);

      if(result && result.then) {
        result.then(function(result) {
          self.set(output, result);
        });
      }
      else {
        self.set(output, result);
      }
    });

    if(revFn) {
      this.synth(input, output, revFn);
    }

    return this;
  }
};

/**
 * Make an event emmitters
 */
Events.mixin(ReactiveObject);

});
require.register("via/lib/uri.js", function(module, exports, require){
module.exports = ReactiveURI;

var ReactiveObject = require('./object'),
    utils = require('./utils');

function ReactiveURI(init) {
  this.set(init);

  this.synth('host', 'hostname port', function(h,p) {
    return h && p && [h,p].join(':');
  });

  this.synth('hostname', 'host', function(host) {
    return host && host.split(':')[0]
  });

  this.synth('port', 'host', function(host) {
    return host && host.split(':')[1]
  });

  this.synth('query', 'search', function(search, prev) {
    var match = (''+search).match(/\?(.+?)(?:#|$)/);
    return match && match[1] || '';
  });

  this.synth('search', 'query', function(query) {
    if(!query) return '';
    return '?'+query;
  });

  this.synth('query', 'params', function(params) {
    var str = [];
    for(var p in params) {
      if(params[p] !== undefined) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
      }
    }
    return str.join("&");
  });

  this.synth('params', 'query', function(query) {
    if(!query) return {};

    query = query.replace('+',' ');

    var params = {}, tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(query)) {
      params[decodeURIComponent(tokens[1])]
      = decodeURIComponent(tokens[2]);
    }

    return params;
  });

}

ReactiveURI.prototype = new ReactiveObject();

});
require.register("via/lib/window.js", function(module, exports, require){
var ReactiveObject = require('./object'),
    ReactiveURI = require('./uri');

module.exports = ReactiveWindow;

function ReactiveWindow(window) {
  this.actual = window;
  this.location = new ReactiveURI(window.location);

  var self = this;
  var pushState = new ReactiveURI(window.location);
  var popping = false;
  window.addEventListener('popstate', function() {
    popping = true;
    self.location.set(window.location);
    popping = false;
  });

  pushState.watch('pathname search',
            function(path,search) {
    if(!popping) {
      window.history.pushState(null, null, path+search);
    }
  });

  window.poop = pushState;

  var defaultParams = {};
  this.watch('location.params', function(params) {
    var uniqueParams = {};

    for(var k in params) {
      defaultParams[k] = defaultParams[k] || params[k];

      if(defaultParams[k] != params[k]) {
        uniqueParams[k] = params[k];
      }
    }

    pushState.set('params', uniqueParams);
  });
}

ReactiveWindow.prototype = new ReactiveObject();

});
require.register("via/lib/element.js", function(module, exports, require){
module.exports = ReactiveElement;

var ReactiveObject = require('./object')
  , Via = require('./via')
  , utils = require('./utils')
  , globalElements = require('./elements')
  , globalAttributes = require('./attributes');

// Only place we should be using jQuery 
// TODO: Get rid of
if(typeof jQuery !== 'undefined')
  var $ = jQuery;

/**
 * Represents a single UI instance for a model's ever changing data.
 */
function ReactiveElement(data, options) {
  options = options || {};

  var parent = options.parent || this;

  this.data = new ReactiveObject({
    ui: this
  , url: Via.window.location
  });

  this.children = {};

  function Elements() {}
  function Attributes() {}
  Elements.prototype = parent.elements;
  Attributes.prototype = parent.attributes;
  this.elements = new Elements();
  this.attributes = new Attributes();

  // Accept new custom elements from options
  if(options.elements) {
    this.elements.set(options.elements);
  }

  // Accept new custom elements from options
  if(options.attributes) {
    this.attributes.set(options.attributes);
  }

  // Allow string in lieu of options for a template
  if(typeof options === 'string') {
    options = {template: options};
  }
  // Handle dom elements (anything with an outerHTML) 
  else if(options && options.outerHTML) {
    options = {template: options};
  }

  // If the template is an element, take the outerHTML
  if(options.template && options.template.outerHTML) {
    options.template = options.template.outerHTML;
  }

  // Accept direct data if it has a symbolic name
  // by assigning it to an empty object with a single
  // property of that name
  if(data.symbolicName) {
    var name = data.symbolicName();
    this.data.set(name, data);
  }
  else if(typeof data === 'object') {
    this.data.set(data);
  }
  else {
    // fail
  }

  this.template = options.template;
  this.rootElement = $(this.template)[0];

  var rootTagName = this.rootElement.tagName.toLowerCase();
  var implFn = options.impl || this.elements[rootTagName];

  if(implFn) {
    var elemattrs = {};
    for(var i=0, attrs=this.rootElement.attributes,
         l=attrs.length; i < l; i++) {
      var attr = attrs.item(i)
        , k = attr.nodeName, v = attr.nodeValue;
      elemattrs[k] = v;

      this.data.synth(k, 'parent.'+v);

      // Default any undefined values to the literal attribute value
      if(!this.data[k]) this.data.set(k,v);
    }


    if(this.rootElement.children.length) {
      this.template = this.rootElement.innerHTML;
    }
    else if(implFn.template) {
      this.template = implFn.template;
    }

    this.rootElement = $(this.template).get(0);

    var result = implFn.call(this,
                    this, elemattrs, this.template);

    if(typeof result === 'string') {
      this.rootElement = $(result).get(0);
    }
    else if(result && result.nodeName) {
      this.rootElement = result;
    }
  }


  this.build();
  return this;
};

ReactiveElement.prototype = new ReactiveObject({
  find: function(selector) {
    return $(this.rootElement).find(selector);
  }
 , build: function(options) {
    var self = this;

    var $dom = $(this.rootElement);

    $dom.data('recurly', self.data);
    $dom.data('recurly_ui', self);
    
    // TODO: More efficient approach using querySelectorAll if available
    function recurseChildren(node) {
      var tagName = node.tagName && node.tagName.toLowerCase();

      if(self.elements[tagName]) {
        var template = node.outerHTML;
        var newElem = new ReactiveElement({parent: self.data}, {template: template, parent: self});
        if(node === self.rootElement) {
          self.rootElement = newElem.rootElement;
        }
        else {
          node.parentNode.insertBefore(newElem.rootElement, node);
          node.parentNode.removeChild(node);
        }
      }
      else {
        for (var i = 0; i < node.childNodes.length; i++) {
          var child = node.childNodes[i];
          recurseChildren(child);
        }
      }
    }

    recurseChildren(this.rootElement);

    // Any data- attributes we find in the template but don't have handlers for.
    // Make them map to the equivalent non-data attribute of the same name.
    var matchedTplAttrs = $dom.html();
    matchedTplAttrs = matchedTplAttrs && matchedTplAttrs.match(/data-(\w+)[^\w]/gi) || [];
    matchedTplAttrs = utils.map(matchedTplAttrs, function(match) {
      return match.match(/-(\w+)/)[1]; } );
    utils.each(matchedTplAttrs, function(i,attrName) {
      if(!self.attributes[attrName]) {
        self.attributes[attrName] = function(ui, keypath) {
          var $elem = $(this);
          ui.data.watch(keypath, function(value) {
            $elem.attr(attrName, value);
          });
        }
      }
    });

    // This is a temporary hack for data-list
    // Run attributes that use the third template argument last
    // See issue #34
    for(var i = 3; i > 1; --i) {

      // Handle all custom attribute in template
      for(var attrName in this.attributes) {
        var impl = this.attributes[attrName];

        if(typeof impl !== 'function') continue;
        if(impl.length !== i) continue;

        function buildAttr() {
          var value = $(this).attr('data-'+attrName);
          var template = this.innerHTML;
          self.attributes[attrName].call(this, self, value, template);
          
          $(this).removeAttr('data-'+attrName);
        }

        if($dom.is('[data-'+attrName+']')) {
          buildAttr.call(this.rootElement);
        }

        $dom.find('[data-'+attrName+']').each(buildAttr);
      }
    }

    return $dom;
 }
 , elements: new ReactiveObject(globalElements)
 , attributes: new ReactiveObject(globalAttributes)
});

});
require.register("via/lib/elements/index.js", function(module, exports, require){
module.exports = {
  page: require('./page')
, page_links: require('./page_links')
}

});
require.register("via/lib/elements/page.js", function(module, exports, require){
module.exports = function page(ui,attrs) {

  this.data.synth('page', 'collection size', function(c,size) {
    var page = c.page(size);

    ui.data.synth('page.size', 'size');
    ui.data.synth('page.number', 'number');

    return page;
  });

  this.data.synth('info', 'page.number page.length page.total page.size',
                function(n, length, total, size) {
    if(length === total)
      return 'Showing ' + total + ' of ' + total;

    var a = (n-1)*size+1;
    var b = a+length-1;
    return 'Showing ' + a + '-' + b + ' of ' + total;
  });
};


});
require.register("via/lib/elements/page_links.js", function(module, exports, require){
module.exports = function(ui,attrs) {
  var $root = $(this.rootElement);

  // TODO: Should this be a generic thing?
  // Maybe this elem exists outside of page,
  // but nesting only makes "page" default to parent
  ui.data.synth('page', attrs.page || 'parent.page');

  $root.on('click', 'a', function() {
    ui.data.set('page.number', $(this).attr('data-page'));
    ui.data.set('selected', this);
  });

  ui.data.synth('links', 'page page.total page.size page.number', function(page, total, size, n) {
    if(!page || !total || !size) return;
    if(total <= size) return '';

    n = parseInt(n);

    var result = '';
    var l = Math.ceil(total/size);
    var max = 5;
    var start = Math.max(1, n - max);
    var end = Math.min(start+l, start+max);
    var hops = {};

    if(start > 1) {
      hops[1] = start+1;
    }

    if(end < l) {
      hops[end] = l-1;
    }

    if(l > 1) {
      for(var i = 1; i <= l; ++i) {
        if(i === n) {
          result += '<em class="current">'+i+'</em>';
        }
        else {
          result += '<a data-page="'+i+'">'+i+'</a>';
        }

        if(hops[i]) {
          result += '<span>&hellip;</span>'
          i = hops[i];
        }
      }
    }

    if(n !== 1) {
      result = '<a class="link" data-page="'+(n-1)+'">Prev</a>' + result;
    }
    else {
      result = '<span class="previous_page disabled">Prev</span>' + result;
    }

    if(n < l) {
      var i = n+1;
      result += '<a class="link" data-page="'+i+'">Next</a>';
    }
    else {
      result += '<span class="next_page disabled">Next</span>';
    }

    return result;
  });
};

module.exports.template = '<div class="page_links"><span data-html="links" class="links"></span></div>';

});
require.register("via/lib/attributes/index.js", function(module, exports, require){
var index = [
  'list'
, 'text'
, 'html'
, 'for'
, 'class'
];

for(var i=0,l=index.length; i < l; ++i) {
  module.exports[index[i]] = require('./data-'+index[i]);
}

});
require.register("via/lib/attributes/data-class.js", function(module, exports, require){
/**
 * Bind a class name to a synthetic attribute 
 */
module.exports = function(ui,value) {
  var $elem = $(this);

  var prevClass; 
  ui.data.watch(value, function(v) {
    if(prevClass) {
      $elem.removeClass(prevClass);
    }
    $elem.addClass(v);
    prevClass = v; 
  });
};

});
require.register("via/lib/attributes/data-text.js", function(module, exports, require){
/**
 * Bind the innerText of a single element to a synthetic attribute
 */
module.exports = function(ui,value) {
  var $elem = $(this);
  $elem.click(function() {
    console.log(ui);
  });

  ui.data.watch(value, function(v,p) {
    if(v === null) v = '';
    $elem.text(''+v);
    $elem.html($elem.html().replace(/\n/g,'<br/>'));
  });
};



});
require.register("via/lib/attributes/data-html.js", function(module, exports, require){
/**
 * Bind the innerHTML of an element to a synthetic attribute
 */
module.exports = function(ui,value) {
  var $elem = $(this);

  ui.data.watch(value, function(v) {
    $elem.html(v);

  });
};



});
require.register("via/lib/attributes/data-list.js", function(module, exports, require){
var ReactiveElement = require('../element');

/**
 * Bind a collection to a repeating block scoped per item
 */
module.exports = function(ui,value,template) {
  var target = $(this).empty();

  ui.data.watch(value, function(collection) {
    if(!collection) return;

    // Remove any element beyond the collection length
    collection.watch('length',function(length) {
      var $list = $(target);
      var $children = $list.children();
      $children.each(function(i) {
        if(i >= length) { 
          $(this).remove();
        }
      });
    });

    // Update or append as any numeric index changes
    collection.watch(/\d+/,function(i,item,prev) {
      if(item === undefined) return;

      var $list = $(target);
      var $children = $list.children();
      var oldElem = $children.get(i);

      if(item) {
        var itemui = new ReactiveElement(item, template);
        var $e = $(itemui.rootElement);

        window.dbinv = itemui;

        if(oldElem) {
          $(oldElem).replaceWith($e);
        }
        else {
          $e.appendTo(target);
        }
      }
    });

  })
};



});
require.register("via/lib/attributes/data-for.js", function(module, exports, require){
module.exports = function(ui,value) {
  var $root = $(this);
  var $empty = $root.find('empty').remove().last().children().first();

  ui.data.watch(value+'._http_status', function(status,prev) {
    if(status == 404) {
      $root.replaceWith($empty);
    }
    else if(prev == 404) {
      $empty.replaceWith($root);
    }
  });

};

});
require.register("via/lib/api.js", function(module, exports, require){
var utils = require('./utils');

module.exports = API;

var isNode = true;
if(typeof window !== 'undefined') {
  isNode = false;
}

/**
 * Abstract API interface used by Model and Collection
 */
function API(baseUrl, authKey) {
  this.baseUrl = baseUrl;
  this.authKey = authKey;

  API.defaultAPI = this;
}

API.prototype = {
  jsonpRequest: (function() {
    var count = 1;
    return function(method, url, data, callback){
      if(method == 'POST' || method == 'PUT') {
        var body = JSON.stringify(data);
        data = {_body: body};
      }
     
      data = data || {};

      utils.extend(data, {
        _method: method,
        _token: this.authKey,
        js_version: exports.version
      });

      url += '?' + jQuery.param(data);

      url += '&' + Math.round(Math.random() * 0xffffffff);

      var opts = opts || {};
      var param = opts.param || 'callback';
      var timeout = null != opts.timeout ? opts.timeout : 60000;
      var enc = encodeURIComponent;
      var target = document.getElementsByTagName('script')[0];
      var script;
      var timer;

      // generate a unique id for this request
      var id = count++;

      if (timeout) {
        timer = setTimeout(function(){
          cleanup();
          callback && callback(new Error('Timeout'));
        }, timeout);
      }

      function cleanup(){
        script.parentNode.removeChild(script);
        delete window['recurly_jsonp_' + id];
      }

      window['recurly_jsonp_' + id] = function(data,headers){
        if (timer) clearTimeout(timer);
        cleanup();
        callback && callback(null, data, headers);
      };

      // add qs component
      url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc('recurly_jsonp_' + id + '');
      url = url.replace('?&', '?');

      // debug('jsonp req "%s"', url);

      // create script
      script = document.createElement('script');
      script.src = url;
      target.parentNode.insertBefore(script, target);
    };
     
  })()

/**
 * Common request implementation only for node environment
 * uses "request" module with BasicAuth
 */
, nodeRequest: function(method, uri, data, callback) {
    var request = require('request');
    var apiKey = this.authKey;

    request({
      method: method
    , uri: this.baseUrl + uri 
    , data: JSON.stringify(data)
    , headers: {
         'Authorization'  : "Basic "+(new Buffer(apiKey+':')).toString('base64')
       , 'Accept'         : 'application/json'
       , 'Content-Type'   : 'application/json'
       , 'Content-Length' : (data) ? data.length : 0
      }
    }
    , function(err, res, body) {
      if(err) {
        callback(err);
      }
      else if(res.statusCode >= 200 && res.statusCode < 300) {
        callback(null, JSON.parse(body.toString()));
      }
      else if(res.statusCode === 404) {
        callback(null, {meta: {status: 404}});
      }
      else {
        callback(new Error(body));
      }
    });
  }

/**
 * Common request interface that simply delegates
 * to either nodeRequest or browserRequest given
 * the environment
 */
, request: function(method, uri, data, callback) {
    return (isNode ? this.nodeRequest : this.jsonpRequest)
      .call(this, method, uri, data, callback);
  }
};

});
require.register("via/lib/model.js", function(module, exports, require){
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

});
require.register("via/lib/collection.js", function(module, exports, require){
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



});
require.register("via/lib/collection_page.js", function(module, exports, require){
module.exports = CollectionPage;

var Model = require('./model');

function CollectionPage(collection, size, number) {
  this.collection = collection;

  this.set({
    size: size || 50,
    number: number || 1,
    length: 0
  });


  // TODO: When this is a "watch"
  // the page loads when it's instantiated
  // which it should not...
  // This is just due to watch logic, not
  // the reload() below
  this.watch('number', function(num,prev) {
    if(!num) {
      this.root.set('number',1);
      return;
    }

    if(prev)
      this.root.reload();
  });

  this.synth('total', 'collection.total');
}

CollectionPage.prototype = [];

Model.mixin(CollectionPage, {
  query: function(params, callback) {
    params.per_page = this.get('size');
    params.page = this.get('number');

    var self = this;
    this.collection.query(params, function(err,res) {
      self.handleResponse(err, res, callback);
    });
  }
, handleResult: function(data,meta) {
    if(meta) {
      this.set('total', parseInt(meta.count));
    }

    for(var i=0, l=data.length; i < l; ++i) {
      this.collection._forced.__loaded__ = true;
      var item = new this.collection.model(this.collection._forced, this._api);
      item.handleResult(data[i]);
      this.set(i, item);
    }

    for(var i=data.length, l=this.length; i < l; ++i) {
      this.set(i, undefined);
    }

    this.set('length', data.length);
    this.trigger('loaded',data,meta);
  }
, symbolicName: function() {
    return this.collection.symbolicName();
  }
});

});
  if ("undefined" == typeof module) {
    window.Via = require("via");
  } else {
    module.exports = require("via");
  }
})();