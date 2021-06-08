import { Input, Menu, Modal, Popover, Tooltip } from 'antd';
import React from 'react';
import { useDispatch } from 'react-redux';
import { DeleteRoomFailureType, ParticipantRole, PromoteFailureType, useChangeParticipantNameMutation, useDeleteRoomMutation, useGetLogLazyQuery, useLeaveRoomMutation, usePromoteToPlayerMutation, useRequiresPhraseToJoinAsPlayerLazyQuery } from '../../generated/graphql';
import roomConfigModule from '../../modules/roomConfigModule';
import { useSelector } from '../../store';
import * as Icon from '@ant-design/icons';
import { boardEditorPanel } from '../../states/RoomConfig';
import VolumeBarPanel from './VolumeBarPanel';
import Jdenticon from '../../components/Jdenticon';
import roomStateModule, { Notification } from '../../modules/roomStateModule';
import MyAuthContext from '../../contexts/MyAuthContext';
import path from '../../utils/path';
import { useRouter } from 'next/router';
import { defaultMessagePanelConfig } from '../../states/MessagesPanelConfig';
import fileDownload from 'js-file-download';
import { generateAsStaticHtml } from '../../utils/roomLogGenerator';
import moment from 'moment';
import { usePublicChannelNames } from '../../hooks/state/usePublicChannelNames';
import { useParticipants } from '../../hooks/state/useParticipants';
import { recordToArray } from '@kizahasi/util';
import { useCharacters } from '../../hooks/state/useCharacters';
import { roomDrawerModule } from '../../modules/roomDrawerModule';

type BecomePlayerModalProps = {
    roomId: string;
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
}

