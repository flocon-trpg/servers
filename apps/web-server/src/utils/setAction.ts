export type SetAction<State> = State | ((prevState: State) => State);
