// context
import React from "react";
import {EventEmitter} from "events";
import PromisedReducer from "promised-reducer"

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

export class Flux extends PromisedReducer {
  constructor({renderer, initialState, middlewares}) {
    super(initialState, middlewares);
    this._renderer = createRenderer({emitter: this, render: renderer});
    this._renderedElement = null;

    this.on(":update", () => {
      this._renderedElement = this._renderer(this.render(this.state));
    });
    this.subscribe();
  }

  _setState(...args) {
    if (this._renderedElement) {
      this._renderedElement.setState(...args)
    }
  }

  subscribe() {
    // override me
  }
}