const BecomePlayerModal: React.FC<BecomePlayerModalProps> = ({ roomId, visible, onOk, onCancel }: BecomePlayerModalProps) => {
    const dispatch = useDispatch();
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
                            dispatch(roomStateModule.actions.addNotification({
                                type: Notification.graphQLErrors,
                                createdAt: new Date().getTime(),
                                errors: e.errors
                            }));
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
                            dispatch(roomStateModule.actions.addNotification({
                                type: 'text',
                                notification: {
                                    type: 'warning',
                                    message: '参加者への昇格に失敗しました。',
                                    description: text,
                                    createdAt: new Date().getTime(),
                                },
                            }));
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
                        dispatch(roomStateModule.actions.addNotification({
                            type: Notification.graphQLErrors,
                            createdAt: new Date().getTime(),
                            errors: e.errors
                        }));
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
                        dispatch(roomStateModule.actions.addNotification({
                            type: 'text',
                            notification: {
                                type: 'warning',
                                message: '参加者への昇格に失敗しました。',
                                description: text,
                                createdAt: new Date().getTime(),
                            },
                        }));
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
            okButtonProps={({ disabled })}
            okType='danger'
            okText='削除する'
            cancelText={disabled ? '閉じる' : 'キャンセル'}
            onOk={() => {
                setIsPosting(true);
                deleteRoom({ variables: { id: roomId } }).then(e => {
                    if (e.errors != null) {
                        dispatch(roomStateModule.actions.addNotification({
                            type: Notification.graphQLErrors,
                            createdAt: new Date().getTime(),
                            errors: e.errors
                        }));
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
                        dispatch(roomStateModule.actions.addNotification({
                            type: 'text',
                            notification: {
                                type: 'warning',
                                message: '部屋の削除に失敗しました。',
                                description: text,
                                createdAt: new Date().getTime(),
                            },
                        }));
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
                dispatch(roomStateModule.actions.addNotification({
                    type: Notification.graphQLErrors,
                    createdAt: new Date().getTime(),
                    errors: e.errors
                }));
                onOkCore();
                return;
            }

            if (e.data?.result.failureType != null) {
                dispatch(roomStateModule.actions.addNotification({
                    type: Notification.text,
                    notification: {
                        type: 'warning',
                        message: '名前の変更に失敗しました。',
                        createdAt: new Date().getTime(),
                    },
                }));
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

export const RoomMenu: React.FC = () => {
    const myAuth = React.useContext(MyAuthContext);
    const router = useRouter();
    const dispatch = useDispatch();
    const roomId = useSelector(state => state.roomModule.roomId);
    const createdBy = useSelector(state => state.roomModule.roomState?.state?.createdBy);
    const publicChannelNames = usePublicChannelNames();
    const characters = useCharacters();
    const participants = useParticipants();
    const activeBoardPanel = useSelector(state => state.roomConfigModule?.panels.activeBoardPanel);
    const boardPanels = useSelector(state => state.roomConfigModule?.panels.boardEditorPanels);
    const characterPanel = useSelector(state => state.roomConfigModule?.panels.characterPanel);
    const gameEffectPanel = useSelector(state => state.roomConfigModule?.panels.gameEffectPanel);
    const participantPanel = useSelector(state => state.roomConfigModule?.panels.participantPanel);
    const messagePanel = useSelector(state => state.roomConfigModule?.panels.messagePanels);
    const myValuePanel = useSelector(state => state.roomConfigModule?.panels.myValuePanel);
    const [getLogQuery, getLogQueryResult] = useGetLogLazyQuery({ fetchPolicy: 'network-only' });
    const [leaveRoomMutation] = useLeaveRoomMutation();
    const [isBecomePlayerModalVisible, setIsBecomePlayerModalVisible] = React.useState(false);
    const [isChangeMyParticipantNameModalVisible, setIsChangeMyParticipantNameModalVisible] = React.useState(false);
    const [isDeleteRoomModalVisible, setIsDeleteRoomModalVisible] = React.useState(false);

    const charactersRef = React.useRef(characters);
    React.useEffect(() => {
        charactersRef.current = characters;
    }, [characters]);
    const participantsRef = React.useRef(participants);
    React.useEffect(() => {
        participantsRef.current = participants;
    }, [participants]);
    const publicChannelNamesRef = React.useRef(publicChannelNames);
    React.useEffect(() => {
        publicChannelNamesRef.current = publicChannelNames;
    }, [publicChannelNames]);

    React.useEffect(() => {
        const data = getLogQueryResult.data;
        if (data == null) {
            return;
        }
        if (data.result.__typename !== 'RoomMessages') {
            // TODO: エラーメッセージを出す
            return;
        }
        if (charactersRef.current == null || publicChannelNamesRef.current == null || participantsRef.current == null) {
            return;
        }
        fileDownload(generateAsStaticHtml({
            ...publicChannelNamesRef.current,
            characters: charactersRef.current,
            messages: data.result,
            participants: participantsRef.current,
        }), `log_${moment(new Date()).format('YYYYMMDDHHmmss')}.html`);
    }, [getLogQueryResult.data]);

    if (typeof myAuth === 'string' || roomId == null || activeBoardPanel == null || boardPanels == null || characterPanel == null || gameEffectPanel == null || participantPanel == null || messagePanel == null || myValuePanel == null) {
        return null;
    }

    const me = participants?.get(myAuth.uid);

    return <><Menu triggerSubMenuAction='click' selectable={false} mode="horizontal">
        <Menu.SubMenu title="部屋">
            <Menu.Item onClick={() => dispatch(roomDrawerModule.actions.set({ editRoomDrawerVisibility: true }))}>
                編集
            </Menu.Item>
            <Menu.Item onClick={() => setIsDeleteRoomModalVisible(true)}>
                <span style={({ color: 'red' })}>削除</span>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={() => Modal.confirm({
                content: (<span>
                    <p>ログには、自分が見ることのできるメッセージだけでなく秘話などの非公開情報も全て含まれます。また、ログをダウンロードすると、システムメッセージによって全員に通知されます。</p>
                    <p>ログをダウンロードしますか？</p>
                </span>),
                onOk: () => {
                    if (roomId == null) {
                        return;
                    }
                    getLogQuery({ variables: { roomId } });
                }
            })}>
                ログをダウンロード
            </Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu title="ウィンドウ">
            <Menu.Item onClick={() => {
                dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: 'characterPanel' }, newValue: false }));
                dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: 'characterPanel' } }));
            }}>
                <div>
                    <span>{characterPanel.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
                    <span>キャラクター一覧</span>
                </div>
            </Menu.Item>
            <Menu.Item onClick={() => {
                dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: 'activeBoardPanel' }, newValue: false }));
                dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: 'activeBoardPanel' } }));
            }}>
                <div>
                    <span>{activeBoardPanel.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
                    <span>ボードビュアー</span>
                </div>
            </Menu.Item>
            <Menu.SubMenu title="ボードエディター">
                {
                    recordToArray(boardPanels).map((pair, i) => {
                        return (
                            <Menu.Item
                                key={pair.key}
                                onClick={() => {
                                    // これは通常の操作が行われた場合は必要ないが、設定ファイルがおかしくなったりしたときのために書いている。これがないと、設定ファイルを直接編集しない限りは、isMinimized: trueになっているpanelを永遠に削除することができない。
                                    dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: boardEditorPanel, panelId: pair.key }, newValue: false }));

                                    dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: boardEditorPanel, panelId: pair.key } }));
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
                    dispatch(roomConfigModule.actions.addBoardEditorPanelConfig({
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
                    recordToArray(boardPanels).map((pair, i) => {
                        return (
                            <Menu.Item
                                key={pair.key}
                                onClick={() => {
                                    // これは通常の操作が行われた場合は必要ないが、設定ファイルがおかしくなったりしたときのために書いている。これがないと、設定ファイルを直接編集しない限りは、isMinimized: trueになっているpanelを永遠に削除することができない。
                                    dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: 'messagePanel', panelId: pair.key }, newValue: false }));

                                    dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: 'messagePanel', panelId: pair.key } }));
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
                dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: 'myValuePanel' }, newValue: false }));
                dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: 'myValuePanel' } }));
            }}>
                <div>
                    <span>{myValuePanel.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
                    <span>コマ</span>
                </div>
            </Menu.Item>
            <Menu.Item onClick={() => {
                dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: 'gameEffectPanel' }, newValue: false }));
                dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: 'gameEffectPanel' } }));
            }}>
                <div>
                    <span>{gameEffectPanel.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
                    <span>SE, BGM</span>
                </div>
            </Menu.Item>
            <Menu.Item onClick={() => {
                dispatch(roomConfigModule.actions.setIsMinimized({ roomId, target: { type: 'participantPanel' }, newValue: false }));
                dispatch(roomConfigModule.actions.bringPanelToFront({ roomId, target: { type: 'participantPanel' } }));
            }}>
                <div>
                    <span>{participantPanel.isMinimized ? <Icon.BorderOutlined /> : <Icon.CheckSquareOutlined />}</span>
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
                leaveRoomMutation({ variables: { id: roomId } }).then(result => {
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
        roomCreatedByMe={myAuth.uid === createdBy} />
    </>;
};