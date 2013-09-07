module.exports = ReactiveArray;

var ReactiveObject = require('./object')
,   utils = require('./utils');

function ReactiveArray(obj) {
  this.set(obj);

  this.set('length', this.length || 0);

  this.synth('length', /\d+/, function(i) {
    return Math.max(this.length||0, Number(i)+1);
  });

  this.watch('length', function(newv,prev) {
    for(var i=newv, l=prev; i < l; ++i) {
      this.root.set(i, undefined);
    }
  });
}

ReactiveArray.prototype = new ReactiveObject({
  slice: function(begin,end) {
    var result = new ReactiveArray({
      begin: begin
    , end: end
    , source: this
    });

    result.watch('source begin end', function(source, begin, end) {
      result.set( Array.prototype.slice.call(source,begin,end) );
    });

    // this.watch(/\d+/, function(i,v) {
    //   if(i >= begin && i < end) {
    //     result.set(i,v);
    //   }
    //   else {
    //     result.set(i,undefined);
    //   }
    // });

    // result.watch(end, function(end) {
    // });

    return result;
  }

, forEach: function() {
  }
});
