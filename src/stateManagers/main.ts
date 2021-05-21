import { StateManager, StateManagerParameters } from './StateManager';
import * as RoomModule from '../@shared/ot/room/v1';

type Parameters = StateManagerParameters<RoomModule.State, RoomModule.UpOperation, RoomModule.UpOperation>;

const createParameters = (state: RoomModule.State, revision: number): Parameters => {
    return {
        state,
        revision,
        applyGetOperation: params => {
            const result = RoomModule.apply(params);
            if (result.isError) {
                throw result.error;
            }
            return result.value;
        },
        applyPostOperation: params => {
            const result = RoomModule.apply(params);
            if (result.isError) {
                throw result.error;
            }
            return result.value;
        },
        composePostOperation: params => {
            const result = RoomModule.composeUpOperation(params);
            if (result.isError) {
                throw result.error;
            }
            return result.value ?? { $version: 1 };
        },
        getFirstTransform: params => {
            const result = RoomModule.clientTransform(params);
            if (result.isError) {
                throw result.error;
            }
            return {
                firstPrime: result.value.firstPrime ?? { $version: 1 },
                secondPrime: result.value.secondPrime ?? { $version: 1 },
            };
        },
        postFirstTransform: params => {
            const result = RoomModule.clientTransform(params);
            if (result.isError) {
                throw result.error;
            }
            return {
                firstPrime: result.value.firstPrime ?? { $version: 1 },
                secondPrime: result.value.secondPrime ?? { $version: 1 },
            };
        },
        diff: params => {
            const result = RoomModule.diff(params);
            return RoomModule.toUpOperation(result ?? { $version: 1 });
        },
    };
};

export const create = (state: RoomModule.State, revision: number): StateManager<RoomModule.State, RoomModule.UpOperation, RoomModule.UpOperation> => {
    return new StateManager(createParameters(state, revision));
};