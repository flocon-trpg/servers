import React from 'react';
import { Menu, Layout as AntdLayout, notification as antdNotification, Input, Tooltip, Result, Popover, Modal } from 'antd';
import DraggableCard, { horizontalPadding } from '../../foundations/DraggableCard';
import CharacterList from './CharacterList';
import useRoomConfig from '../../hooks/localStorage/useRoomConfig';
import { useSelector } from '../../store';
import roomConfigModule from '../../modules/roomConfigModule';
import { useDispatch } from 'react-redux';
import { Room as RoomStates } from '../../stateManagers/states/room';
import Boards from './Boards';
import { recordToArray } from '../../utils/record';
import RoomMessages from './RoomMessages';
import CharacterParameterNamesDrawer from './CharacterParameterNamesDrawer';
import { defaultRoomComponentsState, reduceComponentsState, editRoomDrawerVisibility } from './RoomComponentsState';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import OperateContext from './contexts/OperateContext';
import CharacterDrawer from './CharacterDrawer';
import BoardDrawer from './BoardDrawer';
import { boardPanel, characterPanel, gameEffectPanel, messagePanel, myValuePanel, participantPanel } from '../../states/RoomConfig';
import * as Icon from '@ant-design/icons';
import { DeleteRoomFailureType, ParticipantRole, PromoteFailureType, RoomEventSubscription, useChangeParticipantNameMutation, useDeleteRoomMutation, useGetLogLazyQuery, useLeaveRoomMutation, usePromoteToPlayerMutation, useRequiresPhraseToJoinAsPlayerLazyQuery } from '../../generated/graphql';
import { useRouter } from 'next/router';
import path from '../../utils/path';
import SoundPlayer from './SoundPlayer';
import fileDownload from 'js-file-download';
import { generateAsStaticHtml } from '../../utils/roomLogGenerator';
import moment from 'moment';
import EditRoomDrawer from './EditRoomDrawer';
import MyAuthContext from '../../contexts/MyAuthContext';
import Jdenticon from '../../foundations/Jdenticon';
import ParticipantList from './ParticipantList';
import LogNotificationContext, { graphQLErrors, Notification, text, TextNotificationsState, toTextNotification } from './contexts/LogNotificationContext';
import { Participant } from '../../stateManagers/states/participant';
import MyNumberValueDrawer from './MyNumberValueDrawer';
import { useAllRoomMessages } from '../../hooks/useRoomMessages';
import LoadingResult from '../../foundations/Result/LoadingResult';
import VolumeBarPanel from './VolumeBarPanel';
import { defaultMessagePanelConfig } from '../../states/MessagesPanelConfig';
import { usePlayBgm } from '../../hooks/usePlayBgm';
import { usePlaySoundEffect } from '../../hooks/usePlaySoundEffect';
import { useMessageNotification } from '../../hooks/useMessageNotification';
import { getUserUid } from '../../hooks/useFirebaseUser';
import MyNumberValueList from './MyNumberValueList';
import { useRoomConnections } from '../../hooks/useRoomConnections';

type BecomePlayerModalProps = {
    roomId: string;
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
}

