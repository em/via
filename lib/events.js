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
