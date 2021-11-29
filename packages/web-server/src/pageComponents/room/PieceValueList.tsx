import React from 'react';
import { Table, Button, Tooltip } from 'antd';
import { update } from '../../stateManagers/states/types';
import * as Icon from '@ant-design/icons';
import {
    StringPieceValueElement,
    useStringPieceValues,
} from '../../hooks/state/useStringPieceValues';
import { DicePieceValueElement, useDicePieceValues } from '../../hooks/state/useDicePieceValues';
import { DicePieceValue } from '../../utils/dicePieceValue';
import { StringPieceValue } from '../../utils/stringPieceValue';
import { keyNames } from '@flocon-trpg/utils';
import { useUpdateAtom } from 'jotai/utils';
import { useCharacters } from '../../hooks/state/useCharacters';
import { dicePieceValueEditorModalAtom } from './DicePieceValueEditorModal';
import { stringPieceEditorModalAtom } from './StringPieceValueEditorModal';

type DataSource =
    | {
          type: 'dice';
          key: string;
          value: DicePieceValueElement;
      }
    | {
          type: 'string';
          key: string;
          value: StringPieceValueElement;
      };
export const PieceValueList: React.FC = () => {
    const characters = useCharacters();
    const dicePieceValues = useDicePieceValues();
    const stringPieceValues = useStringPieceValues();
    const setDicePieceEditor = useUpdateAtom(dicePieceValueEditorModalAtom);
    const setStringPieceEditr = useUpdateAtom(stringPieceEditorModalAtom);

    if (dicePieceValues == null || stringPieceValues == null ) {
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
                                    setDicePieceEditor({
                                        type: update,
                                        boardId: null,
                                        stateId: dataSource.value.id,
                                    });
                                }
                                if (dataSource.type === 'string') {
                                    setStringPieceEditr({
                                        type: update,
                                        boardId: null,
                                        stateId: dataSource.value.id,
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
                        {dataSource.value.id}
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
                const createdBy = dataSource.value.value.ownerCharacterId;
                return (
                    <span>
                        {(createdBy == null ? undefined : characters.get(createdBy)?.name) ?? '?'}
                    </span>
                );
            },
        },
    ];

    const dataSource: DataSource[] = [
        ...dicePieceValues.map(value => ({
            type: 'dice' as const,
            value,
            key: keyNames( value.id, 'dice'),
        })),
        ...stringPieceValues.map(value => ({
            type: 'string' as const,
            value,
            key: keyNames(value.id, 'string'),
        })),
    ];
    return (
        <div>
            <Table columns={columns} dataSource={dataSource} size='small' pagination={false} />
        </div>
    );
};
