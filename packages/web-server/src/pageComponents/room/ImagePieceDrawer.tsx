import { Button, Col, Drawer, Row, Tooltip, Typography } from 'antd';
import React from 'react';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { DrawerProps } from 'antd/lib/drawer';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../hooks/useStateEditor';
import {
    ImagePieceValueState,
    simpleId,
} from '@flocon-trpg/core';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { useImagePieceValues } from '../../hooks/state/useImagePieceValues';
import { InputFile } from '../../components/InputFile';
import { FilesManagerDrawerType } from '../../utils/types';
import { FilesManagerDrawer } from '../../components/FilesManagerDrawer';
import { BufferedInput } from '../../components/BufferedInput';
import { BufferedTextArea } from '../../components/BufferedTextArea';
import { FilePath } from '../../utils/filePath';
import { useAtomValue } from 'jotai/utils';
import { imagePieceDrawerAtom } from '../../atoms/overlay/imagePieceDrawerAtom';
import { create, update } from '../../utils/constants';
import { useAtom } from 'jotai';
import { useCloneImagePiece } from '../../hooks/state/useCloneImagePiece';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { EditorGroupHeader } from '../../components/EditorGroupHeader';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const defaultImagePieceValue: ImagePieceValueState = {
    $v: 2,
    $r: 1,

    // createするときはこれに自身のIDを入れなければならない
    ownerParticipantId: undefined,

    image: undefined,
    isPrivate: false,
    memo: '',
    name: '',
    pieces: {},
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const IdView: React.FC = () => {
    const drawerType = useAtomValue(imagePieceDrawerAtom);
    const myUserUid = useMyUserUid();

    if (drawerType == null || myUserUid == null) {
        return null;
    }

    return (
        <Row gutter={gutter} align='middle'>
            <Col flex='auto' />
            <Col flex={0}>ID</Col>
            <Col span={inputSpan}>{drawerType.type === update ? drawerType.stateId : '(なし)'}</Col>
        </Row>
    );
};

export const ImagePieceDrawer: React.FC = () => {
    const [drawerType, setDrawerType] = useAtom(imagePieceDrawerAtom);
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const imagePieces = useImagePieceValues();
    const clone = useCloneImagePiece();
    let stateEditorParams: StateEditorParams<ImagePieceValueState | undefined>;
    switch (drawerType?.type) {
        case create:
        case undefined:
            stateEditorParams = {
                type: create,
                initState: defaultImagePieceValue,
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: imagePieces?.find(value => value.id === drawerType.stateId)?.value,
                onUpdate: newState => {
                    if (myUserUid == null || drawerType?.type !== update) {
                        return;
                    }
                    const stateId = drawerType.stateId;
                    setRoomState(roomState => {
                        roomState.imagePieceValues[stateId] = newState;
                    });
                },
            };
            break;
    }

    const { uiState, updateUiState, resetUiState } = useStateEditor<
        ImagePieceValueState | undefined
    >(stateEditorParams);
    const [filesManagerDrawerType, setFilesManagerDrawerType] =
        React.useState<FilesManagerDrawerType | null>(null);

    if (myUserUid == null || uiState == null) {
        return null;
    }

    let onCreate: (() => void) | undefined = undefined;
    // drawerType != nullを付けていることで、updateから閉じる際に一瞬onCreateボタンが出るのを防いでいる。ただし、これで適切なのかどうかは吟味していない
    if (drawerType != null && drawerType?.type === create) {
        onCreate = () => {
            const piece = drawerType.piece;
            const id = simpleId();
            setRoomState(roomState => {
                roomState.imagePieceValues[id] = {
                    ...uiState,
                    ownerParticipantId: myUserUid,
                    pieces:
                        piece == null
                            ? {}
                            : {
                                  [drawerType.piece.boardId]: piece,
                              },
                };
            });
            setDrawerType(null);
            resetUiState(defaultImagePieceValue);
        };
    }

    return (
        <Drawer
            {...drawerBaseProps}
            title={drawerType?.type == update ? '画像コマの編集' : '画像コマの新規作成'}
            visible={drawerType != null}
            closable
            onClose={() => setDrawerType(null)}
            footer={
                <DrawerFooter
                    close={{
                        textType: drawerType?.type === update ? 'close' : 'cancel',
                        onClick: () => setDrawerType(null),
                    }}
                    ok={onCreate == null ? undefined : { textType: 'create', onClick: onCreate }}
                />
            }
        >
            <div>
                <IdView />

                {drawerType?.type !== update ? null : (
                    <>
                        <EditorGroupHeader>複製</EditorGroupHeader>

                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}></Col>
                            <Col span={inputSpan}>
                                {/* TODO: 複製したことを何らかの形で通知したほうがいい */}
                                <Tooltip title='このコマを複製します。'>
                                    <Button
                                        size='small'
                                        onClick={() => {
                                            clone({ myUserUid, source: uiState });
                                        }}
                                    >
                                        このコマを複製
                                    </Button>
                                </Tooltip>
                            </Col>
                        </Row>
                    </>
                )}

                {/* TODO: isPrivateがまだ未実装 */}

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>画像</Col>
                    <Col span={inputSpan}>
                        <InputFile
                            filePath={uiState.image ?? undefined}
                            onPathChange={path =>
                                updateUiState(pieceValue => {
                                    if (pieceValue == null) {
                                        return;
                                    }
                                    pieceValue.image =
                                        path == null ? undefined : FilePath.toOt(path);
                                })
                            }
                            openFilesManager={setFilesManagerDrawerType}
                            showImage
                        />
                    </Col>
                </Row>

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>名前</Col>
                    <Col span={inputSpan}>
                        <BufferedInput
                            bufferDuration='default'
                            size='small'
                            value={uiState.name ?? ''}
                            onChange={e => {
                                if (e.previousValue === e.currentValue) {
                                    return;
                                }
                                updateUiState(pieceValue => {
                                    if (pieceValue == null) {
                                        return;
                                    }
                                    pieceValue.name = e.currentValue;
                                });
                            }}
                        />
                    </Col>
                </Row>

                <EditorGroupHeader>メモ</EditorGroupHeader>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}></Col>
                    <Col span={inputSpan}>
                        <BufferedTextArea
                            size='small'
                            bufferDuration='default'
                            value={uiState.memo ?? ''}
                            rows={8}
                            onChange={e =>
                                updateUiState(pieceValue => {
                                    if (pieceValue == null) {
                                        return;
                                    }
                                    pieceValue.memo = e.currentValue;
                                })
                            }
                        />
                    </Col>
                </Row>
            </div>

            <FilesManagerDrawer
                drawerType={filesManagerDrawerType}
                onClose={() => setFilesManagerDrawerType(null)}
            />
        </Drawer>
    );
};
