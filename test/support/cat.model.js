if(typeof window === 'undefined') {
  module.exports = Cat;
  var Via = require('../../lib/via');
}

var Model = Via.Model;

// Make our cat model
function Cat() {
  Model.apply(this,arguments);
  this._parent = {
    getUri: function() {
      return 'cats/';
    }
  }; 
}

Cat.key = 'cat';
Model.mixin(Cat,{
  getUri: function() {
    return this.id && 'cats/'+this.id;
  }
});

