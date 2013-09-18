;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
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

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
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
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
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

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-domify/index.js", function(exports, require, module){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  var els = el.children;
  if (1 == els.length) {
    return el.removeChild(els[0]);
  }

  var fragment = document.createDocumentFragment();
  while (els.length) {
    fragment.appendChild(el.removeChild(els[0]));
  }

  return fragment;
}

});
require.register("via/index.js", function(exports, require, module){
module.exports = require('./lib/via');

});
require.register("via/lib/via.js", function(exports, require, module){
var Via = module.exports = {};
Via.utils = require('./utils');
Via.Object = require('./object');
Via.Array = require('./array');
Via.URI = require('./uri');
Via.Resource = require('./resource');
Via.Window = require('./window');
Via.Element = require('./element');

if(typeof window !== 'undefined') {
  Via.window = new Via.Window(window);
}

});
require.register("via/lib/utils.js", function(exports, require, module){
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

utils.domify = require('domify');

// TODO: Replace all uses with ReactiveURI
utils.urlParams = function(params) {
  var str = [];
  for(var p in params) {
    if(params[p] !== undefined) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
    }
  }
  return str.join("&");
}

});
require.register("via/lib/events.js", function(exports, require, module){
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
require.register("via/lib/object.js", function(exports, require, module){
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

    if(typeof k === 'undefined') return;

    function setAttr(target,k,newV) {
      // if(typeof newV === 'string') {
      //   newV = target.substituteString(newV);
      // }

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
      k = ''+k;
      var split = k.split(' ');

      if(split.length === 1) {
        setAttr(this, k, v);
      }
      else {
        for(var i=0; i < split.length; ++i) {
          setAttr(this, split[i], v[i]);
        }
      }
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
     if(result !== undefined) {
       callback.call(this, result);
     }
     else {
       this.watch(keypath, function() {
         var got = callback.apply(this.root, arguments);
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

    // this.load && this.load();

    // If only a function, we monitor any direct change
    // to the object attributes via the "changed" event
    if(arguments.length === 1 && typeof attr === 'function') {
      fn = attr;
      attr = '*';
    }

    if(attr === '*') {
      var event = this.on('changed', fn);
      fn.call(this); // Initial update
      // this.load && this.load();
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
      // this.load && this.load();

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
        optional.push('root.'+attr);
      }

      return 'root.'+attr;
    });

    // Updater function we call when any invalidation occurs
    // Builds a list of arguments from the input attrs,
    // and envokes the callback with those values.
    function update(preV) {
      if(stopping) return;

      if(fn.norecurse) {
        // console.log('stopped recursion');
        // return;
      }

      var allDefined = true;
      var args = utils.map(multi, function(attr) {
        var val;
        if(attr.slice(-1) === '!') {
          val = attr.slice(0,-1);
        }
        else {
          val = container.get(attr);
        }
        if(val === undefined && utils.inArray(attr,optional) === -1) {
          allDefined = false;
        }
        return val;
      });

      if(!allDefined)
        return;

      args = args.concat(
        Array.prototype.slice.call(arguments,0)
      );

      fn.norecurse = true;
      fn.apply(container, args);
      fn.norecurse = false;
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

        // if(deepObj && deepObj.load) {
        //   deepObj.load();
        // }

        function updateAttr(newV,preV) {
          if(newV !== preV) {
            utils.traverse(newV, remainingPath, function(deepObj, deepAttr,
                                             nearestEmitter, shortestPath) {
              if(nearestEmitter) {
                nearestEmitter.on('set:'+shortestPath, updateAttr);
              }

              // if(deepObj && deepObj.load) {
              //   deepObj.load();
              // }
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
        fn.call(this, done);

      }
    , waiting: null
    , result: null
    , done: done
    };

    function done(result) {
      if(obj.waiting) {
        obj.waiting(result);
        return;
      }

      obj.result = result;
    }


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

      var isReversible = typeof input === 'string' &&
                       input.indexOf('{') === -1;

      if(isReversible)
        revFn = straight;
    }

    var self = this;
    self.watch(input, function() {
      var result = fwdFn.apply(self, arguments);

      // if(result && result.then) {
      //   result.then(function(result) {
      //     self.set(output, result);
      //   });
      // }
      // else {
      self.set(output, result);
      // }
    });

    if(revFn) {
      this.synth(input, output, revFn);
    }

    return this;
  }
, filter: function(extra) {
    var copy = new this.constructor();
    copy.set(this);

    if(arguments.length > 0) {
      copy.set.apply(copy, arguments);
    }

    return copy;
  }
, substituteString: function(str) {
    var self = this;
    return str.replace(/\{.+?\}/g, function(m) {
      return self.get(m);
    });
  }
};

/**
 * Make an event emmitters
 */
Events.mixin(ReactiveObject);

});
require.register("via/lib/array.js", function(exports, require, module){
module.exports = ReactiveArray;

var ReactiveObject = require('./object')
,   utils = require('./utils');

function ReactiveArray(obj) {
  this.set(obj);

  this.synth('length', /\n+/, function(i) {
    return Math.max(this.root.length, i);
  });

  this.watch('length', function(newv,prev) {
    for(var i=newv, l=prev; i < l; ++i) {
      this.root.set(i, undefined);
    }
  });
}

ReactiveArray.prototype = new ReactiveObject({
  slice: function(start,end) {
    var result = new ReactiveArray();
    this.watch(/\n+/, function(i,v) {
      result.set(i,v);
    });
    return result;
  }
});

});
require.register("via/lib/resource.js", function(exports, require, module){
module.exports = ReactiveResource;

var ReactiveObject = require('./object')
  , ReactiveURI = require('./uri')
  , utils = require('./utils');


function ReactiveResource(init) {
  this.set(init);
  this.location = new ReactiveURI(this.location);
  this.synth('url', 'location.href');

  // this.watch('autoload url', function(autoload, url) {
  //   if(autoload) this.root.reload();
  // });

  this.watch('autosave data', function(autosave, data) {
    if(autosave) this.root.save();
  });

  this.synth('id', 'location.file');
}

ReactiveResource.prototype = new ReactiveObject({
  save: function(callback) {
    this.set('invalid', true);

    if(this.url) {
      var body = this.format.stringify(res);
      this.request('put', body, function(err, res) {
        this.set('response', this.format.parse(res));
      });
    }
    else if(this.parent) {
      var body = this.format.stringify(res);
      this.request('post', body, function(err, res) {
        this.set('response', this.format.parse(res));
      });
    }

  }
, load: function(callback) {
    if(this.__loaded__) return;
    this.__loaded__ = true;

    var self = this;
    this.watch('url', function(url) {
      self.request('get', url, null, function(err, res) {
        self.set('response', res);
        callback && callback(err, res);
      });
    });
  }
, reload: function() {
    this.set('outdated', true);
  }
, request: function(method, url, data, callback) {
    // var request = require('request');
    // api.request(method, url, data, callback);
  }
, format: JSON
});

});
require.register("via/lib/uri.js", function(exports, require, module){
module.exports = ReactiveURI;

var ReactiveObject = require('./object'),
    utils = require('./utils');

// RFC 3986 Appendix B
var regex = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");
//     scheme    = $2
//     authority = $4
//     path      = $5
//     query     = $7
//     fragment  = $9

function ReactiveURI(init) {
  if(typeof init === "string") init = {href: init};

  this.set(init);

  this.synth('href', 'scheme authority path query? fragment?',
  function(scheme, authority, path, query, fragment) {
    // RFC 3986 Section 5.3
    var result = '';

    if(scheme)
      result += scheme + ':';
    if(authority)
      result += '//' + authority;
    result += path;
    if(query)
      result += '?' + query;
    if(fragment)
      result += '#' + fragment;

    return result;
  });

  this.synth('scheme authority path query fragment', 'href',
  function(href) {
    var m = regex.exec(href);
    return [m[2], m[4], m[5], m[7], m[9]];
  });

  this.synth('path', 'dir file ext?', function(dir, file, ext) {
    return [dir, file].join('') + (ext ? '.' + ext : '');
  });

  this.synth('dir file ext', 'path', function(path) {
    var parts = path.split('/');
    var file = parts[parts.length-1];
    if(file) {
      parts.pop();
      parts.push('');
      return [parts.join('/')].push( file.split('.').slice(-1) );
    }

    return [parts.join('/')];
  });

  this.synth('authority', 'credentials host', function(c,h) {
    c = c && (c + '@') || '';
    return c + h;
  });

  this.synth('credentials host', 'authority', function(auth) {
    var match = auth.match(/(?:(.+?)@)?(.*)/);
    return match && match.slice(1);
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

ReactiveURI.prototype = new ReactiveObject({
  rel: function(path) {
    var result = new ReactiveURI({source:this});
    this.watch('href', function(href) {
      result.set('href', href);
    });
    result.synth('path', 'source.path', function(base) {
      return absolute(base, path);
    });
    return result;
  }
});

function absolute(base, relative) {
  var stack = base.split("/"),
      parts = relative.split("/");
  stack.pop(); // remove current file name (or empty string)
               // (omit if "base" is the current folder without trailing slash)
  for (var i=0; i<parts.length; i++) {
      if (parts[i] == ".")
          continue;
      if (parts[i] == "..")
          stack.pop();
      else
          stack.push(parts[i]);
  }
  return stack.join("/");
}

});
require.register("via/lib/window.js", function(exports, require, module){
var ReactiveObject = require('./object'),
    ReactiveURI = require('./uri');

module.exports = ReactiveWindow;

function ReactiveWindow(window) {
  this.actual = window;
  this.location = new ReactiveURI({href:window.location.href});

  var self = this;
  var pushState = new ReactiveURI(window.location);
  var popping = false;
  window.addEventListener('popstate', function() {
    popping = true;
    self.location.set('href', window.location.href);
    popping = false;
  });

  pushState.watch('pathname search',
            function(path,search) {
    if(!popping) {
      window.history.pushState(null, null, path+search);
    }
  });

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
require.register("via/lib/element.js", function(exports, require, module){
module.exports = ReactiveElement;

var ReactiveObject = require('./object')
  , Via = require('./via')
  , utils = require('./utils')
  , globalElements = require('./elements')
  , globalAttributes = require('./attributes');

/**
 * Represents a single UI instance for a model's ever changing data.
 */
function ReactiveElement(data, options) {
  options = options || {};

  var parent = options.parent || this;
  var document = options.document || window.document;

  this.data = new ReactiveObject({
    ui: this
  , url: Via.window.location
  });

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
  this.rootElement = utils.domify(this.template);

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

      // if(k === 'array') { debugger; }
      // Default any undefined values to the literal attribute value
      if(!this.data[k]) {
        this.data.set(k,v);
      }
    }


    if(this.rootElement.children.length) {
      this.template = this.rootElement.innerHTML;
    }
    else if(implFn.template) {
      this.template = implFn.template;
    }

    this.rootElement = utils.domify(this.template);

    var result = implFn.call(this,
                    this, elemattrs, this.template);

    if(typeof result === 'string') {
      this.rootElement = utils.domify(result);
    }
    else if(result && result.nodeName) {
      this.rootElement = result;
    }
  }

  this.rootElement._viaElement = this;

  this.build();
  return this;
};

ReactiveElement.find = function(domElement) {
  return domElement && domElement._viaElement;
};

ReactiveElement.prototype = new ReactiveObject({
   build: function(options) {
    var self = this;
    
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
    var matchedTplAttrs = this.rootElement.outerHTML;
    matchedTplAttrs = matchedTplAttrs && matchedTplAttrs.match(/data-(\w+)[^\w]/gi) || [];
    matchedTplAttrs = utils.map(matchedTplAttrs, function(match) {
      return match.match(/-(\w+)/)[1]; } );
    utils.each(matchedTplAttrs, function(i,attrName) {
      if(!self.attributes[attrName]) {
        self.attributes[attrName] = function(ui, keypath) {
          var self = this;
          ui.data.watch(keypath, function(value) {
            self.setAttribute(attrName, value);
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
          var value = this.getAttribute('data-'+attrName);
          var template = this.innerHTML;
          self.attributes[attrName].call(this, self, value, template);
          this.removeAttribute('data-'+attrName);
        }

        if(this.rootElement.getAttribute('data-'+attrName)) {
          buildAttr.call(this.rootElement);
        }

        var found = this.rootElement.querySelectorAll('[data-'+attrName+']');
        for(var i2=0, l2 = found.length; i2 < l2; ++i2) {
          buildAttr.call(found[i2]);
        }
      }
    }
 }
 , elements: new ReactiveObject(globalElements)
 , attributes: new ReactiveObject(globalAttributes)
});

});
require.register("via/lib/elements/index.js", function(exports, require, module){
module.exports = {
  page: require('./page')
, page_links: require('./page_links')
}

});
require.register("via/lib/elements/page.js", function(exports, require, module){
module.exports = function page() {

  this.data.synth('page', 'src');
  this.data.synth('page.size', 'size');
  this.data.synth('page.number', 'number');
  this.data.set('page.number', this.data.page.number || 1);

  this.data.synth('page.length', 'page.number page.size page.total',
                  function(n,s,t) {
    if(n * s >= t) {
      return t - n * s;
    }
    return s;
  });

  this.data.synth('info', 'page.total page.size page.number',
                function(total, size, n) {
    if(total <= size)
      return 'Showing ' + total + ' of ' + total;

    var a = (n-1)*size+1;
    var b = Math.min(n*size, total);

    return 'Showing ' + a + '-' + b + ' of ' + total;
  });
};


});
require.register("via/lib/elements/page_links.js", function(exports, require, module){
module.exports = function(ui,attrs) {

  // TODO: Should this be a generic thing?
  // Maybe this elem exists outside of page,
  // but nesting only makes "page" default to parent
  ui.data.synth('page', attrs.page || 'parent.page');

  ui.rootElement.addEventListener('click', function(event) {
    ui.data.set('page.number', event.target.getAttribute('data-page'));
    ui.data.set('selected', event.target);
  });

  ui.data.synth('links', 'page.total page.size page.number', function(total, size, n) {
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
require.register("via/lib/attributes/index.js", function(exports, require, module){
var index = [
  'list'
, 'text'
, 'html'
, 'require'
, 'class'
, 'val'
, 'toggle'
, 'select'
, 'onclick'
];

for(var i=0,l=index.length; i < l; ++i) {
  module.exports[index[i]] = require('./data-'+index[i]);
}

});
require.register("via/lib/attributes/data-class.js", function(exports, require, module){
/**
 * Bind a class name to a synthetic attribute 
 */
module.exports = function(ui,value) {
  var elem = this;

  var staticClass = elem.className;
  ui.data.watch(value, function(newV,preV) {
    var newClass = newV;

    var endOfPath = value.split('.').slice(-1)[0];
    if(newV === true) { newClass = endOfPath; }
    if(!newV) { newClass = '';}

    elem.className = [staticClass,newClass].join(' ').trim();
  });
};

});
require.register("via/lib/attributes/data-text.js", function(exports, require, module){
/**
 * Bind the innerText of a single element to a synthetic attribute
 */
module.exports = function(ui,value) {
  var elem = this;

  elem.addEventListener('click', function() {
    console.log(ui);
  });

  ui.data.watch(value, function(v,p) {
    if(v === null) v = '';
    elem.innerText = ''+v;
    elem.innerHTML = elem.innerHTML.replace(/\n/g,'<br/>');
  });
};



});
require.register("via/lib/attributes/data-html.js", function(exports, require, module){
/**
 * Bind the innerHTML of an element to a synthetic attribute
 */
module.exports = function(ui,attr) {
  var elem = this;

  ui.data.watch(attr, function(value) {
    if(value.then) {
      value.then(function(html) {
        elem.innerHTML = html;
      });
    }
    else {
      elem.innerHTML = value;
    }

  });
};



});
require.register("via/lib/attributes/data-list.js", function(exports, require, module){
var ReactiveElement = require('../element')
  , utils = require('../utils');

/**
 * Bind a collection to a repeating block scoped per item
 */
module.exports = function(ui,value,template) {
  var target = this;
  target.innerHTML = '';

  ui.data.watch(value, function(collection) {
    if(!collection) return;

    // Remove any element beyond the collection length
    collection.watch('length',function(length) {
      for(var i=length, l = target.children.length-1; l >= i; --l) { 
        target.removeChild(target.children[l]);
      }
    });

    // Update or append as any numeric index changes
    collection.watch(/\d+/,function(i,item,prev) {
      if(item === undefined) return;

      var oldElem = target.children[i];

      if(item) {
        var itemui = new ReactiveElement(item, template);
        itemui.data.set('parent', ui.data);

        if(oldElem) {
          target.insertBefore(itemui.rootElement, oldElem);
          target.removeChild(oldElem);
        }
        else {
          target.appendChild(itemui.rootElement);
        }
      }
    });

  })
};



});
require.register("via/lib/attributes/data-require.js", function(exports, require, module){
module.exports = function(ui,attr) {
  var elem = this;
  var empty = this.querySelector('empty');

  if(empty) {
    empty.parentNode.removeChild(empty);
  }

  ui.data.watch(attr+'._http_status', function(status,prev) {
    if(status == 404) {
      elem.parentNode.insertBefore(empty, elem);
      elem.parentNode.removeChild(elem);
    }
    else if(prev == 404) {
      empty.parentNode.insertBefore(elem, empty);
      empty.parentNode.removeChild(empty);
    }
  });
};


});
require.register("via/lib/attributes/data-val.js", function(exports, require, module){
/**
 * Bind an input val to a synthetic attribute 
 */
module.exports = function(ui,value) {
  var elem = this;

  ui.data.watch(value, function(v) {
    $elem.val(v);
  });

  $elem.change(function() {
    console.log(ui, value, $elem.val());
    ui.data.set(value, $elem.val());
  });
};

});
require.register("via/lib/attributes/data-toggle.js", function(exports, require, module){
/**
 * Make the element toggle a property when clicked.
 */
module.exports = function(ui,attr) {
  this.addEventListener('click', function() {
    var cur = ui.data.get(attr);
    ui.data.set(attr, !cur);
  });
};


});
require.register("via/lib/attributes/data-select.js", function(exports, require, module){
var ReactiveElement = require('../element');


/**
 * Bind a property to selection which can be set by clicking
 * other [data-select="invoice"]
 * TODO: Use delegation on the element associated
 *       with the data that actually changes.
 *       The path tells us the delegation root!
 */

module.exports = function(ui,attr) {

  ui.data.watch('parent.selection', function(newV, preV) {

    if( same(ui.data.get(attr), newV) ) {
      ui.data.set('selected', true);
    }
    else {
      ui.data.set('selected', false);
    }
  });

  this.addEventListener('click', function(event) {
    ui.data.set('parent.selection', ui.data.get(attr));
  });
}

function same(a,b) {
  if(a === b) return true;

  if(a && typeof a.compare === 'function') {
    return a.compare(b);
  }

  return false;
}

});
require.register("via/lib/attributes/data-onclick.js", function(exports, require, module){
module.exports = function(ui,attr) {
  
  this.addEventListener('click', function(e) {
    var fn = ui.data.get(attr);

    console.log(fn,attr);

    if(typeof fn === 'function') {
      fn();
    }
    else {
      // error?
    }
  });
};

});
require.alias("component-domify/index.js", "via/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");
if (typeof exports == "object") {
  module.exports = require("via");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("via"); });
} else {
  this["Via"] = require("via");
}})();