var ReactiveObject = require('./object'),
    ReactiveURI = require('./uri');

module.exports = ReactiveWindow;

function ReactiveWindow(window) {
  this.actual = window;
  this.location = new ReactiveURI({href:window.location.href});

  var self = this;
  var pushState = new ReactiveURI(window.location);
  var popping = false;
  window.addEventListener('popstate', function() {
    popping = true;
    self.location.set('href', window.location.href);
    popping = false;
  });

  pushState.watch('pathname search',
            function(path,search) {
    if(!popping) {
      window.history.pushState(null, null, path+search);
    }
  });

  var defaultParams = {};
  this.watch('location.params', function(params) {
    var uniqueParams = {};

    for(var k in params) {
      defaultParams[k] = defaultParams[k] || params[k];

      if(defaultParams[k] != params[k]) {
        uniqueParams[k] = params[k];
      }
    }

    pushState.set('params', uniqueParams);
  });
}

ReactiveWindow.prototype = new ReactiveObject();
