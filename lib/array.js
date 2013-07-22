module.exports = ReactiveObject;

var ReactiveObject = require('./object')
,   utils = require('./utils');

function ReactiveArray(obj) {
  this.set(obj);
}
