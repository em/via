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
