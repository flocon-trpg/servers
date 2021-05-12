import React from 'react';
import MyAuthContext from '../../contexts/MyAuthContext';
import { Table, Button, InputNumber, Tooltip } from 'antd';
import { compositeKeyToString, createStateMap } from '../../@shared/StateMap';
import { update } from '../../stateManagers/states/types';
import { __ } from '../../@shared/collection';
import { myNumberValueDrawerType } from './RoomComponentsState';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import * as Icon from '@ant-design/icons';
import ToggleButton from '../../foundations/ToggleButton';
import { Room } from '../../stateManagers/states/room';
import { Participant } from '../../stateManagers/states/participant';
import { MyNumberValue } from '../../stateManagers/states/myNumberValue';
import { getUserUid } from '../../hooks/useFirebaseUser';
import { useOperate } from '../../hooks/useOperate';
import { useSelector } from '../../store';

const characterOperationBase: Participant.PostOperation = {
    myNumberValues: new Map(),
};

type DataSource = {
    key: string;
    createdBy: string;
    stateId: string;
    state: MyNumberValue.State;
}

const MyNumberValueList: React.FC = () => {
    const myAuth = React.useContext(MyAuthContext);
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const dispatchRoomComponentsState = React.useContext(DispatchRoomComponentsStateContext);
    const operate = useOperate();
    const participants = useSelector(state => state.roomModule.roomState?.state?.participants);

    if (participants == null) {
        return null;
    }

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
            title: '',
            key: 'menu',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { stateId }: DataSource) => {
                return <Tooltip title='編集'>
                    <Button
                        style={({ alignSelf: 'center' })}
                        size='small'
                        onClick={() => dispatchRoomComponentsState({ type: myNumberValueDrawerType, newValue: { type: update, boardKey: null, stateKey: stateId } })}>
                        <Icon.SettingOutlined />
                    </Button>
                </Tooltip>;
            },
        },
        {
            title: 'ID',
            key: 'ID',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { createdBy, stateId }: DataSource) => {
                return <Tooltip title={compositeKeyToString({ createdBy, id: stateId })}>
                    <div style={{ width: 140, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{compositeKeyToString({ createdBy, id: stateId })}</div>
                </Tooltip>;
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
                        onChange={() => undefined} />;
                }
                return <span>{input}{toggleButton}</span>;
            },
        },
        {
            key: '作成者',
            title: '作成者',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { state, createdBy, stateId }: DataSource) => {
                return <span>{participants.get(createdBy)?.name}{createdBy === getUserUid(myAuth) && <span style={{ fontWeight: 'bold', paddingLeft: 2 }}>(自分)</span>}</span>;
            },
        }
    ];

    return (
        <div>
            <Table columns={columns} dataSource={charactersDataSource} size='small' pagination={false} />
        </div>);
};

export default MyNumberValueList;