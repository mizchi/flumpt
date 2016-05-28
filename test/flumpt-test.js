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
const createTestApp = (buffer) => new TestApp({
  renderer: el => {
    buffer.out = renderToStaticMarkup(el);
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
// const test = require("ava");


(async () => {
  var buffer = {out: ""}
  var app = createTestApp(buffer);
  // case 1
  app.update(s => ({count: 1}));
  ok(!app.updating);
  console.log("buffer", buffer.out)
  ok(buffer.out === "<div>1</div>");
  console.log("pass case 1");

  // case 2
  const p1 = app.update(async (s) => {
    await wait(100);
    return {count: 2}
  });

  ok(buffer.out === "<div>1</div>");
  await p1;
  ok(buffer.out === "<div>2</div>");
  console.log("pass case 2");

  // case 3
  const p2 = app.update(async (s) => {
    await wait(100);
    return {count: 3}
  });

  const p3 = app.update(async (s) => {
    await wait(100);
    return {count: 4}
  });
  ok(app._updatingQueue.length === 1);
  ok(p2 === p3);
  await p2;
  ok(buffer.out === "<div>4</div>");

  // case 4
  const p4 = app.update(async (s) => {
    await wait(100);
    return {count: 3}
  });

  const p5 = app.update(async (s) => {
    await wait(100);
    return {count: 4}
  });
  ok(app._updatingQueue.length === 1);
  const p6 = app.update(async (s) => {
    await wait(100);
    return {count: 2}
  });
  ok(p4 === p5);
  ok(p5 === p6);

  ok(app._updatingQueue.length === 2);
  await p6;
  ok(buffer.out === "<div>2</div>");
  console.log("pass case 4");

  // finish
  console.log("all test passed");
})().catch(e => {
  console.log("catched", e)
  throw e;
});
