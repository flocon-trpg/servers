import { Button, Input, Menu, Modal, Popover, Progress, Tooltip } from 'antd';
import React from 'react';
import { useDispatch } from 'react-redux';
import {
    DeleteRoomFailureType,
    ParticipantRole,
    PromoteFailureType,
    useChangeParticipantNameMutation,
    useDeleteRoomMutation,
    useGetLogLazyQuery,
    useLeaveRoomMutation,
    usePromoteToPlayerMutation,
    useRequiresPhraseToJoinAsPlayerLazyQuery,
} from '../../generated/graphql';
import roomConfigModule from '../../modules/roomConfigModule';
import { useSelector } from '../../store';
import * as Icon from '@ant-design/icons';
import { boardEditorPanel, chatPalettePanel } from '../../states/RoomConfig';
import VolumeBarPanel from './VolumeBarPanel';
import { Jdenticon } from '../../components/Jdenticon';
import { roomModule, Notification } from '../../modules/roomModule';
import path from '../../utils/path';
import { useRouter } from 'next/router';
import { defaultMessagePanelConfig } from '../../states/MessagePanelConfig';
import fileDownload from 'js-file-download';
import { generateAsRichLog, generateAsStaticHtml } from '../../utils/roomLogGenerator';
import moment from 'moment';
import { usePublicChannelNames } from '../../hooks/state/usePublicChannelNames';
import { useParticipants } from '../../hooks/state/useParticipants';
import { recordToArray } from '@kizahasi/util';
import { roomDrawerAndPopoverAndModalModule } from '../../modules/roomDrawerAndPopoverAndModalModule';
import { defaultMemoPanelConfig } from '../../states/MemoPanelConfig';
import FilesManagerDrawer from '../../components/FilesManagerDrawer';
import { FilesManagerDrawerType, none } from '../../utils/types';
import { useReadonlyRef } from '../../hooks/useReadonlyRef';
import { useMe } from '../../hooks/useMe';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { useSignOut } from '../../hooks/useSignOut';
import ConfigContext from '../../contexts/ConfigContext';
import { FirebaseStorageUrlCacheContext } from '../../contexts/FirebaseStorageUrlCacheContext';
import { ChannelsFilter, ChannelsFilterOptions } from '../../components/ChannelsFilter';
import classNames from 'classnames';
import { flex, flexColumn, flexRow, itemsCenter } from '../../utils/className';
import { FirebaseAuthenticationIdTokenContext } from '../../contexts/FirebaseAuthenticationIdTokenContext';
import { MyAuthContext } from '../../contexts/MyAuthContext';

type BecomePlayerModalProps = {
    roomId: string;
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
};

