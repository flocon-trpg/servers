import { Col, Drawer, Row, Typography } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import { simpleId } from '../../utils/generators';
import { replace } from '../../stateManagers/states/types';
import { DrawerProps } from 'antd/lib/drawer';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../hooks/useStateEditor';
import { useOperate } from '../../hooks/useOperate';
import {
    UpOperation,
    ImagePieceValueState,
    imagePieceValueDiff,
    toImagePieceValueUpOperation,
} from '@kizahasi/flocon-core';
import { compositeKeyToString } from '@kizahasi/util';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../store';
import {
    create,
    roomDrawerAndPopoverModule,
    update,
} from '../../modules/roomDrawerAndPopoverModule';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { useImagePieces } from '../../hooks/state/useImagePieces';
import BufferedTextArea from '../../components/BufferedTextArea';
import InputFile from '../../components/InputFile';
import { FilePath, FilesManagerDrawerType } from '../../utils/types';
import FilesManagerDrawer from '../../components/FilesManagerDrawer';
import BufferedInput from '../../components/BufferedInput';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const defaultImagePieceValue: ImagePieceValueState = {
    $version: 1,
    image: undefined,
    isPrivate: false,
    memo: '',
    name: '',
    pieces: {},
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const IdView: React.FC = () => {
    const drawerType = useSelector(state => state.roomDrawerAndPopoverModule.imagePieceDrawerType);
    const myUserUid = useMyUserUid();

    if (drawerType == null || myUserUid == null) {
        return null;
    }

    return (
        <Row gutter={gutter} align="middle">
            <Col flex="auto" />
            <Col flex={0}>ID</Col>
            <Col span={inputSpan}>
                {drawerType.type === update
                    ? compositeKeyToString({
                          createdBy: drawerType.participantKey,
                          id: drawerType.stateKey,
                      })
                    : '(なし)'}
            </Col>
        </Row>
    );
};

export const ImagePieceDrawer: React.FC = () => {
    const drawerType = useSelector(state => state.roomDrawerAndPopoverModule.imagePieceDrawerType);
    const dispatch = useDispatch();
    const operate = useOperate();
    const myUserUid = useMyUserUid();
    const imagePieces = useImagePieces();
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
                        $version: 1,
                        participants: {
                            [drawerType.participantKey]: {
                                type: update,
                                update: {
                                    $version: 1,
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
                    operate(operation);
                },
            };
            break;
    }

    const { uiState: state, updateUiState: setState } = useStateEditor<
        ImagePieceValueState | undefined
    >(stateEditorParams);
    const [
        filesManagerDrawerType,
        setFilesManagerDrawerType,
    ] = React.useState<FilesManagerDrawerType | null>(null);

    if (myUserUid == null || state == null) {
        return null;
    }

    let onCreate: (() => void) | undefined = undefined;
    // drawerType != nullを付けていることで、updateから閉じる際に一瞬onCreateボタンが出るのを防いでいる。ただし、これで適切なのかどうかは吟味していない
    if (drawerType != null && drawerType?.type === create) {
        onCreate = () => {
            const id = simpleId();
            const operation: UpOperation = {
                $version: 1,
                participants: {
                    [myUserUid]: {
                        type: update,
                        update: {
                            $version: 1,
                            imagePieceValues: {
                                [id]: {
                                    type: replace,
                                    replace: {
                                        newValue: {
                                            ...state,
                                            pieces:
                                                drawerType.boardKey == null
                                                    ? {}
                                                    : {
                                                          [drawerType.boardKey.createdBy]: {
                                                              [drawerType.boardKey.id]:
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
            operate(operation);
            dispatch(roomDrawerAndPopoverModule.actions.set({ imagePieceDrawerType: null }));
            setState(undefined);
        };
    }

    return (
        <Drawer
            {...drawerBaseProps}
            title={drawerType?.type == update ? '画像コマの編集' : '画像コマの新規作成'}
            visible={drawerType != null}
            closable
            onClose={() =>
                dispatch(roomDrawerAndPopoverModule.actions.set({ imagePieceDrawerType: null }))
            }
            footer={
                <DrawerFooter
                    close={{
                        textType: drawerType?.type === update ? 'close' : 'cancel',
                        onClick: () =>
                            dispatch(
                                roomDrawerAndPopoverModule.actions.set({
                                    imagePieceDrawerType: null,
                                })
                            ),
                    }}
                    ok={onCreate == null ? undefined : { textType: 'create', onClick: onCreate }}
                />
            }
        >
            <div>
                <IdView />

                {/* TODO: isPrivateがまだ未実装 */}

                <Row gutter={gutter} align="middle">
                    <Col flex="auto" />
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

                <Row gutter={gutter} align="middle">
                    <Col flex="auto" />
                    <Col flex={0}>名前</Col>
                    <Col span={inputSpan}>
                        <BufferedInput
                            bufferDuration="default"
                            size="small"
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
                <Row gutter={gutter} align="middle">
                    <Col flex="auto" />
                    <Col flex={0}></Col>
                    <Col span={inputSpan}>
                        <BufferedTextArea
                            size="small"
                            bufferDuration="default"
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
