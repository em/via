module.exports = function(ui,attrs) {

  // TODO: Should this be a generic thing?
  // Maybe this elem exists outside of page,
  // but nesting only makes "page" default to parent
  ui.data.synth('page', attrs.page || 'parent.page');

  ui.rootElement.addEventListener('click', function(event) {
    ui.data.set('page.number', event.target.getAttribute('data-page'));
    ui.data.set('selected', event.target);
  });

  ui.data.synth('links', 'page.total page.size page.number', function(total, size, n) {
    if(total <= size) return '';

    n = parseInt(n);

    var result = '';
    var l = Math.ceil(total/size);
    var max = 5;
    var start = Math.max(1, n - max);
    var end = Math.min(start+l, start+max);
    var hops = {};

    if(start > 1) {
      hops[1] = start+1;
    }

    if(end < l) {
      hops[end] = l-1;
    }

    if(l > 1) {
      for(var i = 1; i <= l; ++i) {
        if(i === n) {
          result += '<em class="current">'+i+'</em>';
        }
        else {
          result += '<a data-page="'+i+'">'+i+'</a>';
        }

        if(hops[i]) {
          result += '<span>&hellip;</span>'
          i = hops[i];
        }
      }
    }

    if(n !== 1) {
      result = '<a class="link" data-page="'+(n-1)+'">Prev</a>' + result;
    }
    else {
      result = '<span class="previous_page disabled">Prev</span>' + result;
    }

    if(n < l) {
      var i = n+1;
      result += '<a class="link" data-page="'+i+'">Next</a>';
    }
    else {
      result += '<span class="next_page disabled">Next</span>';
    }

    return result;
  });
};

module.exports.template = '<div class="page_links"><span data-html="links" class="links"></span></div>';
