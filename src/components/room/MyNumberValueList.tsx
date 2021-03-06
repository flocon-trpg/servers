import React from 'react';
import MyAuthContext from '../../contexts/MyAuthContext';
import { Table, Checkbox, Button, InputNumber, Input, Dropdown, Menu, Switch, Tooltip, Popover } from 'antd';
import { CompositeKey, compositeKeyToString, createStateMap, StateMap } from '../../@shared/StateMap';
import { secureId, simpleId } from '../../utils/generators';
import { replace, update } from '../../stateManagers/states/types';
import { __ } from '../../@shared/collection';
import { characterDrawerType, characterParameterNamesDrawerVisibility, create, RoomComponentsState } from './RoomComponentsState';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import OperateContext from './contexts/OperateContext';
import { FilePathFragment, RoomParameterNameType } from '../../generated/graphql';
import { TextTwoWayOperation } from '../../@shared/textOperation';
import { StrIndex20, strIndex20Array } from '../../@shared/indexes';
import produce from 'immer';
import NumberParameterInput from '../../foundations/NumberParameterInput';
import BooleanParameterInput from '../../foundations/BooleanParameterInput';
import StringParameterInput from '../../foundations/StringParameterInput';
import { useFirebaseStorageUrl } from '../../hooks/firebaseStorage';
import * as Icon from '@ant-design/icons';
import ToggleButton from '../../foundations/ToggleButton';
import { characterIsPrivate, characterIsNotPrivate, parameterIsPrivateAndNotCreatedByMe, characterIsNotPrivateAndNotCreatedByMe } from '../../resource/text/main';
import { Character } from '../../stateManagers/states/character';
import { Room } from '../../stateManagers/states/room';
import { Participant } from '../../stateManagers/states/participant';
import { MyNumberValue } from '../../stateManagers/states/myNumberValue';

const characterOperationBase: Participant.PostOperation = {
    myNumberValues: new Map(),
};

type Props = {
    me: Participant.State;
}

type DataSource = {
    key: string;
    state: MyNumberValue.State;
    operate: (operation: Room.PostOperationSetup) => void;
}

const MyNumberValueList: React.FC<Props> = ({ me }: Props) => {
    const myAuth = React.useContext(MyAuthContext);
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const dispatchRoomComponentsState = React.useContext(DispatchRoomComponentsStateContext);
    const operate = React.useContext(OperateContext);

    const charactersDataSource: DataSource[] =
        __(me.myNumberValues).map(([key, value]) => {
            return {
                key, // antdのtableのkeyとして必要
                state: value,
                operate,
            };
        }).toArray();

    const columns = [
        {
            title: '',
            key: 'value',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { state }: DataSource) => (
                <span>{state.value}</span>),
        },
    ];

    return (
        <div>
            <Table columns={columns} dataSource={charactersDataSource} size='small' />
        </div>);
};

export default MyNumberValueList;