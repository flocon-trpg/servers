import { Button, Col, Drawer, Row, Tooltip, Typography } from 'antd';
import React from 'react';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { replace } from '../../stateManagers/states/types';
import { DrawerProps } from 'antd/lib/drawer';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../hooks/useStateEditor';
import { useSetRoomStateByApply } from '../../hooks/useSetRoomStateByApply';
import {
    UpOperation,
    ImagePieceValueState,
    imagePieceValueDiff,
    toImagePieceValueUpOperation,
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
import { keyNames } from '@flocon-trpg/utils';
import { useAtomValue } from 'jotai/utils';
import { imagePieceDrawerAtom } from '../../atoms/overlay/imagePieceDrawerAtom';
import { create, update } from '../../utils/constants';
import { useAtom } from 'jotai';
import { useCloneImagePiece } from '../../hooks/state/useCloneImagePiece';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const defaultImagePieceValue: ImagePieceValueState = {
    $v: 1,
    $r: 1,
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
            <Col span={inputSpan}>
                {drawerType.type === update
                    ? keyNames({
                          createdBy: drawerType.participantKey,
                          id: drawerType.stateKey,
                      })
                    : '(なし)'}
            </Col>
        </Row>
    );
};

export const ImagePieceDrawer: React.FC = () => {
    const [drawerType, setDrawerType] = useAtom(imagePieceDrawerAtom);
    const setRoomStateByApply = useSetRoomStateByApply();
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
                state: imagePieces?.find(
                    value =>
                        value.participantKey === drawerType.participantKey &&
                        value.valueId === drawerType.stateKey
                )?.value,
                onUpdate: ({ prevState, nextState }) => {
                    if (myUserUid == null || drawerType?.type !== update) {
                        return;
                    }
                    if (prevState == null || nextState == null) {
                        return;
                    }
                    const diff = imagePieceValueDiff({ prevState, nextState });
                    if (diff == null) {
                        return;
                    }
                    const operation: UpOperation = {
                        $v: 1,
                        $r: 2,
                        participants: {
                            [drawerType.participantKey]: {
                                type: update,
                                update: {
                                    $v: 1,
                                    $r: 2,
                                    imagePieceValues: {
                                        [drawerType.stateKey]: {
                                            type: update,
                                            update: toImagePieceValueUpOperation(diff),
                                        },
                                    },
                                },
                            },
                        },
                    };
                    setRoomStateByApply(operation);
                },
            };
            break;
    }

    const { uiState: state, updateUiState: setState } = useStateEditor<
        ImagePieceValueState | undefined
    >(stateEditorParams);
    const [filesManagerDrawerType, setFilesManagerDrawerType] =
        React.useState<FilesManagerDrawerType | null>(null);

    if (myUserUid == null || state == null) {
        return null;
    }

    let onCreate: (() => void) | undefined = undefined;
    // drawerType != nullを付けていることで、updateから閉じる際に一瞬onCreateボタンが出るのを防いでいる。ただし、これで適切なのかどうかは吟味していない
    if (drawerType != null && drawerType?.type === create) {
        onCreate = () => {
            const id = simpleId();
            const operation: UpOperation = {
                $v: 1,
                $r: 2,
                participants: {
                    [myUserUid]: {
                        type: update,
                        update: {
                            $v: 1,
                            $r: 2,
                            imagePieceValues: {
                                [id]: {
                                    type: replace,
                                    replace: {
                                        newValue: {
                                            ...state,
                                            pieces:
                                                drawerType.piece?.boardKey == null
                                                    ? {}
                                                    : {
                                                          [drawerType.piece.boardKey.createdBy]: {
                                                              [drawerType.piece.boardKey.id]:
                                                                  drawerType.piece,
                                                          },
                                                      },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };
            setRoomStateByApply(operation);
            setDrawerType(null);
            setState(defaultImagePieceValue);
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
                        <Typography.Title level={4}>複製</Typography.Title>

                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}></Col>
                            <Col span={inputSpan}>
                                {/* TODO: 複製したことを何らかの形で通知したほうがいい */}
                                <Tooltip title='このコマを複製します。'>
                                    <Button
                                        size='small'
                                        onClick={() => {
                                            clone({ myUserUid, source: state });
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
                            filePath={state.image ?? undefined}
                            onPathChange={path =>
                                setState({
                                    ...state,
                                    image: path == null ? undefined : FilePath.toOt(path),
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
                            value={state.name}
                            onChange={e => {
                                if (e.previousValue === e.currentValue) {
                                    return;
                                }
                                setState({ ...state, name: e.currentValue });
                            }}
                        />
                    </Col>
                </Row>

                <Typography.Title level={4}>メモ</Typography.Title>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}></Col>
                    <Col span={inputSpan}>
                        <BufferedTextArea
                            size='small'
                            bufferDuration='default'
                            value={state.memo}
                            rows={8}
                            onChange={e => setState({ ...state, memo: e.currentValue })}
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
