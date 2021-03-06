import { StateManager, StateManagerParameters } from './StateManager';
import { Room } from './states/room';

type Parameters = StateManagerParameters<Room.State, Room.GetOperation, Room.PostOperation>;

const createParameters = (state: Room.State, revision: number): Parameters => {
    return {
        state,
        revision,
        applyGetOperation: Room.applyGetOperation,
        applyPostOperation: Room.applyPostOperation,
        composePostOperation: Room.compose,
        getFirstTransform: Room.getFirstTransform,
        postFirstTransform: Room.postFirstTransform,
        diff: Room.diff,
    };
};

export const create = (state: Room.State, revision: number): StateManager<Room.State, Room.GetOperation, Room.PostOperation> => {
    return new StateManager(createParameters(state, revision));
};