const BecomePlayerModal: React.FC<BecomePlayerModalProps> = ({ roomId, visible, onOk, onCancel }: BecomePlayerModalProps) => {
    const notificationContext = React.useContext(LogNotificationContext);
    const [inputValue, setInputValue] = React.useState('');
    const [isPosting, setIsPosting] = React.useState(false);
    const [promoteToPlayer] = usePromoteToPlayerMutation();
    const [requiresPhraseToJoinAsPlayer, requiresPhraseToJoinAsPlayerResult] = useRequiresPhraseToJoinAsPlayerLazyQuery();
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

    if (requiresPhraseToJoinAsPlayerResult.data?.result.__typename !== 'RequiresPhraseSuccessResult') {
        return (
            <Modal
                visible={visible}
                title={title}
                okButtonProps={({ disabled: true })}
                onCancel={() => onCancel()}>
                サーバーと通信中です…
            </Modal>
        );
    }
    if (requiresPhraseToJoinAsPlayerResult.data.result.value) {
        return (
            <Modal
                visible={visible}
                title={title}
                okButtonProps={({ disabled: isPosting })}
                onOk={() => {
                    setIsPosting(true);
                    promoteToPlayer({ variables: { roomId, phrase: inputValue } }).then(e => {
                        if (e.errors != null) {
                            notificationContext({
                                type: graphQLErrors,
                                createdAt: new Date().getTime(),
                                errors: e.errors
                            });
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
                            notificationContext({
                                type: 'text',
                                notification: {
                                    type: 'warning',
                                    message: '参加者への昇格に失敗しました。',
                                    description: text,
                                    createdAt: new Date().getTime(),
                                },
                            });
                            onOk();
                            return;
                        }

                        onOk();
                    });
                }}
                onCancel={() => onCancel()}>
                <Input placeholder='フレーズ' value={inputValue} onChange={e => setInputValue(e.target.value)} />
            </Modal>
        );
    }
    return (
        <Modal
            visible={visible}
            title={title}
            okButtonProps={({ disabled: isPosting })}
            onOk={() => {
                setIsPosting(true);
                promoteToPlayer({ variables: { roomId } }).then(e => {
                    if (e.errors != null) {
                        notificationContext({
                            type: graphQLErrors,
                            createdAt: new Date().getTime(),
                            errors: e.errors
                        });
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
                        notificationContext({
                            type: 'text',
                            notification: {
                                type: 'warning',
                                message: '参加者への昇格に失敗しました。',
                                description: text,
                                createdAt: new Date().getTime(),
                            },
                        });
                        onOk();
                        return;
                    }

                    onOk();
                });
            }}
            onCancel={() => onCancel()}>
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
}

const DeleteRoomModal: React.FC<DeleteRoomModalProps> = ({ roomId, visible, onOk, onCancel, roomCreatedByMe }: DeleteRoomModalProps) => {
    const notificationContext = React.useContext(LogNotificationContext);
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
            okButtonProps={({ disabled })}
            okType='danger'
            okText='削除する'
            cancelText={disabled ? '閉じる' : 'キャンセル'}
            onOk={() => {
                setIsPosting(true);
                deleteRoom({ variables: { id: roomId } }).then(e => {
                    if (e.errors != null) {
                        notificationContext({
                            type: graphQLErrors,
                            createdAt: new Date().getTime(),
                            errors: e.errors
                        });
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
                        notificationContext({
                            type: 'text',
                            notification: {
                                type: 'warning',
                                message: '部屋の削除に失敗しました。',
                                description: text,
                                createdAt: new Date().getTime(),
                            },
                        });
                        onOk();
                        return;
                    }

                    onOk();
                });
            }}
            onCancel={() => onCancel()}>
            {roomCreatedByMe ?
                <div>
                    <p>この部屋を削除します。この部屋を作成したユーザーでない限り、部屋を削除することはできません。</p>
                    <p style={({ fontWeight: 'bold' })}>部屋を削除すると元に戻すことはできず、ログ出力もできません。</p>
                    <p>本当によろしいですか？</p>
                </div> :
                <div>この部屋の作成者でないため、削除することができません。</div>}
        </Modal>
    );
};

type ChangeMyParticipantNameModalProps = {
    roomId: string;
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
}

const ChangeMyParticipantNameModal: React.FC<ChangeMyParticipantNameModalProps> = ({ roomId, visible, onOk: onOkCore, onCancel }: ChangeMyParticipantNameModalProps) => {
    const notificationContext = React.useContext(LogNotificationContext);
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
                notificationContext({
                    type: graphQLErrors,
                    createdAt: new Date().getTime(),
                    errors: e.errors
                });
                onOkCore();
                return;
            }

            if (e.data?.result.failureType != null) {
                notificationContext({
                    type: 'text',
                    notification: {
                        type: 'warning',
                        message: '名前の変更に失敗しました。',
                        description: text,
                        createdAt: new Date().getTime(),
                    },
                });
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
            okButtonProps={({ disabled: isPosting })}
            onOk={() => onOk()}
            onCancel={() => onCancel()}>
            <Input placeholder='新しい名前' autoFocus value={inputValue} onChange={e => setInputValue(e.target.value)} onPressEnter={() => onOk()} />
        </Modal>
    );
};

type ConfirmModalState = {
    onOk: () => void;
    content: React.ReactNode;
}

const childrenContainerPadding = `12px ${horizontalPadding}px`;
const bottomContainerPadding = `0px ${horizontalPadding}px`;

type Props = {
    roomState: RoomStates.State;
    operate: ((operation: RoomStates.PostOperationSetup) => void);
    roomId: string;
    logNotifications: TextNotificationsState;
    roomEventSubscription: RoomEventSubscription | undefined;
}

