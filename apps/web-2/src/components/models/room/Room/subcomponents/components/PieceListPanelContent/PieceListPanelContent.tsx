import * as Icon from '@ant-design/icons';
import { State, dicePieceTemplate, stringPieceTemplate, update } from '@flocon-trpg/core';
import { keyNames } from '@flocon-trpg/utils';
import { Button, Table, Tooltip } from 'antd';
import { useSetAtom } from 'jotai/react';
import React from 'react';
import { useCharacters } from '../../hooks/useCharacters';
import { useDicePieces } from '../../hooks/useDicePieces';
import { useStringPieces } from '../../hooks/useStringPieces';
import { DicePieceValue } from '../../utils/dicePieceValue';
import { StringPieceValue } from '../../utils/stringPieceValue';
import { dicePieceModalAtom } from '../DicePieceEditorModal/DicePieceEditorModal';
import { stringPieceModalAtom } from '../StringPieceEditorModal/StringPieceEditorModal';

type DicePieceState = State<typeof dicePieceTemplate>;
type StringPieceState = State<typeof stringPieceTemplate>;

type DataSource =
    | {
          type: 'dice';
          key: string;
          pieceId: string;
          piece: DicePieceState;
      }
    | {
          type: 'string';
          key: string;
          pieceId: string;
          piece: StringPieceState;
      };

type Props = {
    boardId: string;
};

export const PieceListPanelContent: React.FC<Props> = ({ boardId }: Props) => {
    const characters = useCharacters();
    const dicePieces = useDicePieces(boardId);
    const stringPieces = useStringPieces(boardId);
    const setDicePieceModal = useSetAtom(dicePieceModalAtom);
    const setStringPieceModal = useSetAtom(stringPieceModalAtom);

    if (dicePieces == null || stringPieces == null) {
        return null;
    }

    const columns = [
        {
            title: '',
            key: 'menu',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, dataSource: DataSource) => {
                return (
                    <Tooltip title="編集">
                        <Button
                            style={{ alignSelf: 'center' }}
                            size="small"
                            onClick={() => {
                                if (dataSource.type === 'dice') {
                                    setDicePieceModal({
                                        type: update,
                                        boardId,
                                        pieceId: dataSource.pieceId,
                                    });
                                }
                                if (dataSource.type === 'string') {
                                    setStringPieceModal({
                                        type: update,
                                        boardId,
                                        pieceId: dataSource.pieceId,
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
                        {dataSource.type === 'dice' ? 'ダイスコマ' : '文字列コマ'}
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
                        {dataSource.pieceId}
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
                    return <DicePieceValue.images state={dataSource.piece} size={22} />;
                }
                return <div>{StringPieceValue.stringify(dataSource.piece)}</div>;
            },
        },
        {
            key: '作成者',
            title: '作成者',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, dataSource: DataSource) => {
                const createdBy = dataSource.piece.ownerCharacterId;
                return (
                    <span>
                        {(createdBy == null ? undefined : characters.get(createdBy)?.name) ?? '?'}
                    </span>
                );
            },
        },
    ];

    const dataSource: DataSource[] = [
        ...[...dicePieces].map(([pieceId, piece]) => ({
            type: 'dice' as const,
            key: keyNames(pieceId, 'dice'),
            piece,
            pieceId,
        })),
        ...[...stringPieces].map(([pieceId, piece]) => ({
            type: 'string' as const,
            key: keyNames(pieceId, 'string'),
            piece,
            pieceId,
        })),
    ];
    return (
        <div>
            <Table columns={columns} dataSource={dataSource} size="small" pagination={false} />
        </div>
    );
};
