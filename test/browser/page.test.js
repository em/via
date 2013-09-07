describe('<page>', function() {
  var template = '<page><div><page_links></page_links></div></page>';

  var data, ui; 

  beforeEach(function() {
    // FIXME: page has to be a Via.Object for links and info to be bound
    // It's counter-intuitive, with many possible solutions
    data = {page: new Via.Object({
      total: 3
    })};

    ui = new Via.Element(data, template);
  });

  context('[size=1]', function() {
    beforeEach(function() {
      ui.data.set('page.size', 1)
    });

    context('page 1 of 3', function() {
      beforeEach(function() {
        ui.data.set('page.number', 1)
      });

      it('has correct info', function() {
        expect(ui.data.get('info')).eq('Showing 1-1 of 3');
      });

      it('has correct links', function() {
        var linksui =  $(ui.rootElement).find('.page_links')[0]._viaElement;
        var html = '<span class="previous_page disabled">Prev</span><em class="current">1</em><a data-page="2">2</a><a data-page="3">3</a><a class="link" data-page="2">Next</a>';
        expect(linksui.data.get('links')).eq(html);
      });
    });

    context('page 2 of 3', function() {
      beforeEach(function() {
        ui.data.set('page.number', 2)
      });

      it('has correct info', function() {
        expect(ui.data.get('info')).eq('Showing 2-2 of 3');
      });

      it('has correct links', function() {
        var linksui =  $(ui.rootElement).find('.page_links')[0]._viaElement;
        var html = '<a class="link" data-page="1">Prev</a><a data-page="1">1</a><em class="current">2</em><a data-page="3">3</a><a class="link" data-page="3">Next</a>';
        expect(linksui.data.get('links')).eq(html);
      });
    });

    context('page 3 of 3', function() {
      beforeEach(function() {
        ui.data.set('page.number', 3)
      });

      it('has correct info', function() {
        expect(ui.data.get('info')).eq('Showing 3-3 of 3');
      });

      it('has correct links', function() {
        var linksui =  $(ui.rootElement).find('.page_links')[0]._viaElement;
        var html = '<a class="link" data-page="2">Prev</a><a data-page="1">1</a><a data-page="2">2</a><em class="current">3</em><span class="next_page disabled">Next</span>';
        expect(linksui.data.get('links')).eq(html);
      });
    });
  });

  context('[size=2]', function() {
    beforeEach(function() {
      ui.data.set('page.size', 2)
    });

    context('page 1 of 2', function() {
      beforeEach(function() {
        ui.data.set('page.number', 1)
      });

      it('has correct info', function() {
        expect(ui.data.get('info')).eq('Showing 1-2 of 3');
      });

      it('has correct links', function() {
        var linksui =  $(ui.rootElement).find('.page_links')[0]._viaElement;
        var html = '<span class="previous_page disabled">Prev</span><em class="current">1</em><a data-page="2">2</a><a class="link" data-page="2">Next</a>';
        expect(linksui.data.get('links')).eq(html);
      });
    });

    context('page 2 of 2', function() {
      beforeEach(function() {
        ui.data.set('page.number', 2)
      });

      it('has correct info', function() {
        expect(ui.data.get('info')).eq('Showing 3-3 of 3');
      });

      it('has correct links', function() {
        var linksui =  $(ui.rootElement).find('.page_links')[0]._viaElement;
        var html = '<a class="link" data-page="1">Prev</a><a data-page="1">1</a><em class="current">2</em><span class="next_page disabled">Next</span>';
        expect(linksui.data.get('links')).eq(html);
      });
    });
  });

  context('[size=3]', function() {
    beforeEach(function() {
      ui.data.set('page.size', 3)
    });

    it('has correct info', function() {
      expect(ui.data.get('info')).eq('Showing 3 of 3');
    });

    it('has correct links', function() {
      var linksui =  $(ui.rootElement).find('.page_links')[0]._viaElement;
      var html = '';
      expect(linksui.data.get('links')).eq(html);
    });
  });

  context('[size=1000]', function() {
    var template = '<page><div><page_links></page_links></div></page>';
    beforeEach(function() {
      ui.data.set('page.size', 1000)
    });

    it('has correct info', function() {
      expect(ui.data.get('info')).eq('Showing 3 of 3');
    });

    it('has correct links', function() {
      var linksui =  $(ui.rootElement).find('.page_links')[0]._viaElement;
      var html = '';
      expect(linksui.data.get('links')).eq(html);
    });
  });
});
