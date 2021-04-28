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
import { Character } from '../../stateManagers/states/character';
import { Room } from '../../stateManagers/states/room';
import { Participant } from '../../stateManagers/states/participant';
import { MyNumberValue } from '../../stateManagers/states/myNumberValue';
import { getUserUid } from '../../hooks/useFirebaseUser';

const characterOperationBase: Participant.PostOperation = {
    myNumberValues: new Map(),
};

type Props = {
    participants: ReadonlyMap<string, Participant.State>;

}

type DataSource = {
    key: string;
    createdBy: string;
    stateId: string;
    state: MyNumberValue.State;
    operate: (operation: Room.PostOperationSetup) => void;
}

const MyNumberValueList: React.FC<Props> = ({ participants }: Props) => {
    const myAuth = React.useContext(MyAuthContext);
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const dispatchRoomComponentsState = React.useContext(DispatchRoomComponentsStateContext);
    const operate = React.useContext(OperateContext);

    const charactersDataSource: DataSource[] =
        __(participants).flatMap(([userUid, participant]) => [...participant.myNumberValues].map(([stateId, myNumberValue]) => ({
            key: compositeKeyToString({ createdBy: userUid, id: stateId }),
            createdBy: userUid,
            stateId,
            state: myNumberValue,
            operate,
        }))).toArray();

    const columns = [
        {
            title: 'ID',
            key: 'ID',
            render: (_: unknown, { state, createdBy, stateId }: DataSource) => {
                return <Tooltip title={compositeKeyToString({ createdBy, id: stateId })}>
                    <div style={{ width: 140, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{compositeKeyToString({ createdBy, id: stateId })}</div>
                </Tooltip>
            },
        },
        {
            title: '値',
            key: 'value',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { state, createdBy, stateId }: DataSource) => {
                let input: JSX.Element;
                let toggleButton: JSX.Element;
                if (createdBy === getUserUid(myAuth)) {
                    input = <InputNumber
                        style={{ width: 70 }}
                        size='small'
                        value={state.value}
                        onChange={newValue => {
                            const postOperationSetup = Room.createPostOperationSetup();
                            const participantOperation: Participant.PostOperation = {
                                myNumberValues: new Map([[stateId, { type: update, operation: { value: { newValue }, pieces: createStateMap() } }]]),
                            };
                            postOperationSetup.participants.set(createdBy, participantOperation);
                            operate(postOperationSetup);
                        }} />;
                    toggleButton = <ToggleButton
                        size='small'
                        disabled={false}
                        checkedChildren={<Icon.EyeInvisibleOutlined />}
                        unCheckedChildren={<Icon.EyeOutlined />}
                        checked={state.isValuePrivate}
                        onChange={newValue => {
                            const postOperationSetup = Room.createPostOperationSetup();
                            const participantOperation: Participant.PostOperation = {
                                myNumberValues: new Map([[stateId, { type: update, operation: { isValuePrivate: { newValue }, pieces: createStateMap() } }]]),
                            };
                            postOperationSetup.participants.set(createdBy, participantOperation);
                            operate(postOperationSetup);
                        }} />;
                } else {
                    input = <span>{state.value}</span>;
                    toggleButton = <ToggleButton
                        disabled
                        showAsTextWhenDisabled
                        checkedChildren={<Icon.EyeInvisibleOutlined />}
                        unCheckedChildren={<Icon.EyeOutlined />}
                        checked={state.isValuePrivate}
                        onChange={() => { }} />;
                }
                return <span>{input}{toggleButton}</span>
            },
        },
        {
            key: '作成者',
            title: '作成者',
            render: (_: unknown, { state, createdBy, stateId }: DataSource) => {
                return <span>{participants.get(createdBy)?.name}{createdBy === getUserUid(myAuth) && <span style={{ fontWeight: 'bold', paddingLeft: 2 }}>(自分)</span>}</span>
            },
        }
    ];

    return (
        <div>
            <Table columns={columns} dataSource={charactersDataSource} size='small' />
        </div>);
};

export default MyNumberValueList;