import * as React from "react";
import {Flux, Component} from "flumpt";
import {render} from "react-dom";

class MyComponent extends Component<{}, {}> {
  componentDidMount() {
    this.dispatch("increment");
  }
  render() {
    return (
      <div>
        <h1>aaa</h1>
      </div>
    );
  }
}

class App extends Flux<{}> {
  subscribe() { // `subscribe` is called once in constructor
    this.on("increment", () => {
      this.update(state => {
        return {}; // return next state
      });
    });
  }
  render(state: {}) {
    return <MyComponent {...state}/>;
  }
}

// Setup renderer
export default new App({
  renderer: (el: any) => {
    render(el, document.querySelector("#root"));
  },
  initialState: {count: 0},
  middlewares: [
    (state: any) => {
      console.log(state);
      return state
    }
  ]
});
