import React from 'react';
import MyAuthContext from '../../contexts/MyAuthContext';
import { Table, Button, InputNumber, Tooltip } from 'antd';
import { compositeKeyToString } from '../../@shared/StateMap';
import { update } from '../../stateManagers/states/types';
import { __ } from '../../@shared/collection';
import { myNumberValueDrawerType } from './RoomComponentsState';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import * as Icon from '@ant-design/icons';
import ToggleButton from '../../foundations/ToggleButton';
import { getUserUid } from '../../hooks/useFirebaseUser';
import { useOperate } from '../../hooks/useOperate';
import { useSelector } from '../../store';
import { recordToArray, recordToMap } from '../../@shared/utils';
import * as MyNumberValue from '../../@shared/ot/room/participant/myNumberValue/v1';
import * as Room from '../../@shared/ot/room/v1';
import { useParticipants } from '../../hooks/state/useParticipants';

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
    const participantsMap = useParticipants(); 

    if (participantsMap == null) {
        return null;
    }

    const charactersDataSource: DataSource[] =
        __(participantsMap).flatMap(([userUid, participant]) => recordToArray(participant.myNumberValues).map(({ key: stateId, value: myNumberValue }) => ({
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
                            const operation: Room.UpOperation = {
                                $version: 1,
                                participants: {
                                    [createdBy]: {
                                        type: update,
                                        update: {
                                            $version: 1,
                                            myNumberValues: {
                                                [stateId]: {
                                                    type: update,
                                                    update: {
                                                        $version: 1,
                                                        value: { newValue }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            };
                            operate(operation);
                        }} />;
                    toggleButton = <ToggleButton
                        size='small'
                        disabled={false}
                        checkedChildren={<Icon.EyeInvisibleOutlined />}
                        unCheckedChildren={<Icon.EyeOutlined />}
                        checked={state.isValuePrivate}
                        onChange={newValue => {
                            const operation: Room.UpOperation = {
                                $version: 1,
                                participants: {
                                    [createdBy]: {
                                        type: update,
                                        update: {
                                            $version: 1,
                                            myNumberValues: {
                                                [stateId]: {
                                                    type: update,
                                                    update: {
                                                        $version: 1,
                                                        isValuePrivate: { newValue }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            };
                            operate(operation);
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
                return <span>{participantsMap.get(createdBy)?.name}{createdBy === getUserUid(myAuth) && <span style={{ fontWeight: 'bold', paddingLeft: 2 }}>(自分)</span>}</span>;
            },
        }
    ];

    return (
        <div>
            <Table columns={columns} dataSource={charactersDataSource} size='small' pagination={false} />
        </div>);
};

export default MyNumberValueList;