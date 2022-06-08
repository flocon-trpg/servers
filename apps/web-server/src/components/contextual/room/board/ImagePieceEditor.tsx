import React from 'react';
import { Button, Col, Row, Tooltip } from 'antd';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../../../hooks/useStateEditor';
import { State, imagePieceTemplate, simpleId } from '@flocon-trpg/core';
import { useMyUserUid } from '../../../../hooks/useMyUserUid';
import { close, create, ok, update } from '../../../../utils/constants';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { FilesManagerDrawerType, PiecePositionWithCell } from '../../../../utils/types';
import { CollaborativeInput } from '../../../ui/CollaborativeInput';
import { Subscribable } from 'rxjs';
import { useImagePieces } from '../../../../hooks/state/useImagePieces';
import { useCloneImagePiece } from '../../../../hooks/state/useCloneImagePiece';
import { InputFile } from '../file/InputFile';
import { FilePath } from '../../../../utils/file/filePath';
import { EditorGroupHeader } from '../../../ui/EditorGroupHeader';
import { FilesManagerDrawer } from '../file/FilesManagerDrawer';

type ImagePieceState = State<typeof imagePieceTemplate>;

const defaultImagePiece = (
    piecePosition: PiecePositionWithCell,
    ownerParticipantId: string | undefined
): ImagePieceState => ({
    ownerParticipantId,
    image: undefined,
    isPrivate: false,
    memo: undefined,
    name: undefined,
    opacity: undefined,
    isPositionLocked: false,

    ...piecePosition,

    $v: 2,
    $r: 1,
});

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

type ActionRequest = Subscribable<typeof ok | typeof close>;

export type Props =
    | {
          type: undefined;
      }
    | {
          type: typeof create;
          actionRequest: ActionRequest;
          boardId: string;
          piecePosition: PiecePositionWithCell;
      }
    | {
          type: typeof update;
          actionRequest: ActionRequest;
          boardId: string;
          pieceId: string;
      };

export const ImagePieceEditor: React.FC<Props> = props => {
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const imagePieces = useImagePieces(props.type === update ? props.boardId : undefined);
    const clone = useCloneImagePiece();

    let stateEditorParams: StateEditorParams<ImagePieceState | undefined> | undefined;
    switch (props.type) {
        case undefined:
            stateEditorParams = undefined;
            break;
        case create:
            stateEditorParams = {
                type: create,
                createInitState: () => defaultImagePiece(props.piecePosition, undefined),
                onCreate: newState => {
                    if (newState == null || props.type !== create) {
                        return;
                    }
                    const id = simpleId();
                    setRoomState(roomState => {
                        const imagePieces = roomState.boards?.[props.boardId]?.imagePieces;
                        if (imagePieces == null) {
                            return;
                        }
                        imagePieces[id] = newState;
                    });
                },
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: imagePieces?.get(props.pieceId),
                updateWithImmer: newState => {
                    if (myUserUid == null || props.type !== update) {
                        return;
                    }
                    const boardId = props.boardId;
                    const pieceId = props.pieceId;
                    setRoomState(roomState => {
                        const imagePieces = roomState.boards?.[boardId]?.imagePieces;
                        if (imagePieces == null) {
                            return;
                        }
                        imagePieces[pieceId] = newState;
                    });
                },
            };
            break;
    }
    const { state, updateState, ok } = useStateEditor(stateEditorParams);
    const actionRequest = props.type == null ? undefined : props.actionRequest;
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

    if (myUserUid == null || state == null) {
        return null;
    }

    return (
        <>
            <div>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>ID</Col>
                    <Col span={inputSpan}>{props.type === update ? props.pieceId : '(なし)'}</Col>
                </Row>

                <div style={{ height: 8 }} />

                {props.type !== update ? null : (
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
                                                boardId: props.boardId,
                                                pieceId: props.pieceId,
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
