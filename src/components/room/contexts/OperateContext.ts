import React from 'react';
import * as Room from '../../../stateManagers/states/room';
import { RoomComponentsState, defaultRoomComponentsState } from '../RoomComponentsState';

const OperateContext = React.createContext<(operation: Room.PostOperationSetup) => void>(() => { throw 'OperateContext is empty'; });
export default OperateContext;