const BecomePlayerModal: React.FC<BecomePlayerModalProps> = ({
    roomId,
    visible,
    onOk,
    onCancel,
}: BecomePlayerModalProps) => {
    const dispatch = useDispatch();
    const [inputValue, setInputValue] = React.useState('');
    const [isPosting, setIsPosting] = React.useState(false);
    const [promoteToPlayer] = usePromoteToPlayerMutation();
    const [requiresPhraseToJoinAsPlayer, requiresPhraseToJoinAsPlayerResult] =
        useRequiresPhraseToJoinAsPlayerLazyQuery();
    const requiresPhraseToJoinAsPlayerRef = React.useRef(requiresPhraseToJoinAsPlayer);
    React.useEffect(() => {
        requiresPhraseToJoinAsPlayerRef.current = requiresPhraseToJoinAsPlayer;
    }, [requiresPhraseToJoinAsPlayer]);
    React.useEffect(() => {
        setInputValue('');
        setIsPosting(false);
        requiresPhraseToJoinAsPlayerRef.current({ variables: { roomId } });
    }, [visible, roomId]);

    const title = '参加者に昇格';

    if (
        requiresPhraseToJoinAsPlayerResult.data?.result.__typename !== 'RequiresPhraseSuccessResult'
    ) {
        return (
            <Modal
                visible={visible}
                title={title}
                okButtonProps={{ disabled: true }}
                onCancel={() => onCancel()}
            >
                サーバーと通信中です…
            </Modal>
        );
    }
    if (requiresPhraseToJoinAsPlayerResult.data.result.value) {
        return (
            <Modal
                visible={visible}
                title={title}
                okButtonProps={{ disabled: isPosting }}
                onOk={() => {
                    setIsPosting(true);
                    promoteToPlayer({ variables: { roomId, phrase: inputValue } }).then(e => {
                        if (e.errors != null) {
                            dispatch(
                                roomModule.actions.addNotification({
                                    type: Notification.graphQLErrors,
                                    createdAt: new Date().getTime(),
                                    errors: e.errors,
                                })
                            );
                            onOk();
                            return;
                        }

                        if (e.data?.result.failureType != null) {
                            let text: string | undefined;
                            switch (e.data?.result.failureType) {
                                case PromoteFailureType.WrongPhrase:
                                    text = 'フレーズが誤っています。';
                                    break;
                                case PromoteFailureType.NoNeedToPromote:
                                    text = '既に昇格済みです。';
                                    break;
                                default:
                                    text = undefined;
                                    break;
                            }
                            dispatch(
                                roomModule.actions.addNotification({
                                    type: 'text',
                                    notification: {
                                        type: 'warning',
                                        message: '参加者への昇格に失敗しました。',
                                        description: text,
                                        createdAt: new Date().getTime(),
                                    },
                                })
                            );
                            onOk();
                            return;
                        }

                        onOk();
                    });
                }}
                onCancel={() => onCancel()}
            >
                <Input
                    placeholder='フレーズ'
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                />
            </Modal>
        );
    }
    return (
        <Modal
            visible={visible}
            title={title}
            okButtonProps={{ disabled: isPosting }}
            onOk={() => {
                setIsPosting(true);
                promoteToPlayer({ variables: { roomId } }).then(e => {
                    if (e.errors != null) {
                        dispatch(
                            roomModule.actions.addNotification({
                                type: Notification.graphQLErrors,
                                createdAt: new Date().getTime(),
                                errors: e.errors,
                            })
                        );
                        onOk();
                        return;
                    }

                    if (e.data?.result.failureType != null) {
                        let text: string | undefined;
                        switch (e.data?.result.failureType) {
                            case PromoteFailureType.WrongPhrase:
                                text = 'フレーズが誤っています。';
                                break;
                            case PromoteFailureType.NoNeedToPromote:
                                text = '既に昇格済みです。';
                                break;
                            default:
                                text = undefined;
                                break;
                        }
                        dispatch(
                            roomModule.actions.addNotification({
                                type: 'text',
                                notification: {
                                    type: 'warning',
                                    message: '参加者への昇格に失敗しました。',
                                    description: text,
                                    createdAt: new Date().getTime(),
                                },
                            })
                        );
                        onOk();
                        return;
                    }

                    onOk();
                });
            }}
            onCancel={() => onCancel()}
        >
            フレーズなしで参加者に昇格できます。昇格しますか？
        </Modal>
    );
};

type DeleteRoomModalProps = {
    roomId: string;
    roomCreatedByMe: boolean;
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
};

const DeleteRoomModal: React.FC<DeleteRoomModalProps> = ({
    roomId,
    visible,
    onOk,
    onCancel,
    roomCreatedByMe,
}: DeleteRoomModalProps) => {
    const dispatch = useDispatch();
    const [isPosting, setIsPosting] = React.useState(false);
    const [deleteRoom] = useDeleteRoomMutation();
    React.useEffect(() => {
        setIsPosting(false);
    }, [visible, roomId]);

    const disabled = isPosting || !roomCreatedByMe;
    return (
        <Modal
            visible={visible}
            title='部屋の削除'
            okButtonProps={{ disabled }}
            okType='danger'
            okText='削除する'
            cancelText={disabled ? '閉じる' : 'キャンセル'}
            onOk={() => {
                setIsPosting(true);
                deleteRoom({ variables: { id: roomId } }).then(e => {
                    if (e.errors != null) {
                        dispatch(
                            roomModule.actions.addNotification({
                                type: Notification.graphQLErrors,
                                createdAt: new Date().getTime(),
                                errors: e.errors,
                            })
                        );
                        onOk();
                        return;
                    }

                    if (e.data?.result.failureType != null) {
                        let text: string | undefined;
                        switch (e.data?.result.failureType) {
                            case DeleteRoomFailureType.NotCreatedByYou:
                                text = 'この部屋の作成者でないため、削除できません。';
                                break;
                            default:
                                text = undefined;
                                break;
                        }
                        dispatch(
                            roomModule.actions.addNotification({
                                type: 'text',
                                notification: {
                                    type: 'warning',
                                    message: '部屋の削除に失敗しました。',
                                    description: text,
                                    createdAt: new Date().getTime(),
                                },
                            })
                        );
                        onOk();
                        return;
                    }

                    onOk();
                });
            }}
            onCancel={() => onCancel()}
        >
            {roomCreatedByMe ? (
                <div>
                    <p>
                        この部屋を削除します。この部屋を作成したユーザーでない限り、部屋を削除することはできません。
                    </p>
                    <p style={{ fontWeight: 'bold' }}>
                        部屋を削除すると元に戻すことはできず、ログ出力もできません。
                    </p>
                    <p>本当によろしいですか？</p>
                </div>
            ) : (
                <div>この部屋の作成者でないため、削除することができません。</div>
            )}
        </Modal>
    );
};

