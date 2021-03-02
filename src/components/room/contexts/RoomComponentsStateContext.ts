import React from 'react';
import { RoomComponentsState, defaultRoomComponentsState } from '../RoomComponentsState';

const ComponentsStateContext = React.createContext<RoomComponentsState>(defaultRoomComponentsState);
export default ComponentsStateContext;