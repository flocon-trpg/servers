import React from 'react';
import { Room } from '../../../stateManagers/states/room';

const OperateContext = React.createContext<(operation: Room.PostOperationSetup) => void>(() => { throw 'OperateContext is empty'; });
export default OperateContext;