const Room: React.FC<Props> = ({ roomState, roomId, operate, logNotifications, roomEventSubscription }: Props) => {
    useRoomConfig(roomId);
    const myAuth = React.useContext(MyAuthContext);
    const roomConfig = useSelector(state => state.roomConfigModule);
    const allRoomMessages = useAllRoomMessages({ roomId, roomEventSubscription });
    const roomConnections = useRoomConnections({ roomId, roomEventSubscription });
    const [confirmModalState, setConfirmModalState] = React.useState<ConfirmModalState>();
    const [isBecomePlayerModalVisible, setIsBecomePlayerModalVisible] = React.useState(false);
    const [isChangeMyParticipantNameModalVisible, setIsChangeMyParticipantNameModalVisible] = React.useState(false);
    const [isDeleteRoomModalVisible, setIsDeleteRoomModalVisible] = React.useState(false);
    const router = useRouter();
    const dispatch = useDispatch();
    const [componentsState, dispatchComponentsState] = React.useReducer(reduceComponentsState, defaultRoomComponentsState);

    const [getLogQuery, getLogQueryResult] = useGetLogLazyQuery({ variables: { roomId }, fetchPolicy: 'network-only' });
    const [leaveRoomMutation] = useLeaveRoomMutation({ variables: { id: roomId } });
    const roomStateRef = React.useRef(roomState);
    const participantsStateRef = React.useRef(roomState.participants);

    React.useEffect(() => {
        roomStateRef.current = roomState;
    }, [roomState]);
    React.useEffect(() => {
        participantsStateRef.current = roomState.participants;
    }, [roomState.participants]);

    React.useEffect(() => {
        const data = getLogQueryResult.data;
        if (data == null) {
            return;
        }
        if (data.result.__typename !== 'RoomMessages') {
            // TODO: エラーメッセージを出す
            return;
        }
        fileDownload(generateAsStaticHtml({
            messages: data.result,
            participants: participantsStateRef.current,
            characters: roomStateRef.current.characters
        }), `log_${moment(new Date()).format('YYYYMMDDHHmmss')}.html`);
    }, [getLogQueryResult.data]);

    usePlayBgm(roomState.bgms);
    usePlaySoundEffect(allRoomMessages);
    useMessageNotification(allRoomMessages, getUserUid(myAuth) ?? null, roomState, roomState.participants);

    if (roomConfig == null || roomConfig.roomId !== roomId) {
        return (<LoadingResult title='個人設定のデータをブラウザから読み込んでいます…' />);
    }

    const me: Participant.State | undefined = typeof myAuth === 'string' ? undefined : roomState.participants.get(myAuth.uid);

    if (typeof myAuth === 'string' || me == null) {
        return <AntdLayout>
            <AntdLayout.Content>
                <Result
                    status='warning'
                    title='ログインしていないか、Participantの取得に失敗しました。' />
            </AntdLayout.Content>
        </AntdLayout>;
    }

    const boardsPanels = recordToArray(roomConfig.panels.boardPanels).map(pair => {
        if (pair.value.isMinimized) {
            return null;
        }

        // canvasWidthとcanvasHeightはDraggableCardのchildrenの表示領域より大きい値
        return (
            <DraggableCard
                key={pair.key}
                header="Board"
                onDragStop={e => dispatch(roomConfigModule.actions.moveBoardPanel({ ...e, roomId, panelId: pair.key }))}
                onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeBoardPanel({ roomId, panelId: pair.key, dir, delta }))}
                onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: boardPanel, panelId: pair.key } }))}
                onClose={() => dispatch(roomConfigModule.actions.removeBoardPanel({ roomId, panelId: pair.key }))}
                childrenContainerStyle={({ overflow: 'hidden' })}
                position={pair.value}
                size={pair.value}
                minHeight={150}
                minWidth={150}
                zIndex={pair.value.zIndex}>
                <Boards
                    canvasWidth={pair.value.width}
                    canvasHeight={pair.value.height}
                    boards={roomState.boards}
                    boardsPanelConfigId={pair.key}
                    boardsPanelConfig={pair.value}
                    roomId={roomId}
                    characters={roomState.characters}
                    participants={roomState.participants}
                    me={me}
                    myUserUid={myAuth.uid}
                    allRoomMessages={allRoomMessages} />
            </DraggableCard>
        );
    });

    const messagePanels = recordToArray(roomConfig.panels.messagePanels).map(pair => {
        if (pair.value.isMinimized) {
            return null;
        }

        // canvasWidthとcanvasHeightはDraggableCardのchildrenの表示領域より大きい値
        return (
            <DraggableCard
                key={pair.key}
                header="Message"
                onDragStop={e => dispatch(roomConfigModule.actions.moveMessagePanel({ ...e, roomId, panelId: pair.key }))}
                onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeMessagePanel({ roomId, panelId: pair.key, dir, delta }))}
                onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: messagePanel, panelId: pair.key } }))}
                onClose={() => {
                    Modal.confirm({
                        title: '削除の確認',
                        content: '選択されたメッセージウィンドウを削除します。よろしいですか？',
                        onOk: () => {
                            dispatch(roomConfigModule.actions.removeMessagePanel({ roomId, panelId: pair.key }));
                        },
                        okText: '削除',
                        cancelText: 'キャンセル',
                        closable: true,
                        maskClosable: true,
                    });
                }}
                childrenContainerStyle={({ overflow: 'hidden' })}
                position={pair.value}
                size={pair.value}
                minHeight={150}
                minWidth={150}
                zIndex={pair.value.zIndex}>
                <RoomMessages
                    {...roomState}
                    roomId={roomId}
                    allRoomMessagesResult={allRoomMessages}
                    logNotifications={logNotifications}
                    panelId={pair.key}
                    config={pair.value}
                    height={pair.value.height} />
            </DraggableCard>
        );
    });

    return (
        <ComponentsStateContext.Provider value={componentsState}>
            <DispatchRoomComponentsStateContext.Provider value={dispatchComponentsState}>
                <OperateContext.Provider value={operate}>
                    <AntdLayout>
                        <AntdLayout.Content>
                            <Menu triggerSubMenuAction='click' selectable={false} mode="horizontal">
                                <Menu.SubMenu title="部屋">
                                    <Menu.Item onClick={() => dispatchComponentsState({ type: editRoomDrawerVisibility, newValue: true })}>
                                        編集
                                    </Menu.Item>
                                    <Menu.Item onClick={() => setIsDeleteRoomModalVisible(true)}>
                                        <span style={({ color: 'red' })}>削除</span>
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item onClick={() => setConfirmModalState({
                                        content: (<span>
                                            <p>ログには、自分が見ることのできるメッセージだけでなく秘話などの非公開情報も全て含まれます。また、ログをダウンロードすると、システムメッセージによって全員に通知されます。</p>
                                            <p>ログをダウンロードしますか？</p>
                                        </span>),
                                        onOk: () => {
                                            getLogQuery();
                                        }
                                    })}>
                                        ログをダウンロード
                                    </Menu.Item>
                                </Menu.SubMenu>
                                <Menu.SubMenu title="ウィンドウ">
                                    <Menu.Item onClick={() => {
                                        dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: characterPanel }, newValue: false }));
                                        dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: characterPanel } }));
                                    }}>
                                        <div>
                                            <span>{roomConfig.panels.characterPanel.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
                                            <span>キャラクター一覧</span>
                                        </div>
                                    </Menu.Item>
                                    <Menu.SubMenu title="ボード">
                                        {
                                            recordToArray(roomConfig.panels.boardPanels).map((pair, i) => {
                                                return (
                                                    <Menu.Item
                                                        key={pair.key}
                                                        onClick={() => {
                                                            // これは通常の操作が行われた場合は必要ないが、設定ファイルがおかしくなったりしたときのために書いている。これがないと、設定ファイルを直接編集しない限りは、isMinimized: trueになっているpanelを永遠に削除することができない。
                                                            dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: boardPanel, panelId: pair.key }, newValue: false }));

                                                            dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: boardPanel, panelId: pair.key } }));
                                                        }}>
                                                        <div>
                                                            <span>{pair.value.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
                                                            <span>{`パネル${i}`}</span>
                                                        </div>
                                                    </Menu.Item>);
                                            })
                                        }
                                        <Menu.Divider />
                                        <Menu.Item onClick={() => {
                                            dispatch(roomConfigModule.actions.addBoardPanelConfig({
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
                                            }));
                                        }}>
                                            <div>
                                                <span><Icon.PlusOutlined /></span>
                                                <span>新規作成</span>
                                            </div>
                                        </Menu.Item>
                                    </Menu.SubMenu>
                                    <Menu.SubMenu title="メッセージ">
                                        {
                                            recordToArray(roomConfig.panels.boardPanels).map((pair, i) => {
                                                return (
                                                    <Menu.Item
                                                        key={pair.key}
                                                        onClick={() => {
                                                            // これは通常の操作が行われた場合は必要ないが、設定ファイルがおかしくなったりしたときのために書いている。これがないと、設定ファイルを直接編集しない限りは、isMinimized: trueになっているpanelを永遠に削除することができない。
                                                            dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: messagePanel, panelId: pair.key }, newValue: false }));

                                                            dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: messagePanel, panelId: pair.key } }));
                                                        }}>
                                                        <div>
                                                            <span>{pair.value.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
                                                            <span>{`パネル${i}`}</span>
                                                        </div>
                                                    </Menu.Item>);
                                            })
                                        }
                                        <Menu.Divider />
                                        <Menu.Item onClick={() => {
                                            dispatch(roomConfigModule.actions.addMessagePanelConfig({
                                                roomId,
                                                panel: {
                                                    ...defaultMessagePanelConfig(),
                                                },
                                            }));
                                        }}>
                                            <div>
                                                <span><Icon.PlusOutlined /></span>
                                                <span>新規作成</span>
                                            </div>
                                        </Menu.Item>
                                    </Menu.SubMenu>
                                    <Menu.Item onClick={() => {
                                        dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: myValuePanel }, newValue: false }));
                                        dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: myValuePanel } }));
                                    }}>
                                        <div>
                                            <span>{roomConfig.panels.myValuePanel.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
                                            <span>コマ</span>
                                        </div>
                                    </Menu.Item>
                                    <Menu.Item onClick={() => {
                                        dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: gameEffectPanel }, newValue: false }));
                                        dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: gameEffectPanel } }));
                                    }}>
                                        <div>
                                            <span>{roomConfig.panels.gameEffectPanel.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
                                            <span>SE, BGM</span>
                                        </div>
                                    </Menu.Item>
                                    <Menu.Item onClick={() => {
                                        dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: participantPanel }, newValue: false }));
                                        dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: participantPanel } }));
                                    }}>
                                        <div>
                                            <span>{roomConfig.panels.participantPanel.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
                                            <span>入室者</span>
                                        </div>
                                    </Menu.Item>
                                </Menu.SubMenu>
                                <Menu.Item>
                                    <Popover trigger='click' content={<VolumeBarPanel roomId={roomId} />}>
                                        ボリューム
                                    </Popover>
                                </Menu.Item>
                                {(me == null || myAuth == null) || <Menu.SubMenu
                                    title={<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <Jdenticon hashOrValue={myAuth.uid} size={20} tooltipMode={{ type: 'userUid' }} />
                                        <span style={({ marginLeft: 4 })}>{me.name}</span>
                                    </div>}>
                                    <Menu.Item
                                        onClick={() => setIsChangeMyParticipantNameModalVisible(true)}>
                                        名前を変更
                                    </Menu.Item>
                                    <Menu.Item
                                        disabled={me.role === ParticipantRole.Player || me.role === ParticipantRole.Master}
                                        onClick={() => setIsBecomePlayerModalVisible(true)}>
                                        {me.role === ParticipantRole.Player || me.role === ParticipantRole.Master ? <Tooltip title='すでに昇格済みです。'>参加者に昇格</Tooltip> : '参加者に昇格'}
                                    </Menu.Item>
                                    <Menu.Item onClick={() => {
                                        leaveRoomMutation().then(result => {
                                            if (result.data == null) {
                                                return;
                                            }
                                            router.push(path.rooms.index);
                                        });
                                    }}>
                                        退室する
                                    </Menu.Item>
                                </Menu.SubMenu>}
                            </Menu>
                            <div>
                                {boardsPanels}
                                {messagePanels}
                                {roomConfig.panels.characterPanel.isMinimized ? null : <DraggableCard
                                    header="Characters"
                                    onDragStop={e => dispatch(roomConfigModule.actions.moveCharacterPanel({ ...e, roomId }))}
                                    onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeCharacterPanel({ roomId, dir, delta }))}
                                    onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: characterPanel } }))}
                                    onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: characterPanel }, newValue: true }))}
                                    childrenContainerStyle={({ padding: childrenContainerPadding, overflowY: 'scroll' })}
                                    position={roomConfig.panels.characterPanel}
                                    size={roomConfig.panels.characterPanel}
                                    minHeight={150}
                                    minWidth={150}
                                    zIndex={roomConfig.panels.characterPanel.zIndex}>
                                    <CharacterList room={roomState} />
                                </DraggableCard>}
                                {roomConfig.panels.gameEffectPanel.isMinimized ? null : <DraggableCard
                                    header="SE, BGM"
                                    onDragStop={e => dispatch(roomConfigModule.actions.moveGameEffectPanel({ ...e, roomId }))}
                                    onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeGameEffectPanel({ roomId, dir, delta }))}
                                    onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: gameEffectPanel } }))}
                                    onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: gameEffectPanel }, newValue: true }))}
                                    childrenContainerStyle={({ padding: childrenContainerPadding, overflowY: 'scroll' })}
                                    position={roomConfig.panels.gameEffectPanel}
                                    size={roomConfig.panels.gameEffectPanel}
                                    minHeight={150}
                                    minWidth={150}
                                    zIndex={roomConfig.panels.gameEffectPanel.zIndex}>
                                    <SoundPlayer roomId={roomId} bgmsState={roomState.bgms} />
                                </DraggableCard>}
                                {roomConfig.panels.participantPanel.isMinimized ? null : <DraggableCard
                                    header="Participants"
                                    onDragStop={e => dispatch(roomConfigModule.actions.moveParticipantPanel({ ...e, roomId }))}
                                    onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeParticipantPanel({ roomId, dir, delta }))}
                                    onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: participantPanel } }))}
                                    onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: participantPanel }, newValue: true }))}
                                    childrenContainerStyle={({ padding: childrenContainerPadding, overflowY: 'scroll' })}
                                    position={roomConfig.panels.participantPanel}
                                    size={roomConfig.panels.participantPanel}
                                    minHeight={150}
                                    minWidth={150}
                                    zIndex={roomConfig.panels.participantPanel.zIndex}>
                                    <ParticipantList participants={roomState.participants} roomConnections={roomConnections} />
                                </DraggableCard>}
                                {roomConfig.panels.myValuePanel.isMinimized ? null : <DraggableCard
                                    header="コマ"
                                    onDragStop={e => dispatch(roomConfigModule.actions.moveMyValuePanel({ ...e, roomId }))}
                                    onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeMyValuePanel({ roomId, dir, delta }))}
                                    onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: myValuePanel } }))}
                                    onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: myValuePanel }, newValue: true }))}
                                    childrenContainerStyle={({ padding: childrenContainerPadding, overflowY: 'scroll' })}
                                    position={roomConfig.panels.myValuePanel}
                                    size={roomConfig.panels.myValuePanel}
                                    minHeight={150}
                                    minWidth={150}
                                    zIndex={roomConfig.panels.myValuePanel.zIndex}>
                                    <MyNumberValueList participants={roomState.participants} />
                                </DraggableCard>}
                            </div>

                            <Modal
                                visible={confirmModalState != null}
                                onOk={() => {
                                    if (confirmModalState != null) {
                                        confirmModalState.onOk();
                                    }
                                    setConfirmModalState(undefined);
                                }}
                                onCancel={() => setConfirmModalState(undefined)}>
                                {confirmModalState == null || confirmModalState.content}
                            </Modal>
                            <BecomePlayerModal
                                visible={isBecomePlayerModalVisible}
                                onOk={() => setIsBecomePlayerModalVisible(false)}
                                onCancel={() => setIsBecomePlayerModalVisible(false)}
                                roomId={roomId} />
                            <ChangeMyParticipantNameModal
                                visible={isChangeMyParticipantNameModalVisible}
                                onOk={() => setIsChangeMyParticipantNameModalVisible(false)}
                                onCancel={() => setIsChangeMyParticipantNameModalVisible(false)}
                                roomId={roomId} />
                            <DeleteRoomModal
                                visible={isDeleteRoomModalVisible}
                                onOk={() => setIsDeleteRoomModalVisible(false)}
                                onCancel={() => setIsDeleteRoomModalVisible(false)}
                                roomId={roomId}
                                roomCreatedByMe={myAuth?.uid === roomState.createdBy} />

                            <BoardDrawer roomState={roomState} />
                            <CharacterDrawer characters={roomState.characters} paramNames={roomState.paramNames} participants={roomState.participants} />
                            <MyNumberValueDrawer myUserUid={myAuth.uid} me={me} />
                            <CharacterParameterNamesDrawer roomState={roomState} />
                            <EditRoomDrawer roomState={roomState} />
                        </AntdLayout.Content>
                    </AntdLayout>
                </OperateContext.Provider>
            </DispatchRoomComponentsStateContext.Provider>
        </ComponentsStateContext.Provider>);
};

export default Room;