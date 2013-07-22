if(typeof module !== 'undefined') {
  FakeAPI = require('./fake.api');
}

catsAPI = new FakeAPI({
  // Model stuff
  'GET cats/1.json': {
    cat: {id:1, name:'Fluffy'}
  },
  'PUT cats/1.json': function(data) {
    data.cat.was = "updated";
    return data;
  },
  'GET cats/2.json': {
    cat: {id:2, name: 'Scratch'}
  },

  // Collection stuff
  'GET cats/': function(params) {
    var cursor = params.cursor || 0;
    params.per_page = parseInt(params.per_page)
    if(params.page && params.per_page) {
      cursor = (params.page-1) * params.per_page;
    }

    var response = {
      cats: [
        {id:1, name: 'Fluffy'},
        {id:2, name: 'Scratch'},
        {id:3, name: 'Leonard'}
      ].slice(cursor,cursor+params.per_page),
      meta: {
        status: 200
      , count: 3
      }
    };

    return response;
  },
  'POST cats/': function() {
    return {cat: {id: 2, was:'created'}}
  },

});

if(typeof module !== 'undefined') {
  module.exports = catsAPI;
}
