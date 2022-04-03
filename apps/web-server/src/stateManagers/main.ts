import {
    State as S,
    UpOperation as U,
    apply,
    clientTransform,
    diff,
    toUpOperation,
    roomTemplate,
} from '@flocon-trpg/core';
import { StateManager, StateManagerParameters } from '@flocon-trpg/core';

type State = S<typeof roomTemplate>;
type UpOperation = U<typeof roomTemplate>;

type Parameters = StateManagerParameters<State, UpOperation>;

const createParameters = (state: State, revision: number): Parameters => {
    return {
        state,
        revision,
        apply: params => {
            const result = apply(roomTemplate)(params);
            if (result.isError) {
                throw result.error;
            }
            return result.value;
        },
        transform: params => {
            const result = clientTransform(roomTemplate)(params);
            if (result.isError) {
                throw result.error;
            }
            return {
                firstPrime: result.value.firstPrime ?? { $v: 2, $r: 1 },
                secondPrime: result.value.secondPrime ?? { $v: 2, $r: 1 },
            };
        },
        diff: params => {
            const result = diff(roomTemplate)(params);
            return toUpOperation(roomTemplate)(result ?? { $v: 2, $r: 1 });
        },
        enableHistory: false,
    };
};

export const create = (state: State, revision: number): StateManager<State, UpOperation> => {
    return new StateManager(createParameters(state, revision));
};
