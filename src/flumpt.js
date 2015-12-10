// context
import React from "react";
import {EventEmitter} from "events";

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
  constructor({renderer, initialState}) {
    super();
    this.state = initialState ? {};
    this._renderer = createRenderer({emitter: this, render: renderer});
    this._renderedElement = null;
    this.subscribe();
    this.updating = false;
    // this._updatingQueues = []; // TODO
  }

  update(nextStateFn) {
    if (this.updating) {
      // TODO: implement queue
      throw new Error("flumt: Update transaction is locked");
    }
    this.updating = true;

    const promiseOrState = nextStateFn(this.state);
    if (promiseOrState instanceof Promise) {
      this.emit(":start-updating");
      return promiseOrState.then(nextState => {
        this.state = nextState;
        this._renderedElement = this._renderer(this.render(this.state));
        this.updating = false;
        this.emit(":end-updating");
      });
    } else {
      this.state = promiseOrState;
      this._renderedElement = this._renderer(this.render(this.state));
      this.updating = false;
    }
  }

  _setState(...args) {
    if (this._renderedElement) {
      this._renderedElement.setState(...args)
    }
  }

  render(props) {
    // override me
    throw "Override Me"
  }

  subscribe() {
    // override me
  }
}
