var Via = module.exports = {};
Via.utils = require('./utils');
Via.Object = require('./object');
Via.Array = require('./array');
Via.URI = require('./uri');
Via.Resource = require('./resource');
Via.Window = require('./window');
Via.Element = require('./element');

if(typeof window !== 'undefined') {
  Via.window = new Via.Window(window);
}
