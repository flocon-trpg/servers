import React from 'react';
import * as Room from '../../../stateManagers/states/room';
import { RoomComponentsState, defaultRoomComponentsState, RoomComponentsAction } from '../RoomComponentsState';

const DispatchRoomComponentsStateContext = React.createContext<(action: RoomComponentsAction) => void>(() => undefined);
export default DispatchRoomComponentsStateContext;