// context
import React from "react";
import {EventEmitter} from "events";
import PromisedReducer from "promised-reducer"

const SharedTypes = {
  dispatch: React.PropTypes.any,
  rootProps: React.PropTypes.any
};

export class Provider extends React.Component {
  static get childContextTypes() {return SharedTypes;}
  getChildContext() {
    return {
      dispatch: this.props.emitter.emit.bind(this.props.emitter),
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
    return this.context.dispatch(...args);
  }
}

export function dispatchable(Wrapped) {
  Wrapped.contextTypes = SharedTypes
  return Wrapped
}

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

export function withFlux(subscriber, initialState = {}) {
  const pr = new PromisedReducer(initialState)
  return Wrapped => class WithFlux extends React.Component {
    static get childContextTypes() {return SharedTypes;}

    getChildContext() {
      const rootProps = Object.assign({}, this.props, this.state)
      return {
        dispatch: pr.emit.bind(pr),
        rootProps
      };
    }

    constructor (props) {
      super(props);
      this.state = initialState
      subscriber(pr.update.bind(pr), pr.on.bind(pr))
      pr.on(":update", () => {
        this.setState(pr.state)
      })
    }

    componentWillUnmount() {
      pr.removeAllListeners()
    }

    render() {
      return <Wrapped {...Object.assign({}, this.props, this.state)}/>
    }
  }
}
