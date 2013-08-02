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