type GenerateSimpleLogModalProps = {
    roomId: string;
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
};

const GenerateSimpleLogModal: React.FC<GenerateSimpleLogModalProps> = ({
    roomId,
    visible,
    onOk,
    onCancel,
}: GenerateSimpleLogModalProps) => {
    const publicChannelNames = usePublicChannelNames();
    const publicChannelNamesRef = useReadonlyRef(publicChannelNames);
    const participants = useParticipants();
    const participantsRef = useReadonlyRef(participants);
    const [channelsFilterOptions, setChannelsFilterOptions] = React.useState(
        ChannelsFilterOptions.defaultValue
    );
    const channelsFilterOptionsRef = useReadonlyRef(channelsFilterOptions);

    const [getLogQuery, getLogQueryResult] = useGetLogLazyQuery({ fetchPolicy: 'network-only' });

    React.useEffect(() => {
        const data = getLogQueryResult.data;
        if (data == null) {
            return;
        }
        if (data.result.__typename !== 'RoomMessages') {
            // TODO: エラーメッセージを出す
            return;
        }
        if (publicChannelNamesRef.current == null || participantsRef.current == null) {
            return;
        }
        fileDownload(
            generateAsStaticHtml({
                ...publicChannelNamesRef.current,
                messages: data.result,
                participants: participantsRef.current,
                filter: ChannelsFilterOptions.toFilter(channelsFilterOptionsRef.current),
            }),
            `log_${moment(new Date()).format('YYYYMMDDHHmmss')}.html`
        );
    }, [getLogQueryResult.data, participantsRef, publicChannelNamesRef, channelsFilterOptionsRef]);

    if (publicChannelNames == null) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            title='ログのダウンロード'
            onOk={() => {
                getLogQuery({ variables: { roomId } });
                onOk();
            }}
            onCancel={() => onCancel()}
        >
            <div className={classNames(flex, flexColumn)}>
                <div style={{ marginBottom: 8 }}>
                    ログには、秘話などの非公開情報も含めることが可能です。また、ログをダウンロードすると、システムメッセージによって全員に通知されます。
                </div>
                <ChannelsFilter
                    value={channelsFilterOptions}
                    onChange={setChannelsFilterOptions}
                    disabled={false}
                />
            </div>
        </Modal>
    );
};

type GenerateRichLogModalProps = {
    roomId: string;
    visible: boolean;
    onCancel: () => void;
};

