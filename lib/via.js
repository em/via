var Via = module.exports = {};
Via.utils = require('./utils');
Via.Object = require('./object');
Via.URI = require('./uri');
Via.Window = require('./window');
Via.Element = require('./element');
Via.API = require('./api');
Via.Model = require('./model');
Via.Collection = require('./collection');
Via.CollectionPage = require('./collection_page');

if(typeof window !== 'undefined') {
  Via.window = new Via.Window(window);
}
