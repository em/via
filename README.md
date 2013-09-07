
# Via

  RFP library for node and browser

## Watch
  watch() monitors a set of input property names on a Via.Object
  and calls a function when all the inputs are defined, and thereafter
  whenever a property changes.
  ```
    var Via = require('via');
    var obj = new Via.Object();

    obj.watch('a', function() {
      console.log(arguments);
    });

    obj.set('a', 123);
    // [root.a]
  ```

## Synthesis
  synth() uses watch() to monitor for changes on
  any number of inputs and, through a function,
  update an attribute every time the input changes.

  ```
  // a = b*2
  obj.synth('a', 'b', function(b) {
    return b*2;
  });

  obj.set('b', 10); // a == 20
  ```
  
  Or a real world example of Ohm's law:
  ```
  function Conductor(init) {
    this.set(init);

    this.synth('voltage', 'current resistance', function(i,r) {
      return i*r;
    });

    this.synth('current', 'voltage resistance', function(v,r) {
      return v/r;
    });

    this.synth('resistance', 'voltage current', function(v,i) {
      return v/i; 
    });
  }
  Conductor.prototype = new Via.Object();
  var conductor = new Conductor({
    voltage: 3.7
  , resistance: 1.8
  });

  // circuit.current
  // > 2.055555555555556

  ```

  This also provides us with a means of separating concerns, where
  independent parts of code can manipulate each other's
  data through a common interface.

  e.g. We can independently model a resistor:

  ```
  function Resistor(init) {
    this.set(init);

    this.synth('color_bands', 'resistance', function(i) {
       // ...
    });

    this.synth('resistance', 'color_bands', function(i) {
       // ...
    });

    this.synth('heat', 'current resistance', function(i,r) {
      return i*i*r;
    });
  }
  Resistor.prototype = new Via.Object();

  var circuit = new Via.Object({
    conductor: new Conductor()
  , resistor = new Resistor()
  });
  circuit.synth('conductor.resistance', 'resistor.resistance');
  ```

## Reversible computing
  Synth can accept an additional function to convert the output
  back to the input.

  ``` 
  synth('a', 'b', function(b) { return b*2; }, function(a) { return a/2; });
  // No matter what changes, b will always be 1/2 of a
  ```

  Additionally, when synth() is given a simple direct 1-1 binding,
  i.e. no function is given, and no information is lost.
  It will also do the reverse, and keep the input updated with the output.

  In this way synth() can be used to interlink data across libraries
  without any transformation.

## Unbinding
  Since all data flows are bound by specifying paths within an objected structure,
  breaking bindings is simply a matter of breaking that path. Via automatically cleans up watch() events when the path becomes unreachable.

  Using our circuit example from before:
  ```
  circuit.set('resistor', false);
  ```

## Testing
    $ make test
   

## License

(MIT License)

Copyright (C) 2013 by Emery Denuccio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