const GenerateRichLogModal: React.FC<GenerateRichLogModalProps> = ({
    roomId,
    visible,
    onCancel,
}: GenerateRichLogModalProps) => {
    const config = React.useContext(ConfigContext);
    const configRef = useReadonlyRef(config);
    const firebaseStorageUrlCacheContext = React.useContext(FirebaseStorageUrlCacheContext);
    const firebaseStorageUrlCacheContextRef = useReadonlyRef(firebaseStorageUrlCacheContext);
    const idToken = React.useContext(FirebaseAuthenticationIdTokenContext);

    const publicChannelNames = usePublicChannelNames();
    const publicChannelNamesRef = useReadonlyRef(publicChannelNames);
    const participants = useParticipants();
    const participantsRef = useReadonlyRef(participants);
    const [channelsFilterOptions, setChannelsFilterOptions] = React.useState(
        ChannelsFilterOptions.defaultValue
    );
    const channelsFilterOptionsRef = useReadonlyRef(channelsFilterOptions);

    // undefinedならばダウンロード
    const [progress, setProgress] = React.useState<number>();
    const [errorMessage, setErrorMessage] = React.useState<string>();
    React.useEffect(() => {
        setProgress(undefined);
        setErrorMessage(undefined);
    }, [visible]);

    const [getLogQuery, getLogQueryResult] = useGetLogLazyQuery({ fetchPolicy: 'network-only' });

    React.useEffect(() => {
        const main = async () => {
            if (idToken == null) {
                return;
            }
            const data = getLogQueryResult.data;
            if (data == null) {
                return;
            }
            if (data.result.__typename !== 'RoomMessages') {
                // TODO: エラーメッセージを出す
                return;
            }
            if (
                publicChannelNamesRef.current == null ||
                participantsRef.current == null ||
                firebaseStorageUrlCacheContextRef.current == null
            ) {
                return;
            }

            const zipBlob = await generateAsRichLog({
                params: {
                    ...publicChannelNamesRef.current,
                    messages: data.result,
                    participants: participantsRef.current,
                    filter: ChannelsFilterOptions.toFilter(channelsFilterOptionsRef.current),
                },
                config: configRef.current,
                idToken,
                firebaseStorageUrlCache: firebaseStorageUrlCacheContextRef.current,
                onProgressChange: p => setProgress(p.percent),
            }).catch(err => {
                setProgress(undefined);
                setErrorMessage(err.message);
                return null;
            });
            if (zipBlob == null) {
                return;
            }
            setProgress(100);
            fileDownload(zipBlob, `log_${moment(new Date()).format('YYYYMMDDHHmmss')}.zip`);
        };
        main();
    }, [
        getLogQueryResult.data,
        participantsRef,
        publicChannelNamesRef,
        configRef,
        firebaseStorageUrlCacheContextRef,
        channelsFilterOptionsRef,
        idToken,
    ]);

    if (publicChannelNames == null) {
        return null;
    }

    const isDownloading = progress != null && progress !== 100;

    return (
        <Modal
            visible={visible}
            width={700}
            closable={false}
            maskClosable={!isDownloading}
            title='ログのダウンロード'
            okButtonProps={{ style: { display: 'none' } }}
            cancelText='閉じる'
            cancelButtonProps={{ disabled: isDownloading }}
            onCancel={() => onCancel()}
        >
            <div className={classNames(flex, flexColumn)}>
                <div>
                    <p>
                        ログには、秘話などの非公開情報も含めることが可能です。また、ログをダウンロードすると、システムメッセージによって全員に通知されます。
                    </p>
                    <p>
                        キャラクターの画像もあわせてダウンロードするため、zipファイル生成までに数十秒程度の時間がかかることがあります。
                    </p>
                </div>
                <ChannelsFilter
                    value={channelsFilterOptions}
                    onChange={setChannelsFilterOptions}
                    disabled={isDownloading}
                />
                <Button
                    style={{ alignSelf: 'start', marginTop: 8 }}
                    type='primary'
                    disabled={isDownloading}
                    onClick={() => {
                        getLogQuery({ variables: { roomId } });
                        setProgress(0);
                        setErrorMessage(undefined);
                    }}
                >
                    ログ生成を開始
                </Button>
                {progress != null && (
                    <Progress
                        percent={progress}
                        status={
                            progress === 100
                                ? 'success'
                                : errorMessage == null
                                ? 'normal'
                                : 'exception'
                        }
                    />
                )}
                {progress === 100 && (
                    <div>
                        zipファイル生成が完了しました。間もなくzipファイルのダウンロードが開始されます。
                    </div>
                )}
                {errorMessage != null && <div>{errorMessage}</div>}
            </div>
        </Modal>
    );
};

type ChangeMyParticipantNameModalProps = {
    roomId: string;
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
};

const ChangeMyParticipantNameModal: React.FC<ChangeMyParticipantNameModalProps> = ({
    roomId,
    visible,
    onOk: onOkCore,
    onCancel,
}: ChangeMyParticipantNameModalProps) => {
    const dispatch = useDispatch();
    const [inputValue, setInputValue] = React.useState('');
    const [isPosting, setIsPosting] = React.useState(false);
    const [changeParticipantName] = useChangeParticipantNameMutation();
    React.useEffect(() => {
        setInputValue('');
        setIsPosting(false);
    }, [visible, roomId]);

    const onOk = () => {
        setIsPosting(true);
        changeParticipantName({ variables: { roomId, newName: inputValue } }).then(e => {
            if (e.errors != null) {
                dispatch(
                    roomModule.actions.addNotification({
                        type: Notification.graphQLErrors,
                        createdAt: new Date().getTime(),
                        errors: e.errors,
                    })
                );
                onOkCore();
                return;
            }

            if (e.data?.result.failureType != null) {
                dispatch(
                    roomModule.actions.addNotification({
                        type: Notification.text,
                        notification: {
                            type: 'warning',
                            message: '名前の変更に失敗しました。',
                            createdAt: new Date().getTime(),
                        },
                    })
                );
                onOkCore();
                return;
            }

            onOkCore();
        });
    };

    return (
        <Modal
            visible={visible}
            title='名前を変更'
            okButtonProps={{ disabled: isPosting }}
            onOk={() => onOk()}
            onCancel={() => onCancel()}
        >
            <Input
                placeholder='新しい名前'
                autoFocus
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onPressEnter={() => onOk()}
            />
        </Modal>
    );
};

