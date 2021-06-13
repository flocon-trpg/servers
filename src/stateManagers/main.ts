import { State, UpOperation, apply, composeUpOperation, clientTransform, diff, toUpOperation } from '@kizahasi/flocon-core';
import { StateManager, StateManagerParameters } from './StateManager';

type Parameters = StateManagerParameters<State, UpOperation, UpOperation>;

const createParameters = (state: State, revision: number): Parameters => {
    return {
        state,
        revision,
        applyGetOperation: params => {
            const result = apply(params);
            if (result.isError) {
                throw result.error;
            }
            return result.value;
        },
        applyPostOperation: params => {
            const result = apply(params);
            if (result.isError) {
                throw result.error;
            }
            return result.value;
        },
        composePostOperation: params => {
            const result = composeUpOperation(params);
            if (result.isError) {
                throw result.error;
            }
            return result.value ?? { $version: 1 };
        },
        getFirstTransform: params => {
            const result = clientTransform(params);
            if (result.isError) {
                throw result.error;
            }
            return {
                firstPrime: result.value.firstPrime ?? { $version: 1 },
                secondPrime: result.value.secondPrime ?? { $version: 1 },
            };
        },
        postFirstTransform: params => {
            const result = clientTransform(params);
            if (result.isError) {
                throw result.error;
            }
            return {
                firstPrime: result.value.firstPrime ?? { $version: 1 },
                secondPrime: result.value.secondPrime ?? { $version: 1 },
            };
        },
        getOperationDiff: params => {
            const result = diff(params);
            return toUpOperation(result ?? { $version: 1 });
        },
        postOperationDiff: params => {
            const result = diff(params);
            return toUpOperation(result ?? { $version: 1 });
        },
    };
};

export const create = (state: State, revision: number): StateManager<State, UpOperation, UpOperation> => {
    return new StateManager(createParameters(state, revision));
};