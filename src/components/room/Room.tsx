import React from 'react';
import { Menu, Layout as AntdLayout, notification as antdNotification, Input, Tooltip } from 'antd';
import DraggableCard, { horizontalPadding } from '../../foundations/DraggableCard';
import CharactersList from './CharacterList';
import useRoomConfig from '../../hooks/localStorage/useRoomConfig';
import { useSelector } from '../../store';
import roomConfigModule from '../../modules/roomConfigModule';
import { useDispatch } from 'react-redux';
import * as RoomStates from '../../stateManagers/states/room';
import * as Participant from '../../stateManagers/states/participant';
import Boards from './Boards';
import { recordToArray } from '../../utils/record';
import RoomMessages, { Tab } from './RoomMessages';
import CharacterParameterNamesDrawer from './CharacterParameterNamesDrawer';
import { RoomComponentsState, defaultRoomComponentsState, reduceComponentsState, editRoomDrawerVisibility } from './RoomComponentsState';
import DrawerFooter from '../../layouts/DrawerFooter';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import OperateContext from './contexts/OperateContext';
import CharacterDrawer from './CharacterDrawer';
import BoardDrawer from './BoardDrawer';
import CreatePrivateMessageDrawer from './CreatePrivateMessageDrawer';
import { boardsPanel, charactersPanel, gameEffectPanel, messagesPanel, participantsPanel } from '../../states/RoomConfig';
import * as Icon from '@ant-design/icons';
import { ChangeParticipantNameFailureType, DeleteRoomFailureType, ParticipantRole, PromoteFailureType, useChangeParticipantNameMutation, useDeleteRoomMutation, useGetLogLazyQuery, useGetLogQuery, useJoinRoomAsPlayerMutation, useLeaveRoomMutation, usePromoteToPlayerMutation, useRequiresPhraseToJoinAsPlayerLazyQuery, useRequiresPhraseToJoinAsPlayerQuery } from '../../generated/graphql';
import { useRouter } from 'next/router';
import path from '../../utils/path';
import PlayBgmBehavior from '../../foundations/PlayBgmBehavior';
import SoundPlayer from './SoundPlayer';
import Modal from 'antd/lib/modal/Modal';
import fileDownload from 'js-file-download';
import { generateAsStaticHtml } from '../../utils/roomLogGenerator';
import moment from 'moment';
import EditRoomDrawer from './EditRoomDrawer';
import MyAuthContext from '../../contexts/MyAuthContext';
import Jdenticon from '../../foundations/Jdenticon';
import ParticipantList from './ParticipantList';
import NotificationContext, { graphQLErrors, Notification, text, TextNotification, toTextNotification } from './contexts/NotificationContext';

type BecomePlayerModalProps = {
    roomId: string;
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
}

const BecomePlayerModal: React.FC<BecomePlayerModalProps> = ({ roomId, visible, onOk, onCancel }: BecomePlayerModalProps) => {
    const notificationContext = React.useContext(NotificationContext);
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
    const notificationContext = React.useContext(NotificationContext);
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
    const notificationContext = React.useContext(NotificationContext);
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
    participantsState: Participant.State;
    operate: ((operation: RoomStates.PostOperationSetup) => void);
    roomId: string;
}

