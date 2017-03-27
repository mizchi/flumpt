# Flumpt

Conceptual Implementation of EventEmitter based Flux.

## Concepts

Flux is (...What you think) but all you need is just an `EventEmitter`.

Interface is inpired by `Om`.

## Example

### Hello World

```js
import * as React from "react";
import {Flux, Component} from "flumpt";
import {render} from "react-dom";

class MyComponent extends Component {
  componentDidMount() {
    this.dispatch("increment");
  }
  render() {
    return (
      <div>
        {this.props.count}
        <button onClick={() => this.dispatch("increment")}>increment</button>
      </div>
    );
  }
}

class App extends Flux {
  subscribe() { // `subscribe` is called once in constructor
    this.on("increment", () => {
      this.update(({count}) => {
        return {count: count + 1}; // return next state
      });
    });
  }
  render(state) {
    return <MyComponent {...state}/>;
  }
}

// Setup renderer
const app = new App({
  renderer: el => {
    render(el, document.querySelector("#root"));
  },
  initialState: {count: 0},
  middlewares: [
    // logger
    //   it may get state before unwrap promise
    (state) => {
      console.log(state);
      return state
    }
  ]
});

app.on(":start-async-updating", () => {
  // overlay ui lock
});
app.on(":end-anync-updating", () => {
  // hide ui lock
});

app.update(_initialState => ({count: 1})) // it fires rendering
```

- `Flux` is `EventEmitter`
- `Component` is just `ReactComponent` with `dispatch` method.

## With decorator

Added by v0.3.0. Need babel-plugin-transform-decorators-legacy.

```js
import React from 'react'
import {withFlux, dispatchable} from '../../src/flumpt'

@dispatchable
class CounterIncrement extends React.Component {
  render() {
    return <button onClick={_ev => this.context.dispatch('increment')}>+1</button>
  }
}

@withFlux((update, on) => {
  on('increment', () => {
    update(state => {
      return {count: state.count + 1}
    })
  })
}, {count: 0})
class MyApp extends React.Component {
  render () {
    return <div>
      <span>{this.props.count}</span>
      <CounterIncrement/>
    </div>
  }
}
```

## With TypeScript

Need `node react reace-dom es6-promise` type definitions.

- `npm install -g dtsm`
- `dtsm install node react reace-dom`


```js
import {Flux} from "flumpt";

interface State {
  count: number;
}

class App extends Flux<State> {
  subscribe() {
    this.on("increment", () => {
      this.update((s: State) => {
        return {count: count + 1};
      });
    });
  }
  // ... render or others
}
```

See detail in `index.d.ts`

## Middlewares

Middleware function type is `<T>(t: T) => T | Promise<T>` or  `<T>(t: Promise<T>) => Promise<T>;`. (Use Promise.resolve if you consider promise)
`Flux#render(state)` is always promise unwrapped promise but a middelware handle raw nextState received by `Flux#update`.


## LICENSE

MIT
