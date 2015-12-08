// context
import React from "react";
const SharedTypes = {
  emitter: React.PropTypes.any,
  rootProps: React.PropTypes.any
};

export class Provider extends React.Component {
  static get childContextTypes() {return SharedTypes;}
  getChildContext() {
    return {
      emitter: this.props.emitter,
      rootProps: this.props
    };
  }
  render() {
    return this.props.children;
  }
}

export class Component extends React.Component {
  static get contextTypes() {return SharedTypes;}
  dispatch(...args) {
    return this.context.emitter.emit(...args);
  }
}

export const mixin = {
  contextTypes: SharedTypes,
  dispatch(...args) {
    return this.context.emitter.emit(...args);
  }
};

export function createRenderer({emitter, render}) {
  return el => {
    return render(<Provider emitter={emitter}>{el}</Provider>);
  };
}

export class Flux extends EventEmitter {
  contructor(renderer) {
    this.state = {};
    this._renderer = createRenderer({emitter: this, render: renderer});
    this.subscribe();
  }

  update(nextStateFn) {
    return Promise.resolve(nextStateFn(this.state)).then(nextState => {
      this.state = nextState;
      this._renderer(this.render(this.state));
    });
  }

  render(props) {
    // override me
    throw "Override Me"
  }

  subscribe() {
    // override me
  }
}
