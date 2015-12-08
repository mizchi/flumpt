# Flumt

Conceptual Implementation of EventEmitter based Flux.

// TODO Documentation


## Example

### Hello World

```js
import * as React from "react";
import {Flux} from "flumt";
import {render} from "react-dom";

class App extends Flux<{}> {
  render(prors) {
    return <divHelloWorld</div>;
  }
}

// Setup renderer
const app = new App(el => {
  render(el, document.querySelector("#root"));
});
app.update(_initialState => ({}))
```
