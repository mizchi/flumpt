import * as React from "react";

export var mixin: {
  dispatch: (eventName: string, ...args: any[]) => boolean;
};

export class Component<Props, State> extends React.Component<Props, State> {
  dispatch: (eventName: string, ...args: any[]) => boolean;
}

export class Flux<State> {
  constructor(initalizers: {renderer: Function; initialState?: State; middlewares?: Function[];});
  state: State;
  on: (eventName: string, fn: Function) => void;
  update(updater: (s?: State) => State | Promise<State>): Promise<any>;
  subscribe(): void;
}
