import { State as S, UpOperation as U, roomTemplate } from '@flocon-trpg/core';
import { StateManager } from './stateManager/stateManager';
declare type State = S<typeof roomTemplate>;
declare type UpOperation = U<typeof roomTemplate>;
export declare const create: (state: State, revision: number) => StateManager<State, UpOperation>;
export {};
//# sourceMappingURL=create.d.ts.map