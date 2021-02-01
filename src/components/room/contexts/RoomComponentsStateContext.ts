import React from 'react';
import * as Room from '../../../stateManagers/states/room';
import { RoomComponentsState, defaultRoomComponentsState } from '../RoomComponentsState';

const ComponentsStateContext = React.createContext<RoomComponentsState>(defaultRoomComponentsState);
export default ComponentsStateContext;