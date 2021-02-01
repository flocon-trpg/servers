import { StateManager, StateManagerParameters } from './StateManager';
import * as Room from './states/room';

type Parameters = StateManagerParameters<Room.State, Room.GetOperation, Room.PostOperation>;

const createParmeters = (state: Room.State, revision: number): Parameters => {
    return {
        state,
        revision,
        applyGetOperation: Room.applyGetOperation,
        applyPostOperation: Room.applyPostOperation,
        composePostOperation: Room.compose,
        transform: Room.transform,
        diff: Room.diff,
    };
};

export const create = (state: Room.State, revision: number): StateManager<Room.State, Room.GetOperation, Room.PostOperation> => {
    return new StateManager(createParmeters(state, revision));
};