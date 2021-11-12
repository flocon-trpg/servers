import { State, UpOperation, apply, clientTransform, diff, toUpOperation } from '@flocon-trpg/core';
import { StateManager, StateManagerParameters } from '@flocon-trpg/core';

type Parameters = StateManagerParameters<State, UpOperation>;

const createParameters = (state: State, revision: number): Parameters => {
    return {
        state,
        revision,
        apply: params => {
            const result = apply(params);
            if (result.isError) {
                throw result.error;
            }
            return result.value;
        },
        transform: params => {
            const result = clientTransform(params);
            if (result.isError) {
                throw result.error;
            }
            return {
                firstPrime: result.value.firstPrime ?? { $v: 1, $r: 2 },
                secondPrime: result.value.secondPrime ?? { $v: 1, $r: 2 },
            };
        },
        diff: params => {
            const result = diff(params);
            return toUpOperation(result ?? { $v: 1, $r: 2 });
        },
        enableHistory: true,
    };
};

export const create = (state: State, revision: number): StateManager<State, UpOperation> => {
    return new StateManager(createParameters(state, revision));
};
