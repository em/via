describe('<page>', function() {
  var cats = new Via.Collection(Cat, 'cats/', {}, catsAPI);
  var template = '<page collection="cats" size=1><div><page_links></page_links></div></page>';
  var data = {parent:{cats:cats}};
  var ui = new Via.Element(data, template);

  it('synthesizes page from collection', function() {
    expect(ui.data.get('page.collection')).eq(cats);
  });

  context('[size=1]', function() {
    context('page 1 of 3', function() {
      var ui = new Via.Element(data, template);

      it('has correct info', function() {
        expect(ui.data.get('info')).eq('Showing 1-1 of 3');
      });

      it('has correct links', function() {
        var linksui = $(ui.rootElement).find('.page_links').data('recurly_ui');
        var html = '<span class="previous_page disabled">Prev</span><em class="current">1</em><a data-page="2">2</a><a data-page="3">3</a><a class="link" data-page="2">Next</a>';
        expect(linksui.data.get('links')).eq(html);
      });
    });

    context('page 2 of 3', function() {
      var ui = new Via.Element(data, template);
      ui.data.set('page.number',2)

      it('has correct info', function() {
        expect(ui.data.get('info')).eq('Showing 2-2 of 3');
      });

      it('has correct links', function() {
        var linksui = $(ui.rootElement).find('.page_links').data('recurly_ui');
        var html = '<a class="link" data-page="1">Prev</a><a data-page="1">1</a><em class="current">2</em><a data-page="3">3</a><a class="link" data-page="3">Next</a>';
        expect(linksui.data.get('links')).eq(html);
      });
    });

    context('page 3 of 3', function() {
      var ui = new Via.Element(data, template);
      ui.data.set('page.number',3)

      it('has correct info', function() {
        expect(ui.data.get('info')).eq('Showing 3-3 of 3');
      });

      it('has correct links', function() {
        var linksui = $(ui.rootElement).find('.page_links').data('recurly_ui');
        var html = '<a class="link" data-page="2">Prev</a><a data-page="1">1</a><a data-page="2">2</a><em class="current">3</em><span class="next_page disabled">Next</span>';
        expect(linksui.data.get('links')).eq(html);
      });
    });
  });

  context('[size=2]', function() {
    var template = '<page collection="cats" size=2><div><page_links></page_links></div></page>';
    context('page 1 of 2', function() {
      var ui = new Via.Element(data, template);

      it('has correct info', function() {
        expect(ui.data.get('info')).eq('Showing 1-2 of 3');
      });

      it('has correct links', function() {
        var linksui = $(ui.rootElement).find('.page_links').data('recurly_ui');
        var html = '<span class="previous_page disabled">Prev</span><em class="current">1</em><a data-page="2">2</a><a class="link" data-page="2">Next</a>';
        expect(linksui.data.get('links')).eq(html);
      });
    });

    context('page 2 of 2', function() {
      var ui = new Via.Element(data, template);
      ui.data.set('page.number', 2)

      it('has correct info', function() {
        expect(ui.data.get('info')).eq('Showing 3-3 of 3');
      });

      it('has correct links', function() {
        var linksui = $(ui.rootElement).find('.page_links').data('recurly_ui');
        var html = '<a class="link" data-page="1">Prev</a><a data-page="1">1</a><em class="current">2</em><span class="next_page disabled">Next</span>';
        expect(linksui.data.get('links')).eq(html);
      });
    });
  });

  context('[size=3]', function() {
    var template = '<page collection="cats" size=3><div><page_links></page_links></div></page>';
    var ui = new Via.Element(data, template);

    it('has correct info', function() {
      expect(ui.data.get('info')).eq('Showing 3 of 3');
    });

    it('has correct links', function() {
      var linksui = $(ui.rootElement).find('.page_links').data('recurly_ui');
      var html = '';
      expect(linksui.data.get('links')).eq(html);
    });
  });

  context('[size=1000]', function() {
    var template = '<page collection="cats" size=3><div><page_links></page_links></div></page>';
    var ui = new Via.Element(data, template);

    it('has correct info', function() {
      expect(ui.data.get('info')).eq('Showing 3 of 3');
    });

    it('has correct links', function() {
      var linksui = $(ui.rootElement).find('.page_links').data('recurly_ui');
      var html = '';
      expect(linksui.data.get('links')).eq(html);
    });
  });

  describe('<page_links>', function() {
    var linksui = $(ui.rootElement).find('.page_links').data('recurly_ui');
  });
});