const Room: React.FC<Props> = ({ roomState, participantsState, roomId, operate }: Props) => {
    useRoomConfig(roomId);
    const myAuth = React.useContext(MyAuthContext);
    const roomConfig = useSelector(state => state.roomConfigModule);
    const [confirmModalState, setConfirmModalState] = React.useState<ConfirmModalState>();
    const [isBecomePlayerModalVisible, setIsBecomePlayerModalVisible] = React.useState(false);
    const [isChangeMyParticipantNameModalVisible, setIsChangeMyParticipantNameModalVisible] = React.useState(false);
    const [isDeleteRoomModalVisible, setIsDeleteRoomModalVisible] = React.useState(false);
    const router = useRouter();
    const dispatch = useDispatch();
    const [componentsState, dispatchComponentsState] = React.useReducer(reduceComponentsState, defaultRoomComponentsState);
    const [notification, setNotification] = React.useState<Notification>();
    const [allNotifications, setAllNotifications] = React.useState<TextNotification[]>([]);
    React.useEffect(() => {
        if (notification == null) {
            return;
        }
        const textNotification = toTextNotification(notification);
        antdNotification[textNotification.type]({
            message: textNotification.message,
            description: textNotification.description,
            placement: 'bottomRight',
        });
        setAllNotifications(oldValue => {
            return [...oldValue, textNotification];
        });
    }, [notification]);
    const [getLogQuery, getLogQueryResult] = useGetLogLazyQuery({ variables: { roomId }, fetchPolicy: 'network-only' });
    const [leaveRoomMutation] = useLeaveRoomMutation({ variables: { id: roomId } });
    const roomStateRef = React.useRef(roomState);
    const participantsStateRef = React.useRef(participantsState);

    React.useEffect(() => {
        roomStateRef.current = roomState;
    }, [roomState]);
    React.useEffect(() => {
        participantsStateRef.current = participantsState;
    }, [participantsState]);

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

    if (roomConfig == null || roomConfig.roomId !== roomId) {
        return (<div>loading config file...</div>);
    }

    let me: Participant.StateElement | undefined = undefined;
    if (myAuth != null) {
        me = participantsState.get(myAuth.uid);
    }

    // TODO: offset, zoom
    const boardsPanels = recordToArray(roomConfig.panels.boardsPanels).map(pair => {
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
                onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: boardsPanel, panelId: pair.key } }))}
                onClose={() => dispatch(roomConfigModule.actions.removeBoardPanel({ roomId, panelId: pair.key }))}
                childrenContainerStyle={({ overflow: 'hidden', backgroundColor: 'white' })}
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
                    characters={roomState.characters} />
            </DraggableCard>
        );
    });

    return (
        <ComponentsStateContext.Provider value={componentsState}>
            <DispatchRoomComponentsStateContext.Provider value={dispatchComponentsState}>
                <OperateContext.Provider value={operate}>
                    <NotificationContext.Provider value={setNotification}>
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
                                    </Menu.SubMenu>
                                    <Menu.SubMenu title="ウィンドウ">
                                        <Menu.Item onClick={() => {
                                            dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: charactersPanel }, newValue: false }));
                                            dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: charactersPanel } }));
                                        }}>
                                            <div>
                                                <span>{roomConfig.panels.charactersPanel.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
                                                <span>キャラクター一覧</span>
                                            </div>
                                        </Menu.Item>
                                        <Menu.SubMenu title="ボード">
                                            {
                                                recordToArray(roomConfig.panels.boardsPanels).map((pair, i) => {
                                                    return (
                                                        <Menu.Item
                                                            key={pair.key}
                                                            onClick={() => {
                                                                // これは通常の操作が行われた場合は必要ないが、設定ファイルがおかしくなったりしたときのために書いている。これがないと、設定ファイルを直接編集しない限りは、isMinimized: trueになっているpanelを永遠に削除することができない。
                                                                dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: boardsPanel, panelId: pair.key }, newValue: false }));

                                                                dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: boardsPanel, panelId: pair.key } }));
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
                                                    <span>{roomConfig.panels.messagesPanel.isMinimized ? null : <Icon.PlusOutlined />}</span>
                                                    <span>新規作成</span>
                                                </div>
                                            </Menu.Item>
                                        </Menu.SubMenu>
                                        <Menu.Item onClick={() => {
                                            dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: messagesPanel }, newValue: false }));
                                            dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: messagesPanel } }));
                                        }}>
                                            <div>
                                                <span>{roomConfig.panels.messagesPanel.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
                                                <span>メッセージ</span>
                                            </div>
                                        </Menu.Item>
                                        <Menu.Item onClick={() => {
                                            dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: gameEffectPanel }, newValue: false }));
                                            dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: gameEffectPanel } }));
                                        }}>
                                            <div>
                                                <span>{roomConfig.panels.gameEffectPanel.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
                                                <span>エフェクト</span>
                                            </div>
                                        </Menu.Item>
                                        <Menu.Item onClick={() => {
                                            dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: participantsPanel }, newValue: false }));
                                            dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: participantsPanel } }));
                                        }}>
                                            <div>
                                                <span>{roomConfig.panels.participantsPanel.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
                                                <span>入室者</span>
                                            </div>
                                        </Menu.Item>
                                    </Menu.SubMenu>
                                    {(me == null || myAuth == null) || <Menu.SubMenu
                                        title={<div style={({ display: 'flex', flexDirection: 'row', alignItems: 'center' })}>
                                            <Jdenticon hashOrValue={myAuth.uid} size={20} tooltipMode='userUid' />
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
                                    </Menu.SubMenu>}
                                </Menu>
                                <div>
                                    {boardsPanels}
                                    {roomConfig.panels.charactersPanel.isMinimized ? null : <DraggableCard
                                        header="Characters"
                                        onDragStop={e => dispatch(roomConfigModule.actions.moveCharactersPanel({ ...e, roomId }))}
                                        onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeCharactersPanel({ roomId, dir, delta }))}
                                        onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: charactersPanel } }))}
                                        onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: charactersPanel }, newValue: true }))}
                                        childrenContainerStyle={({ padding: childrenContainerPadding, overflowY: 'scroll', backgroundColor: 'white' })}
                                        position={roomConfig.panels.charactersPanel}
                                        size={roomConfig.panels.charactersPanel}
                                        minHeight={150}
                                        minWidth={150}
                                        zIndex={roomConfig.panels.charactersPanel.zIndex}>
                                        <CharactersList room={roomState} participants={participantsState} />
                                    </DraggableCard>}
                                    {roomConfig.panels.gameEffectPanel.isMinimized ? null : <DraggableCard
                                        header="Game effect"
                                        onDragStop={e => dispatch(roomConfigModule.actions.moveGameEffectPanel({ ...e, roomId }))}
                                        onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeGameEffectPanel({ roomId, dir, delta }))}
                                        onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: gameEffectPanel } }))}
                                        onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: gameEffectPanel }, newValue: true }))}
                                        childrenContainerStyle={({ padding: childrenContainerPadding, overflowY: 'scroll', backgroundColor: 'white' })}
                                        position={roomConfig.panels.gameEffectPanel}
                                        size={roomConfig.panels.gameEffectPanel}
                                        minHeight={150}
                                        minWidth={150}
                                        zIndex={roomConfig.panels.gameEffectPanel.zIndex}>
                                        <SoundPlayer roomId={roomId} />
                                    </DraggableCard>}
                                    {roomConfig.panels.messagesPanel.isMinimized ? null : <DraggableCard
                                        header="Messages"
                                        onDragStop={e => dispatch(roomConfigModule.actions.moveMessagesPanel({ ...e, roomId }))}
                                        onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeMessagesPanel({ roomId, dir, delta }))}
                                        onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: messagesPanel } }))}
                                        onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: messagesPanel }, newValue: true }))}
                                        childrenContainerStyle={({ padding: childrenContainerPadding, backgroundColor: 'white' })}
                                        position={roomConfig.panels.messagesPanel}
                                        size={roomConfig.panels.messagesPanel}
                                        minHeight={150}
                                        minWidth={150}
                                        zIndex={roomConfig.panels.messagesPanel.zIndex}>
                                        <RoomMessages roomId={roomId} participantsState={participantsState} characters={roomState.characters} notifications={allNotifications} />
                                    </DraggableCard>}
                                    {roomConfig.panels.participantsPanel.isMinimized ? null : <DraggableCard
                                        header="Participants"
                                        onDragStop={e => dispatch(roomConfigModule.actions.moveParticipantsPanel({ ...e, roomId }))}
                                        onResizeStop={(dir, delta) => dispatch(roomConfigModule.actions.resizeParticipantsPanel({ roomId, dir, delta }))}
                                        onMoveToFront={() => dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: participantsPanel } }))}
                                        onClose={() => dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: participantsPanel }, newValue: true }))}
                                        childrenContainerStyle={({ padding: childrenContainerPadding, backgroundColor: 'white' })}
                                        position={roomConfig.panels.participantsPanel}
                                        size={roomConfig.panels.participantsPanel}
                                        minHeight={150}
                                        minWidth={150}
                                        zIndex={roomConfig.panels.participantsPanel.zIndex}>
                                        <ParticipantList participants={participantsState} />
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
                                <CharacterDrawer roomState={roomState} />
                                <CharacterParameterNamesDrawer roomState={roomState} />
                                <CreatePrivateMessageDrawer roomState={roomState} participantsState={participantsState} roomId={roomId} />
                                <EditRoomDrawer roomState={roomState} />

                                <PlayBgmBehavior bgms={roomState.bgms} />
                            </AntdLayout.Content>
                        </AntdLayout>
                    </NotificationContext.Provider>
                </OperateContext.Provider>
            </DispatchRoomComponentsStateContext.Provider>
        </ComponentsStateContext.Provider>);
};

export default Room;