import React from 'react';
import { Table, Button, Tooltip } from 'antd';
import { update } from '../../stateManagers/states/types';
import * as Icon from '@ant-design/icons';
import { useParticipants } from '../../hooks/state/useParticipants';
import _ from 'lodash';
import {
    StringPieceValueElement,
    useStringPieceValues,
} from '../../hooks/state/useStringPieceValues';
import { DicePieceValueElement, useDicePieceValues } from '../../hooks/state/useDicePieceValues';
import { DicePieceValue } from '../../utils/dicePieceValue';
import { StringPieceValue } from '../../utils/stringPieceValue';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { keyNames } from '@flocon-trpg/utils';
import { useUpdateAtom } from 'jotai/utils';
import { dicePieceDrawerAtom } from '../../atoms/overlay/dicePieceDrawerAtom';
import { stringPieceDrawerAtom } from '../../atoms/overlay/stringPieceDrawerAtom';

type DataSource =
    | {
          type: 'dice';
          key: string;
          value: DicePieceValueElement;
      }
    | {
          type: 'number';
          key: string;
          value: StringPieceValueElement;
      };
export const PieceValueList: React.FC = () => {
    const myUserUid = useMyUserUid();
    const participants = useParticipants();
    const dicePieceValues = useDicePieceValues();
    const numberPieceValues = useStringPieceValues();
    const setDicePieceDrawer = useUpdateAtom(dicePieceDrawerAtom);
    const setStringPieceDrawer = useUpdateAtom(stringPieceDrawerAtom);

    if (dicePieceValues == null || numberPieceValues == null || participants == null) {
        return null;
    }

    const columns = [
        {
            title: '',
            key: 'menu',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, dataSource: DataSource) => {
                return (
                    <Tooltip title='編集'>
                        <Button
                            style={{ alignSelf: 'center' }}
                            size='small'
                            onClick={() => {
                                if (dataSource.type === 'dice') {
                                    setDicePieceDrawer({
                                        type: update,
                                        boardKey: null,
                                        stateKey: dataSource.value.valueId,
                                        characterKey: dataSource.value.characterKey,
                                    });
                                }
                                if (dataSource.type === 'number') {
                                    setStringPieceDrawer({
                                        type: update,
                                        boardKey: null,
                                        stateKey: dataSource.value.valueId,
                                        characterKey: dataSource.value.characterKey,
                                    });
                                }
                            }}
                        >
                            <Icon.SettingOutlined />
                        </Button>
                    </Tooltip>
                );
            },
        },
        {
            title: '種類',
            key: '種類',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, dataSource: DataSource) => {
                return (
                    <div
                        style={{
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {dataSource.type === 'dice' ? 'ダイスコマ' : '数値コマ'}
                    </div>
                );
            },
        },
        {
            title: 'ID',
            key: 'ID',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, dataSource: DataSource) => {
                return (
                    <div
                        style={{
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {keyNames(dataSource.value.characterKey, dataSource.value.valueId)}
                    </div>
                );
            },
        },
        {
            title: '値',
            key: 'value',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, dataSource: DataSource) => {
                if (dataSource.type === 'dice') {
                    return <DicePieceValue.images state={dataSource.value.value} size={22} />;
                }
                return <div>{StringPieceValue.stringify(dataSource.value.value)}</div>;
            },
        },
        {
            key: '作成者',
            title: '作成者',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, dataSource: DataSource) => {
                const createdBy = dataSource.value.characterKey.createdBy;
                return (
                    <span>
                        {participants.get(createdBy)?.name}
                        {createdBy === myUserUid && (
                            <span style={{ fontWeight: 'bold', paddingLeft: 2 }}>(自分)</span>
                        )}
                    </span>
                );
            },
        },
    ];

    const dataSource: DataSource[] = [
        ...dicePieceValues.map(value => ({
            type: 'dice' as const,
            value,
            key: keyNames(value.characterKey, value.valueId, 'dice'),
        })),
        ...numberPieceValues.map(value => ({
            type: 'number' as const,
            value,
            key: keyNames(value.characterKey, value.valueId, 'number'),
        })),
    ];
    return (
        <div>
            <Table columns={columns} dataSource={dataSource} size='small' pagination={false} />
        </div>
    );
};
