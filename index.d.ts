export var mixin: {
  dispatch: (eventName: string, ...args: any[]) => boolean;
};

export class Component<Props, State> {
  refs: any;
  props: Props;
  state: State;
  context: {
    rootProps: any;
  };
  dispatch: (eventName: string, ...args: any[]) => boolean;
}

export class Flux<State> {
  constructor(render: Function);
  state: State;
  on: (eventName: string, fn: Function) => void;
  update(updater: (s: State) => State): Promise<any>;
  subscribe(): void;
}
