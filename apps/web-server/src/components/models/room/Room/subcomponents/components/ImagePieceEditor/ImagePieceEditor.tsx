import React from 'react';
import { Button, Col, Row, Tooltip } from 'antd';
import { Gutter } from 'antd/lib/grid/row';
import { CreateModeParams, UpdateModeParams, useStateEditor } from '../../hooks/useStateEditor';
import { State, imagePieceTemplate, simpleId } from '@flocon-trpg/core';
import { useMyUserUid } from '../../../../../../../hooks/useMyUserUid';
import { close, ok } from '../../../../../../../utils/constants';
import { useSetRoomStateWithImmer } from '../../../../../../../hooks/useSetRoomStateWithImmer';
import { FilesManagerDrawerType } from '../../../../../../../utils/types';
import { CollaborativeInput } from '../../../../../../ui/CollaborativeInput/CollaborativeInput';
import { Subscribable } from 'rxjs';
import { useImagePieces } from '../../hooks/useImagePieces';
import { useCloneImagePiece } from '../../hooks/useCloneImagePiece';
import { InputFile } from '../../../../../file/InputFile/InputFile';
import { FilePath } from '../../../../../../../utils/file/filePath';
import { EditorGroupHeader } from '../../../../../../ui/EditorGroupHeader/EditorGroupHeader';
import { FilesManagerDrawer } from '../../../../../file/FilesManagerDrawer/FilesManagerDrawer';
import {
    CompositeRect,
    PixelPosition,
    PixelSize,
    applyCompositeRect,
} from '../../utils/positionAndSizeAndRect';
import { usePixelRectToCompositeRect } from '../../hooks/usePixelRectToCompositeRect';
import { PieceRectEditor } from '../RectEditor/RectEditor';
import { usePersistentMemo } from '../../../../../../../hooks/usePersistentMemo';

type ImagePieceState = State<typeof imagePieceTemplate>;

const defaultImagePiece = (
    piecePosition: CompositeRect,
    isCellMode: boolean,
    ownerParticipantId: string | undefined
): ImagePieceState => ({
    ...piecePosition,

    ownerParticipantId,
    isCellMode,

    image: undefined,
    isPrivate: false,
    memo: undefined,
    name: undefined,
    opacity: undefined,
    isPositionLocked: false,

    $v: 2,
    $r: 1,
});

const pieceSize: PixelSize = { w: 50, h: 50 };
const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

type ActionRequest = Subscribable<typeof ok | typeof close>;

export type CreateMode = {
    boardId: string;
    piecePosition: PixelPosition;
};

export type UpdateMode = {
    boardId: string;
    pieceId: string;
};

export const ImagePieceEditor: React.FC<{
    actionRequest?: ActionRequest;
    createMode?: CreateMode;
    updateMode?: UpdateMode;
}> = ({ actionRequest, createMode, updateMode }) => {
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const boardId = updateMode?.boardId ?? createMode?.boardId;
    const imagePieces = useImagePieces(boardId);
    const clone = useCloneImagePiece();
    const compositeRect = usePixelRectToCompositeRect({
        boardId: updateMode?.boardId ?? createMode?.boardId,
        pixelRect:
            createMode?.piecePosition == null
                ? undefined
                : { ...createMode.piecePosition, ...pieceSize },
    });
    const createModeParams: CreateModeParams<ImagePieceState | undefined> | undefined =
        usePersistentMemo(() => {
            if (createMode == null || myUserUid == null || compositeRect == null) {
                return undefined;
            }
            return {
                createInitState: () => defaultImagePiece(compositeRect, true, undefined),
                updateInitState: prevState => {
                    if (prevState == null) {
                        return;
                    }
                    applyCompositeRect({
                        state: prevState,
                        operation: compositeRect,
                    });
                },
                onCreate: newState => {
                    if (newState == null) {
                        return;
                    }
                    const id = simpleId();
                    setRoomState(roomState => {
                        const imagePieces = roomState.boards?.[createMode.boardId]?.imagePieces;
                        if (imagePieces == null) {
                            return;
                        }
                        imagePieces[id] = { ...newState, ownerParticipantId: myUserUid };
                    });
                },
            };
        }, [compositeRect, createMode, myUserUid, setRoomState]);
    const updateModeParams: UpdateModeParams<ImagePieceState | undefined> | undefined =
        usePersistentMemo(() => {
            if (updateMode == null) {
                return undefined;
            }
            return {
                state: imagePieces?.get(updateMode.pieceId),
                updateWithImmer: newState => {
                    if (myUserUid == null) {
                        return;
                    }
                    const boardId = updateMode.boardId;
                    const pieceId = updateMode.pieceId;
                    setRoomState(roomState => {
                        const imagePieces = roomState.boards?.[boardId]?.imagePieces;
                        if (imagePieces == null) {
                            return;
                        }
                        imagePieces[pieceId] = newState;
                    });
                },
            };
        }, [imagePieces, myUserUid, setRoomState, updateMode]);
    const { state, updateState, ok } = useStateEditor({
        createMode: createModeParams,
        updateMode: updateModeParams,
    });
    React.useEffect(() => {
        if (actionRequest == null) {
            return;
        }
        const subscription = actionRequest.subscribe({
            next: value => {
                switch (value) {
                    case 'ok':
                        ok();
                        break;
                }
            },
        });
        return () => subscription.unsubscribe();
    }, [actionRequest, ok]);

    const [filesManagerDrawerType, setFilesManagerDrawerType] =
        React.useState<FilesManagerDrawerType | null>(null);

    if (myUserUid == null || state == null || boardId == null) {
        return null;
    }

    return (
        <>
            <div>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>ID</Col>
                    <Col span={inputSpan}>{updateMode != null ? updateMode.pieceId : '(なし)'}</Col>
                </Row>

                <div style={{ height: 8 }} />

                <PieceRectEditor
                    value={state}
                    onChange={newState => updateState(() => newState)}
                    boardId={boardId}
                />

                {updateMode == null ? null : (
                    <>
                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}></Col>
                            <Col span={inputSpan}>
                                {/* TODO: 複製したことを何らかの形で通知したほうがいい */}
                                <Tooltip title='このコマを複製します。'>
                                    <Button
                                        size='small'
                                        onClick={() => {
                                            clone({
                                                boardId: updateMode.boardId,
                                                pieceId: updateMode.pieceId,
                                            });
                                        }}
                                    >
                                        このコマを複製
                                    </Button>
                                </Tooltip>
                            </Col>
                        </Row>
                        <div style={{ height: 8 }} />
                    </>
                )}

                {/* TODO: isPrivateがまだ未実装 */}

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>画像</Col>
                    <Col span={inputSpan}>
                        <InputFile
                            filePath={state.image ?? undefined}
                            onPathChange={path =>
                                updateState(pieceValue => {
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
                        <CollaborativeInput
                            bufferDuration='default'
                            size='small'
                            value={state.name ?? ''}
                            onChange={e => {
                                if (e.previousValue === e.currentValue) {
                                    return;
                                }
                                updateState(pieceValue => {
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
                        <CollaborativeInput
                            multiline
                            size='small'
                            bufferDuration='default'
                            value={state.memo ?? ''}
                            onChange={e =>
                                updateState(pieceValue => {
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
        </>
    );
};
