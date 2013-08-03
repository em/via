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
