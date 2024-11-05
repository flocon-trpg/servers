import { State as S, UpOperation as U, roomTemplate } from '@flocon-trpg/core';
import { StateManager } from './stateManager/stateManager';
type State = S<typeof roomTemplate>;
type UpOperation = U<typeof roomTemplate>;
export declare const create: (state: State, revision: number) => StateManager<State, UpOperation>;
export {};
//# sourceMappingURL=create.d.ts.map