STYLUS = ./node_modules/stylus/bin/stylus -u nib
JS_SOURCES = *.js lib/*.js lib/elements/*.js lib/attributes/*.js
HTML_SOURCES = lib/elements/templates/*.html
COMPONENT_SOURCES = component.json $(JS_SOURCES) 

all: node_modules build/via.js

build/via.js: $(COMPONENT_SOURCES)
	mkdir -p build
	component build -s Via -o build -n via

test-client:
	@node_modules/.bin/mocha test -R list

test-browser: build/via.js
	@node_modules/.bin/mocha-phantomjs -R list test/browser/index.html

test: test-client test-browser

clean:
	rm -fr build components template.js

.PHONY: clean test test-browser test-client
