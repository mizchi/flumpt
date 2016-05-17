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

const applyMiddlewares = (middlewares, nextState) => {
  return middlewares.reduce((s, next) => {
    return next(s);
  }, nextState);
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
  constructor({renderer, initialState, middlewares}) {
    super();
    this.state = initialState ? initialState : {};
    this.middlewares = middlewares ? middlewares : [];
    this._renderer = createRenderer({emitter: this, render: renderer});
    this._renderedElement = null;

    this.updating = false;
    this._updatingQueues = []; // TODO
    this._updatingPromise = null;

    // setup self
    this.subscribe();
  }

  _finishUpdate(nextState) {
    const inAsync = !!this._updatingPromise;

    if (inAsync) {
      this._updatingQueues.length = 0;
      this._updatingPromise = null;
      this.updating = false;
    }

    this.state = nextState;
    this._renderedElement = this._renderer(this.render(this.state));

    if (inAsync) {
      this.emit(":end-async-updating");
    }
    return Promise.resolve();
  }

  update(nextStateFn) {
    // if app is updating, add fn to queues and return current promise;
    if (this.updating) {
      this._updatingQueues.push(nextStateFn);
      return this._updatingPromise;
    }

    // Create state
    const promiseOrState = applyMiddlewares(this.middlewares, nextStateFn(this.state));

    // if state is not promise, exec and resolve at once.
    if (!(promiseOrState instanceof Promise)) {
      const oldState = this.state;
      this._finishUpdate(promiseOrState);
      this.emit(":process-updating", this.state, oldState);
      return Promise.resolve();
    }

    // start async updating!
    this.updating = true;
    this.emit(":start-async-updating");

    // create callback to response.
    // TODO: I want Promise.defer
    var endUpdate;
    this._updatingPromise = new Promise(done => {
      endUpdate = done;
    });

    // drain first async
    const lastState = this.state;
    promiseOrState.then(nextState => {
      this.emit(":process-async-updating", nextState, lastState);

      // if there is left queue after first async,
      const updateLoop = (appliedState) => {
        const nextFn = this._updatingQueues.shift();
        if (nextFn == null) {
          this._finishUpdate(appliedState);
          endUpdate();
          return;
        } else {
          return Promise.resolve(
            applyMiddlewares(
              this.middlewares,
              nextFn(appliedState)
            )
          ).then(s => {
            this.emit(":process-async-updating", s, appliedState, this._updatingQueues.length);
            this.emit(":process-updating", s, appliedState);
            updateLoop(s); // recursive loop
          });
        }
      }
      updateLoop(nextState);
    });

    return this._updatingPromise;
  }

  _setState(...args) {
    if (this._renderedElement) {
      this._renderedElement.setState(...args)
    }
  }

  render(state) {
    // override me
    throw "Override Me"
  }

  subscribe() {
    // override me
  }
}

export class Incubator extends Provider {
  constructor(...args) {
    super(...args);
    this._flux = this.initContextFlux();
  }

  initContextFlux() {
    throw "override me";
  }

  componentDidMount() {
    // Rewrite itself
    this._flux.update(() => this._flux.state);
  }

  // it is used only initial render
  render() {
    return this._flux.render(this._flux.state);
  }
}