export const RoomMenu: React.FC = () => {
    const me = useMe();
    const myUserUid = useMyUserUid();
    const myAuth = React.useContext(MyAuthContext);
    const router = useRouter();
    const dispatch = useDispatch();
    const signOut = useSignOut();
    const roomId = useSelector(state => state.roomModule.roomId);
    const createdBy = useSelector(state => state.roomModule.roomState?.state?.createdBy);

    const activeBoardPanel = useSelector(state => state.roomConfigModule?.panels.activeBoardPanel);
    const boardPanels = useSelector(state => state.roomConfigModule?.panels.boardEditorPanels);
    const characterPanel = useSelector(state => state.roomConfigModule?.panels.characterPanel);
    const chatPalettePanels = useSelector(
        state => state.roomConfigModule?.panels.chatPalettePanels
    );
    const gameEffectPanel = useSelector(state => state.roomConfigModule?.panels.gameEffectPanel);
    const participantPanel = useSelector(state => state.roomConfigModule?.panels.participantPanel);
    const memoPanels = useSelector(state => state.roomConfigModule?.panels.memoPanels);
    const messagePanels = useSelector(state => state.roomConfigModule?.panels.messagePanels);
    const pieceValuePanel = useSelector(state => state.roomConfigModule?.panels.pieceValuePanel);
    const [leaveRoomMutation] = useLeaveRoomMutation();
    const [isBecomePlayerModalVisible, setIsBecomePlayerModalVisible] = React.useState(false);
    const [isChangeMyParticipantNameModalVisible, setIsChangeMyParticipantNameModalVisible] =
        React.useState(false);
    const [isDeleteRoomModalVisible, setIsDeleteRoomModalVisible] = React.useState(false);
    const [isGenerateSimpleLogModalVisible, setIsGenerateSimpleLogModalVisible] =
        React.useState(false);
    const [isGenerateRichLogModalVisible, setIsGenerateRichLogModalVisible] = React.useState(false);
    const [filesManagerDrawerType, setFilesManagerDrawerType] =
        React.useState<FilesManagerDrawerType | null>(null);

    if (
        me == null ||
        myUserUid == null ||
        typeof myAuth === 'string' ||
        roomId == null ||
        activeBoardPanel == null ||
        boardPanels == null ||
        characterPanel == null ||
        chatPalettePanels == null ||
        gameEffectPanel == null ||
        participantPanel == null ||
        memoPanels == null ||
        messagePanels == null ||
        pieceValuePanel == null
    ) {
        return null;
    }

    return (
        <>
            <Menu triggerSubMenuAction='click' selectable={false} mode='horizontal'>
                <Menu.Item onClick={() => router.push('/')}>
                    <img src='/logo.png' width={24} height={24} />
                </Menu.Item>
                <Menu.SubMenu title='部屋'>
                    <Menu.Item
                        onClick={() =>
                            dispatch(
                                roomDrawerAndPopoverAndModalModule.actions.set({
                                    editRoomDrawerVisibility: true,
                                })
                            )
                        }
                    >
                        編集
                    </Menu.Item>
                    <Menu.Item onClick={() => setIsDeleteRoomModalVisible(true)}>
                        <span style={{ color: 'red' }}>削除</span>
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item onClick={() => setIsGenerateSimpleLogModalVisible(true)}>
                        ログをダウンロード（旧）
                    </Menu.Item>
                    <Menu.Item onClick={() => setIsGenerateRichLogModalVisible(true)}>
                        ログをダウンロード（新）
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu title='ウィンドウ'>
                    <Menu.Item
                        onClick={() => {
                            dispatch(
                                roomConfigModule.actions.setIsMinimized({
                                    roomId,
                                    target: { type: 'characterPanel' },
                                    newValue: false,
                                })
                            );
                            dispatch(
                                roomConfigModule.actions.bringPanelToFront({
                                    roomId,
                                    target: { type: 'characterPanel' },
                                })
                            );
                        }}
                    >
                        <div>
                            <span>
                                {characterPanel.isMinimized ? (
                                    <Icon.BorderOutlined />
                                ) : (
                                    <Icon.CheckSquareOutlined />
                                )}
                            </span>
                            <span>キャラクター一覧</span>
                        </div>
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            dispatch(
                                roomConfigModule.actions.setIsMinimized({
                                    roomId,
                                    target: { type: 'activeBoardPanel' },
                                    newValue: false,
                                })
                            );
                            dispatch(
                                roomConfigModule.actions.bringPanelToFront({
                                    roomId,
                                    target: { type: 'activeBoardPanel' },
                                })
                            );
                        }}
                    >
                        <div>
                            <span>
                                {activeBoardPanel.isMinimized ? (
                                    <Icon.BorderOutlined />
                                ) : (
                                    <Icon.CheckSquareOutlined />
                                )}
                            </span>
                            <span>ボードビュアー</span>
                        </div>
                    </Menu.Item>
                    <Menu.SubMenu title='ボードエディター'>
                        {recordToArray(boardPanels).map((pair, i) => {
                            return (
                                <Menu.Item
                                    key={pair.key}
                                    onClick={() => {
                                        // これは通常の操作が行われた場合は必要ないが、設定ファイルがおかしくなったりしたときのために書いている。これがないと、設定ファイルを直接編集しない限りは、isMinimized: trueになっているpanelを永遠に削除することができない。
                                        dispatch(
                                            roomConfigModule.actions.setIsMinimized({
                                                roomId,
                                                target: {
                                                    type: boardEditorPanel,
                                                    panelId: pair.key,
                                                },
                                                newValue: false,
                                            })
                                        );

                                        dispatch(
                                            roomConfigModule.actions.bringPanelToFront({
                                                roomId,
                                                target: {
                                                    type: boardEditorPanel,
                                                    panelId: pair.key,
                                                },
                                            })
                                        );
                                    }}
                                >
                                    <div>
                                        <span>
                                            {pair.value.isMinimized ? (
                                                <Icon.BorderOutlined />
                                            ) : (
                                                <Icon.CheckSquareOutlined />
                                            )}
                                        </span>
                                        <span>{`パネル${i + 1}`}</span>
                                    </div>
                                </Menu.Item>
                            );
                        })}
                        <Menu.Divider />
                        <Menu.Item
                            onClick={() => {
                                dispatch(
                                    roomConfigModule.actions.addBoardEditorPanelConfig({
                                        roomId,
                                        panel: {
                                            activeBoardKey: null,
                                            boards: {},
                                            isMinimized: false,
                                            x: 10,
                                            y: 10,
                                            width: 400,
                                            height: 300,
                                        },
                                    })
                                );
                            }}
                        >
                            <div>
                                <span>
                                    <Icon.PlusOutlined />
                                </span>
                                <span>新規作成</span>
                            </div>
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title='メッセージ'>
                        {recordToArray(messagePanels).map((pair, i) => {
                            return (
                                <Menu.Item
                                    key={pair.key}
                                    onClick={() => {
                                        // これは通常の操作が行われた場合は必要ないが、設定ファイルがおかしくなったりしたときのために書いている。これがないと、設定ファイルを直接編集しない限りは、isMinimized: trueになっているpanelを永遠に削除することができない。
                                        dispatch(
                                            roomConfigModule.actions.setIsMinimized({
                                                roomId,
                                                target: { type: 'messagePanel', panelId: pair.key },
                                                newValue: false,
                                            })
                                        );

                                        dispatch(
                                            roomConfigModule.actions.bringPanelToFront({
                                                roomId,
                                                target: { type: 'messagePanel', panelId: pair.key },
                                            })
                                        );
                                    }}
                                >
                                    <div>
                                        <span>
                                            {pair.value.isMinimized ? (
                                                <Icon.BorderOutlined />
                                            ) : (
                                                <Icon.CheckSquareOutlined />
                                            )}
                                        </span>
                                        <span>{`パネル${i + 1}`}</span>
                                    </div>
                                </Menu.Item>
                            );
                        })}
                        <Menu.Divider />
                        <Menu.Item
                            onClick={() => {
                                dispatch(
                                    roomConfigModule.actions.addMessagePanelConfig({
                                        roomId,
                                        panel: {
                                            ...defaultMessagePanelConfig(),
                                        },
                                    })
                                );
                            }}
                        >
                            <div>
                                <span>
                                    <Icon.PlusOutlined />
                                </span>
                                <span>新規作成</span>
                            </div>
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title='チャットパレット'>
                        {recordToArray(chatPalettePanels).map((pair, i) => {
                            return (
                                <Menu.Item
                                    key={pair.key}
                                    onClick={() => {
                                        // これは通常の操作が行われた場合は必要ないが、設定ファイルがおかしくなったりしたときのために書いている。これがないと、設定ファイルを直接編集しない限りは、isMinimized: trueになっているpanelを永遠に削除することができない。
                                        dispatch(
                                            roomConfigModule.actions.setIsMinimized({
                                                roomId,
                                                target: {
                                                    type: chatPalettePanel,
                                                    panelId: pair.key,
                                                },
                                                newValue: false,
                                            })
                                        );

                                        dispatch(
                                            roomConfigModule.actions.bringPanelToFront({
                                                roomId,
                                                target: {
                                                    type: chatPalettePanel,
                                                    panelId: pair.key,
                                                },
                                            })
                                        );
                                    }}
                                >
                                    <div>
                                        <span>
                                            {pair.value.isMinimized ? (
                                                <Icon.BorderOutlined />
                                            ) : (
                                                <Icon.CheckSquareOutlined />
                                            )}
                                        </span>
                                        <span>{`パネル${i + 1}`}</span>
                                    </div>
                                </Menu.Item>
                            );
                        })}
                        <Menu.Divider />
                        <Menu.Item
                            onClick={() => {
                                dispatch(
                                    roomConfigModule.actions.addChatPalettePanelConfig({
                                        roomId,
                                        panel: {
                                            isMinimized: false,
                                            x: 10,
                                            y: 10,
                                            width: 400,
                                            height: 300,
                                            isPrivateMessageMode: false,
                                            customCharacterName: '',
                                        },
                                    })
                                );
                            }}
                        >
                            <div>
                                <span>
                                    <Icon.PlusOutlined />
                                </span>
                                <span>新規作成</span>
                            </div>
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title='共有メモ（部屋）'>
                        {recordToArray(memoPanels).map((pair, i) => {
                            return (
                                <Menu.Item
                                    key={pair.key}
                                    onClick={() => {
                                        // これは通常の操作が行われた場合は必要ないが、設定ファイルがおかしくなったりしたときのために書いている。これがないと、設定ファイルを直接編集しない限りは、isMinimized: trueになっているpanelを永遠に削除することができない。
                                        dispatch(
                                            roomConfigModule.actions.setIsMinimized({
                                                roomId,
                                                target: { type: 'memoPanel', panelId: pair.key },
                                                newValue: false,
                                            })
                                        );

                                        dispatch(
                                            roomConfigModule.actions.bringPanelToFront({
                                                roomId,
                                                target: { type: 'memoPanel', panelId: pair.key },
                                            })
                                        );
                                    }}
                                >
                                    <div>
                                        <span>
                                            {pair.value.isMinimized ? (
                                                <Icon.BorderOutlined />
                                            ) : (
                                                <Icon.CheckSquareOutlined />
                                            )}
                                        </span>
                                        <span>{`パネル${i + 1}`}</span>
                                    </div>
                                </Menu.Item>
                            );
                        })}
                        <Menu.Divider />
                        <Menu.Item
                            onClick={() => {
                                dispatch(
                                    roomConfigModule.actions.addMemoPanelConfig({
                                        roomId,
                                        panel: {
                                            ...defaultMemoPanelConfig(),
                                        },
                                    })
                                );
                            }}
                        >
                            <div>
                                <span>
                                    <Icon.PlusOutlined />
                                </span>
                                <span>新規作成</span>
                            </div>
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.Item
                        onClick={() => {
                            dispatch(
                                roomConfigModule.actions.setIsMinimized({
                                    roomId,
                                    target: { type: 'pieceValuePanel' },
                                    newValue: false,
                                })
                            );
                            dispatch(
                                roomConfigModule.actions.bringPanelToFront({
                                    roomId,
                                    target: { type: 'pieceValuePanel' },
                                })
                            );
                        }}
                    >
                        <div>
                            <span>
                                {pieceValuePanel.isMinimized ? (
                                    <Icon.BorderOutlined />
                                ) : (
                                    <Icon.CheckSquareOutlined />
                                )}
                            </span>
                            <span>コマ</span>
                        </div>
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            dispatch(
                                roomConfigModule.actions.setIsMinimized({
                                    roomId,
                                    target: { type: 'gameEffectPanel' },
                                    newValue: false,
                                })
                            );
                            dispatch(
                                roomConfigModule.actions.bringPanelToFront({
                                    roomId,
                                    target: { type: 'gameEffectPanel' },
                                })
                            );
                        }}
                    >
                        <div>
                            <span>
                                {gameEffectPanel.isMinimized ? (
                                    <Icon.BorderOutlined />
                                ) : (
                                    <Icon.CheckSquareOutlined />
                                )}
                            </span>
                            <span>SE, BGM</span>
                        </div>
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            dispatch(
                                roomConfigModule.actions.setIsMinimized({
                                    roomId,
                                    target: { type: 'participantPanel' },
                                    newValue: false,
                                })
                            );
                            dispatch(
                                roomConfigModule.actions.bringPanelToFront({
                                    roomId,
                                    target: { type: 'participantPanel' },
                                })
                            );
                        }}
                    >
                        <div>
                            <span>
                                {participantPanel.isMinimized ? (
                                    <Icon.BorderOutlined />
                                ) : (
                                    <Icon.CheckSquareOutlined />
                                )}
                            </span>
                            <span>入室者</span>
                        </div>
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.Item>
                    <Popover trigger='click' content={<VolumeBarPanel roomId={roomId} />}>
                        ボリューム
                    </Popover>
                </Menu.Item>
                <Menu.Item onClick={() => setFilesManagerDrawerType({ openFileType: none })}>
                    アップローダー
                </Menu.Item>
                <Menu.SubMenu
                    title={
                        <div className={classNames(flex, flexRow, itemsCenter)}>
                            <Jdenticon
                                hashOrValue={myUserUid}
                                size={20}
                                tooltipMode={{ type: 'userUid' }}
                            />
                            <span style={{ marginLeft: 4 }}>{me.name}</span>
                        </div>
                    }
                >
                    <Menu.Item onClick={() => setIsChangeMyParticipantNameModalVisible(true)}>
                        名前を変更
                    </Menu.Item>
                    <Menu.Item
                        disabled={
                            me.role === ParticipantRole.Player || me.role === ParticipantRole.Master
                        }
                        onClick={() => setIsBecomePlayerModalVisible(true)}
                    >
                        {me.role === ParticipantRole.Player ||
                        me.role === ParticipantRole.Master ? (
                            <Tooltip title='すでに昇格済みです。'>参加者に昇格</Tooltip>
                        ) : (
                            '参加者に昇格'
                        )}
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            leaveRoomMutation({ variables: { id: roomId } }).then(result => {
                                if (result.data == null) {
                                    return;
                                }
                                router.push(path.rooms.index);
                            });
                        }}
                    >
                        退室する
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu
                    icon={<Icon.UserOutlined />}
                    title={
                        <span>
                            {myAuth.value.displayName} - {myAuth.value.uid}
                        </span>
                    }
                >
                    <Menu.Item onClick={() => signOut()}>ログアウト</Menu.Item>
                </Menu.SubMenu>
            </Menu>
            <FilesManagerDrawer
                drawerType={filesManagerDrawerType}
                onClose={() => setFilesManagerDrawerType(null)}
            />
            <BecomePlayerModal
                visible={isBecomePlayerModalVisible}
                onOk={() => setIsBecomePlayerModalVisible(false)}
                onCancel={() => setIsBecomePlayerModalVisible(false)}
                roomId={roomId}
            />
            <ChangeMyParticipantNameModal
                visible={isChangeMyParticipantNameModalVisible}
                onOk={() => setIsChangeMyParticipantNameModalVisible(false)}
                onCancel={() => setIsChangeMyParticipantNameModalVisible(false)}
                roomId={roomId}
            />
            <DeleteRoomModal
                visible={isDeleteRoomModalVisible}
                onOk={() => setIsDeleteRoomModalVisible(false)}
                onCancel={() => setIsDeleteRoomModalVisible(false)}
                roomId={roomId}
                roomCreatedByMe={myUserUid === createdBy}
            />
            <GenerateSimpleLogModal
                visible={isGenerateSimpleLogModalVisible}
                onOk={() => setIsGenerateSimpleLogModalVisible(false)}
                onCancel={() => setIsGenerateSimpleLogModalVisible(false)}
                roomId={roomId}
            />
            <GenerateRichLogModal
                visible={isGenerateRichLogModalVisible}
                onCancel={() => setIsGenerateRichLogModalVisible(false)}
                roomId={roomId}
            />
        </>
    );
};
