import React from "react";
import {Flux, Component} from "../src/flumpt";
import {renderToStaticMarkup} from "react-dom/server";

class Counter extends Component {
  render() {
    return <div>{this.props.count}</div>;
  }
}

class TestApp extends Flux {
  render(state) {
    return <Counter {...state}/>;
  }
}

// Setup renderer
var _buffer = "";
const app = new TestApp({
  renderer: el => {
    _buffer = renderToStaticMarkup(el);
  },
  initialState: {count: 0},
  middlewares: [
    (state) => {
      Promise.resolve(state).then(s => {
        console.log('state:', s);
      });
      return state
    }
  ]
});

function wait(ms = 100) {return new Promise(done => setTimeout(done, ms));}

const {ok, equal} = require("assert");
(async () => {
  // case 1
  app.update(s => ({count: 1}));
  ok(!app.updating);
  console.log("buffer", _buffer)
  ok(_buffer === "<div>1</div>");

  // case 2
  const p1 = app.update(async (s) => {
    await wait(100);
    return {count: 2}
  });

  ok(_buffer === "<div>1</div>");
  await p1;
  ok(_buffer === "<div>2</div>");

  // case 2
  const p2 = app.update(async (s) => {
    await wait(100);
    return {count: 3}
  });

  const p3 = app.update(async (s) => {
    await wait(100);
    return {count: 4}
  });
  ok(app._updatingQueues.length === 1);
  ok(p2 === p3);
  await p2;
  ok(_buffer === "<div>4</div>");

  // case 2
  const p4 = app.update(async (s) => {
    await wait(100);
    return {count: 3}
  });

  const p5 = app.update(async (s) => {
    await wait(100);
    return {count: 4}
  });
  ok(app._updatingQueues.length === 1);
  const p6 = app.update(async (s) => {
    await wait(100);
    return {count: 2}
  });
  ok(p4 === p5);
  ok(p5 === p6);

  ok(app._updatingQueues.length === 2);
  await p6;
  ok(_buffer === "<div>2</div>");

  // finish
  console.log("pass");
})().catch(e => {
  throw e;
});
