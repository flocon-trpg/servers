import React from 'react';
import MyAuthContext from '../../contexts/MyAuthContext';
import { Table, Button, InputNumber, Tooltip } from 'antd';
import { update } from '../../stateManagers/states/types';
import { myNumberValueDrawerType } from './RoomComponentsState';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import * as Icon from '@ant-design/icons';
import ToggleButton from '../../foundations/ToggleButton';
import { getUserUid } from '../../hooks/useFirebaseUser';
import { useOperate } from '../../hooks/useOperate';
import { useParticipants } from '../../hooks/state/useParticipants';
import { compositeKeyToString, dualKeyRecordForEach, recordToArray } from '@kizahasi/util';
import { MyNumberValueState, UpOperation } from '@kizahasi/flocon-core';
import _ from 'lodash';
import { useSelector } from '../../store';

type DataSource = {
    key: string;
    createdBy: string;
    stateId: string;
    state: MyNumberValueState;
}

const MyNumberValueList: React.FC = () => {
    const myAuth = React.useContext(MyAuthContext);
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const dispatchRoomComponentsState = React.useContext(DispatchRoomComponentsStateContext);
    const operate = useOperate();
    const participants = useParticipants();
    const myNumberValues = useSelector(state => state.roomModule.roomState?.state?.myNumberValues);

    if (myNumberValues == null ||participants == null) {
        return null;
    }

    const charactersDataSource: DataSource[] = [];
    dualKeyRecordForEach<MyNumberValueState>(myNumberValues ?? {}, (value,key) => {
        charactersDataSource.push({
            key: compositeKeyToString({ createdBy: key.first, id: key.second }),
            createdBy: key.first,
            stateId: key.second,
            state: value,
        });
    });

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
                            const operation: UpOperation = {
                                $version: 1,
                                myNumberValues: {
                                    [createdBy]: {
                                        [stateId]: {
                                            type: update,
                                            update: {
                                                $version: 1,
                                                value: { newValue }
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
                            const operation: UpOperation = {
                                $version: 1,
                                myNumberValues: {
                                    [createdBy]: {
                                        [stateId]: {
                                            type: update,
                                            update: {
                                                $version: 1,
                                                isValuePrivate: { newValue }
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