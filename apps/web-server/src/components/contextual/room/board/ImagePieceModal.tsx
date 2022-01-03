import { Button, Col, Modal, Row, Tooltip } from 'antd';
import React from 'react';
import { DialogFooter } from '../../../ui/DialogFooter';
import { DrawerProps } from 'antd/lib/drawer';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../../../hooks/useStateEditor';
import { ImagePieceState, simpleId } from '@flocon-trpg/core';
import { useMyUserUid } from '../../../../hooks/useMyUserUid';
import { useImagePieces } from '../../../../hooks/state/useImagePieces';
import { InputFile } from '../file/InputFile';
import { FilesManagerDrawerType, PiecePositionWithCell } from '../../../../utils/types';
import { FilesManagerDrawer } from '../file/FilesManagerDrawer';
import { BufferedInput } from '../../../ui/BufferedInput';
import { BufferedTextArea } from '../../../ui/BufferedTextArea';
import { FilePath } from '../../../../utils/file/filePath';
import { useAtomValue } from 'jotai/utils';
import { create, update } from '../../../../utils/constants';
import { atom, useAtom } from 'jotai';
import { useCloneImagePiece } from '../../../../hooks/state/useCloneImagePiece';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { EditorGroupHeader } from '../../../ui/EditorGroupHeader';

type ImagePieceModalType =
    | {
          type: typeof create;
          boardId: string;
          piecePosition: PiecePositionWithCell;
      }
    | {
          type: typeof update;
          boardId: string;
          pieceId: string;
      };

export const imagePieceModalAtom = atom<ImagePieceModalType | null>(null);

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const defaultImagePiece = (
    piecePosition: PiecePositionWithCell,
    ownerParticipantId: string | undefined
): ImagePieceState => ({
    $v: 2,
    $r: 1,

    ownerParticipantId,
    image: undefined,
    isPrivate: false,
    memo: undefined,
    name: undefined,
    opacity: undefined,
    isPositionLocked: false,
    ...piecePosition,
});

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const IdView: React.FC = () => {
    const drawerType = useAtomValue(imagePieceModalAtom);
    const myUserUid = useMyUserUid();

    if (drawerType == null || myUserUid == null) {
        return null;
    }

    return (
        <Row gutter={gutter} align='middle'>
            <Col flex='auto' />
            <Col flex={0}>ID</Col>
            <Col span={inputSpan}>{drawerType.type === update ? drawerType.pieceId : '(なし)'}</Col>
        </Row>
    );
};

export const ImagePieceModal: React.FC = () => {
    const [modalType, setModalType] = useAtom(imagePieceModalAtom);
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const imagePieces = useImagePieces(modalType?.boardId);
    const clone = useCloneImagePiece();
    let stateEditorParams: StateEditorParams<ImagePieceState | undefined> | undefined;
    switch (modalType?.type) {
        case undefined:
            stateEditorParams = undefined;
            break;
        case create:
            stateEditorParams = {
                type: create,
                initState: defaultImagePiece(modalType.piecePosition, myUserUid),
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: imagePieces?.get(modalType.pieceId),
                onUpdate: newState => {
                    if (myUserUid == null || modalType?.type !== update) {
                        return;
                    }
                    const boardId = modalType.boardId;
                    const pieceId = modalType.pieceId;
                    setRoomState(roomState => {
                        const imagePieces = roomState.boards[boardId]?.imagePieces;
                        if (imagePieces == null) {
                            return;
                        }
                        imagePieces[pieceId] = newState;
                    });
                },
            };
            break;
    }

    const { uiState, updateUiState, resetUiState } = useStateEditor<ImagePieceState | undefined>(
        stateEditorParams
    );
    const [filesManagerDrawerType, setFilesManagerDrawerType] =
        React.useState<FilesManagerDrawerType | null>(null);

    if (myUserUid == null || uiState == null) {
        return null;
    }

    let onCreate: (() => void) | undefined = undefined;
    // drawerType != nullを付けていることで、updateから閉じる際に一瞬onCreateボタンが出るのを防いでいる。ただし、これで適切なのかどうかは吟味していない
    if (modalType != null && modalType?.type === create) {
        onCreate = () => {
            const id = simpleId();
            setRoomState(roomState => {
                const imagePieces = roomState.boards[modalType.boardId]?.imagePieces;
                if (imagePieces == null) {
                    return;
                }
                imagePieces[id] = uiState;
            });
            setModalType(null);
            resetUiState(undefined);
        };
    }

    return (
        <Modal
            {...drawerBaseProps}
            title={modalType?.type == update ? '画像コマの編集' : '画像コマの新規作成'}
            visible={modalType != null}
            closable
            onCancel={() => setModalType(null)}
            footer={
                <DialogFooter
                    close={{
                        textType: modalType?.type === update ? 'close' : 'cancel',
                        onClick: () => setModalType(null),
                    }}
                    ok={onCreate == null ? undefined : { textType: 'create', onClick: onCreate }}
                />
            }
        >
            <div>
                <IdView />

                {modalType?.type !== update ? null : (
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
                                            clone({
                                                boardId: modalType.boardId,
                                                pieceId: modalType.pieceId,
                                            });
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
        </Modal>
    );
};
