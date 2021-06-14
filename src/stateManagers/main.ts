import { State, UpOperation, apply, composeUpOperation, clientTransform, diff, toUpOperation } from '@kizahasi/flocon-core';
import { StateManager, StateManagerParameters } from './StateManager';

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
                firstPrime: result.value.firstPrime ?? { $version: 1 },
                secondPrime: result.value.secondPrime ?? { $version: 1 },
            };
        },
        diff: params => {
            const result = diff(params);
            return toUpOperation(result ?? { $version: 1 });
        },
    };
};

export const create = (state: State, revision: number): StateManager<State, UpOperation> => {
    return new StateManager(createParameters(state, revision));
};