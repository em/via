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