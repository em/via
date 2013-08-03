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
