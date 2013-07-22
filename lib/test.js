(function(){var global = this;function debug(){return debug};function require(p, parent){ var path = require.resolve(p) , mod = require.modules[path]; if (!mod) throw new Error('failed to require "' + p + '" from ' + parent); if (!mod.exports) { mod.exports = {}; mod.call(mod.exports, mod, mod.exports, require.relative(path), global); } return mod.exports;}require.modules = {};require.resolve = function(path){ var orig = path , reg = path + '.js' , index = path + '/index.js'; return require.modules[reg] && reg || require.modules[index] && index || orig;};require.register = function(path, fn){ require.modules[path] = fn;};require.relative = function(parent) { return function(p){ if ('debug' == p) return debug; if ('.' != p.charAt(0)) return require(p); var path = parent.split('/') , segs = p.split('/'); path.pop(); for (var i = 0; i < segs.length; i++) { var seg = segs[i]; if ('..' == seg) path.pop(); else if ('.' != seg) path.push(seg); } return require(path.join('/'), parent); };};require.register("events.js", function(module, exports, require, global){
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
    var i = _inArray(fct, this._events[event]);
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

});require.register("object.js", function(module, exports, require, global){
var Events = require('./events')
,   utils = require('./utils');

module.exports = ViaObject;

/**
 * Common model constructor
 * This gets called directly by more specific models
 */
function ViaObject(obj) {
  this.set(obj);
  this._events = {};
}; 

ViaObject.prototype = {
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

      Via.traverse(target, k, function(deepObj, deepAttr,
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

   var result = Via.traverse(this, keypath, function(obj,key,
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
      interpolated = _map(interpolated, function(a) {
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
    var container = new ViaObject({
      root: self
    });

    var stopping = false;
    container.stop = function() {
      stopping = true;
      this.set('root', null);
      stopping = false;
    }

    // Prefix the attributes with root
    multi = _map(multi, function(a) {
      return 'root.'+a;
    });

    // Updater function we call when any invalidation occurs
    // Builds a list of arguments from the input attrs,
    // and envokes the callback with those values.
    function update(preV) {
      if(stopping) return;

      var args = _map(multi, function(attr) {
        return container.get(attr);
      });

      args = args.concat(
        Array.prototype.slice.call(arguments,0)
      );

      fn.apply(container, args);
    }

    _each(multi, function(i,attr) {
      Via.traverse(container, attr, function(deepObj, deepAttr,
                  nearestEmitter, shortestPath, remainingPath) {

        if(nearestEmitter) {
          nearestEmitter.on('set:'+shortestPath, updateAttr);
        }

        if(deepObj && deepObj.load) {
          deepObj.load();
        }

        function updateAttr(newV,preV) {
          if(newV !== preV) {
            Via.traverse(newV, remainingPath, function(deepObj, deepAttr,
                                             nearestEmitter, shortestPath) {
              if(nearestEmitter) {
                nearestEmitter.on('set:'+shortestPath, updateAttr);
              }

              if(deepObj && deepObj.load) {
                deepObj.load();
              }
            });

            Via.traverse(preV, remainingPath, function(deepObj, deepAttr,
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
Events.mixin(ViaObject);

});require.register("via.js", function(module, exports, require, global){
var Via = module.exports = {};

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
Via.traverse = function(obj, keypath, fn) {
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

Via.Object = require('./object');
Via.Window = require('./window');

});require.register("window.js", function(module, exports, require, global){
var ViaObject = require('./object');

module.exports = Window;

function ViaWindow(window) {
  this.window = window;

}

ViaWindow.prototype = new ViaObject();

// Hook into the global window
// for interacting with the browser
if(typeof window != undefined) {
  Via.window = new ViaWindow();
}

});var exp = require('via.js');if ("undefined" != typeof module) module.exports = exp;else Via = exp;
})();
