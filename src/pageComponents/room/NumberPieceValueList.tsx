import React from 'react';
import MyAuthContext from '../../contexts/MyAuthContext';
import { Table, Button, InputNumber, Tooltip } from 'antd';
import { update } from '../../stateManagers/states/types';
import * as Icon from '@ant-design/icons';
import ToggleButton from '../../components/ToggleButton';
import { getUserUid } from '../../hooks/useFirebaseUser';
import { useOperate } from '../../hooks/useOperate';
import { useParticipants } from '../../hooks/state/useParticipants';
import { compositeKeyToString, dualKeyRecordForEach, recordToArray } from '@kizahasi/util';
import { NumberPieceValueState, UpOperation } from '@kizahasi/flocon-core';
import _ from 'lodash';
import { useSelector } from '../../store';
import { NumberPieceValueElement, useNumberPieceValues } from '../../hooks/state/useNumberPieceValues';
import { useDispatch } from 'react-redux';
import { roomDrawerModule } from '../../modules/roomDrawerModule';

type DataSource = NumberPieceValueElement;

export const NumberPieceValueList: React.FC = () => {
    const myAuth = React.useContext(MyAuthContext);
    const dispatch = useDispatch();
    const operate = useOperate();
    const participants = useParticipants();
    const numberPieceValues = useNumberPieceValues();

    if (numberPieceValues == null || participants == null) {
        return null;
    }

    const columns = [
        {
            title: '',
            key: 'menu',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { valueId, characterKey }: DataSource) => {
                return <Tooltip title='編集'>
                    <Button
                        style={({ alignSelf: 'center' })}
                        size='small'
                        onClick={() => dispatch(roomDrawerModule.actions.set({ numberPieceValueDrawerType: { type: update, boardKey: null, stateKey: valueId, characterKey } }))}>
                        <Icon.SettingOutlined />
                    </Button>
                </Tooltip>;
            },
        },
        {
            title: 'ID',
            key: 'ID',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { valueId }: DataSource) => {
                return <div style={{ width: 140, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{valueId}</div>;
            },
        },
        {
            title: '値',
            key: 'value',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { value, characterKey, valueId }: DataSource) => {
                let input: JSX.Element;
                let toggleButton: JSX.Element;
                if (characterKey.createdBy === getUserUid(myAuth)) {
                    input = <InputNumber
                        style={{ width: 70 }}
                        size='small'
                        value={value.value}
                        onChange={newValue => {
                            const operation: UpOperation = {
                                $version: 1,
                                characters: {
                                    [characterKey.createdBy]: {
                                        [characterKey.id]: {
                                            type: update,
                                            update: {
                                                $version: 1,
                                                numberPieceValues: {
                                                    [valueId]: {
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
                                }
                            };
                            operate(operation);
                        }} />;
                    toggleButton = <ToggleButton
                        size='small'
                        disabled={false}
                        checkedChildren={<Icon.EyeInvisibleOutlined />}
                        unCheckedChildren={<Icon.EyeOutlined />}
                        checked={value.isValuePrivate}
                        onChange={newValue => {
                            const operation: UpOperation = {
                                $version: 1,
                                characters: {
                                    [characterKey.createdBy]: {
                                        [characterKey.id]: {
                                            type: update,
                                            update: {
                                                $version: 1,
                                                numberPieceValues: {
                                                    [valueId]: {
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
                                }
                            };
                            operate(operation);
                        }} />;
                } else {
                    input = <span>{value.value}</span>;
                    toggleButton = <ToggleButton
                        disabled
                        showAsTextWhenDisabled
                        checkedChildren={<Icon.EyeInvisibleOutlined />}
                        unCheckedChildren={<Icon.EyeOutlined />}
                        checked={value.isValuePrivate}
                        onChange={() => undefined} />;
                }
                return <span>{input}{toggleButton}</span>;
            },
        },
        {
            key: '作成者',
            title: '作成者',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { characterKey }: DataSource) => {
                return <span>{participants.get(characterKey.createdBy)?.name}{characterKey.createdBy === getUserUid(myAuth) && <span style={{ fontWeight: 'bold', paddingLeft: 2 }}>(自分)</span>}</span>;
            },
        }
    ];

    return (
        <div>
            <Table columns={columns} dataSource={numberPieceValues ?? []} size='small' pagination={false} />
        </div>);
};