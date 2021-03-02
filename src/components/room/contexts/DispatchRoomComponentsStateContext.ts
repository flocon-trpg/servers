import React from 'react';
import { RoomComponentsAction } from '../RoomComponentsState';

const DispatchRoomComponentsStateContext = React.createContext<(action: RoomComponentsAction) => void>(() => undefined);
export default DispatchRoomComponentsStateContext;