import { Input, Menu, Modal, Popover, Tooltip } from 'antd';
import React from 'react';
import {
    ChangeParticipantNameDocument,
    DeleteRoomDocument,
    DeleteRoomFailureType,
    LeaveRoomDocument,
    ParticipantRole,
    PromoteFailureType,
    PromoteToPlayerDocument,
    GetRoomAsListItemDocument,
    ResetMessagesDocument,
    ResetRoomMessagesFailureType,
} from '@flocon-trpg/typed-document-node';
import * as Icon from '@ant-design/icons';
import { RoomVolumeBar } from './RoomVolumeBar';
import { Jdenticon } from '../../ui/Jdenticon';
import { path } from '../../../resources/path';
import { useRouter } from 'next/router';
import { recordToArray } from '@flocon-trpg/utils';
import { FilesManagerDrawer } from './file/FilesManagerDrawer';
import { FilesManagerDrawerType, none } from '../../../utils/types';
import { useMe } from '../../../hooks/useMe';
import { useMyUserUid } from '../../../hooks/useMyUserUid';
import { useSignOut } from '../../../hooks/useSignOut';
import classNames from 'classnames';
import { flex, flexRow, itemsCenter } from '../../../utils/className';
import { MyAuthContext } from '../../../contexts/MyAuthContext';
import { GenerateLogModal } from './message/GenerateLogModal';
import { useLazyQuery, useMutation } from '@apollo/client';
import { roomNotificationsAtom, roomAtom, graphQLErrors, text } from '../../../atoms/room/roomAtom';
import { useAtomSelector } from '../../../atoms/useAtomSelector';
import { roomConfigAtom } from '../../../atoms/roomConfig/roomConfigAtom';
import { RoomConfigUtils } from '../../../atoms/roomConfig/types/roomConfig/utils';
import { simpleId } from '@flocon-trpg/core';
import { defaultMessagePanelConfig } from '../../../atoms/roomConfig/types/messagePanelConfig';
import { defaultMemoPanelConfig } from '../../../atoms/roomConfig/types/memoPanelConfig';
import { useUpdateAtom } from 'jotai/utils';
import { useImmerUpdateAtom } from '../../../atoms/useImmerUpdateAtom';
import { editRoomDrawerVisibilityAtom } from '../../../atoms/overlay/editRoomDrawerVisibilityAtom';
import { OpacityBar } from '../../ui/VolumeBar';
import { atom, useAtom } from 'jotai';
import produce from 'immer';
import {
    defaultPanelOpacity,
    minPanelOpacity,
} from '../../../atoms/roomConfig/types/roomConfig/resources';
import { Styles } from '../../../styles';

const panelOpacityAtom = atom(
    get => get(roomConfigAtom)?.panelOpacity,
    (get, set, newValue: number) => {
        set(roomConfigAtom, roomConfig => {
            if (roomConfig == null) {
                return roomConfig;
            }
            return produce(roomConfig, roomConfig => {
                roomConfig.panelOpacity = newValue;
            });
        });
    }
);

const showBackgroundBoardViewerAtom = atom(
    get => get(roomConfigAtom)?.showBackgroundBoardViewer,
    (get, set, newValue: boolean) => {
        set(roomConfigAtom, roomConfig => {
            if (roomConfig == null) {
                return roomConfig;
            }
            return produce(roomConfig, roomConfig => {
                roomConfig.showBackgroundBoardViewer = newValue;
            });
        });
    }
);

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
    const addRoomNotification = useUpdateAtom(roomNotificationsAtom);
    const [inputValue, setInputValue] = React.useState('');
    const [isPosting, setIsPosting] = React.useState(false);
    const [promoteToPlayer] = useMutation(PromoteToPlayerDocument);
    const [getRoomAsListItem, getRoomAsListItemResult] = useLazyQuery(GetRoomAsListItemDocument);
    const requiresPlayerPasswordRef = React.useRef(getRoomAsListItem);
    React.useEffect(() => {
        requiresPlayerPasswordRef.current = getRoomAsListItem;
    }, [getRoomAsListItem]);
    React.useEffect(() => {
        setInputValue('');
        setIsPosting(false);
        requiresPlayerPasswordRef.current({ variables: { roomId } });
    }, [visible, roomId]);

    const title = '参加者に昇格';

    if (getRoomAsListItemResult.data?.result.__typename !== 'GetRoomAsListItemSuccessResult') {
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
    if (getRoomAsListItemResult.data.result.room.requiresPlayerPassword) {
        return (
            <Modal
                visible={visible}
                title={title}
                okButtonProps={{ disabled: isPosting }}
                onOk={() => {
                    setIsPosting(true);
                    promoteToPlayer({ variables: { roomId, password: inputValue } }).then(e => {
                        if (e.errors != null) {
                            addRoomNotification({
                                type: graphQLErrors,
                                createdAt: new Date().getTime(),
                                errors: e.errors,
                            });
                            onOk();
                            return;
                        }

                        if (e.data?.result.failureType != null) {
                            let text: string | undefined;
                            switch (e.data?.result.failureType) {
                                case PromoteFailureType.WrongPassword:
                                    text = 'パスワードが誤っています。';
                                    break;
                                case PromoteFailureType.NoNeedToPromote:
                                    text = '既に昇格済みです。';
                                    break;
                                default:
                                    text = undefined;
                                    break;
                            }
                            addRoomNotification({
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
                onCancel={() => onCancel()}
            >
                <Input.Password
                    placeholder='パスワード'
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
                        addRoomNotification({
                            type: graphQLErrors,
                            createdAt: new Date().getTime(),
                            errors: e.errors,
                        });
                        onOk();
                        return;
                    }

                    if (e.data?.result.failureType != null) {
                        let text: string | undefined;
                        switch (e.data?.result.failureType) {
                            case PromoteFailureType.WrongPassword:
                                text = 'パスワードが誤っています。';
                                break;
                            case PromoteFailureType.NoNeedToPromote:
                                text = '既に昇格済みです。';
                                break;
                            default:
                                text = undefined;
                                break;
                        }
                        addRoomNotification({
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
            onCancel={() => onCancel()}
        >
            パスワードなしで参加者に昇格できます。昇格しますか？
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
    const addRoomNotification = useUpdateAtom(roomNotificationsAtom);
    const [isPosting, setIsPosting] = React.useState(false);
    const [deleteRoom] = useMutation(DeleteRoomDocument);
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
                        addRoomNotification({
                            type: graphQLErrors,
                            createdAt: new Date().getTime(),
                            errors: e.errors,
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
                            case DeleteRoomFailureType.NotFound:
                                text = '部屋が見つかりませんでした。';
                                break;
                            default:
                                text = undefined;
                                break;
                        }
                        addRoomNotification({
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

type ResetMessagesModalProps = {
    roomId: string;
    roomCreatedByMe: boolean;
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
};

const ResetMessagesModal: React.FC<ResetMessagesModalProps> = ({
    roomId,
    visible,
    onOk,
    onCancel,
    roomCreatedByMe,
}: DeleteRoomModalProps) => {
    const addRoomNotification = useUpdateAtom(roomNotificationsAtom);
    const [isPosting, setIsPosting] = React.useState(false);
    const [resetMessages] = useMutation(ResetMessagesDocument);
    React.useEffect(() => {
        setIsPosting(false);
    }, [visible, roomId]);

    const disabled = isPosting || !roomCreatedByMe;
    return (
        <Modal
            visible={visible}
            title='ログの初期化'
            okButtonProps={{ disabled }}
            okType='danger'
            okText='削除する'
            cancelText={disabled ? '閉じる' : 'キャンセル'}
            onOk={() => {
                setIsPosting(true);
                resetMessages({ variables: { roomId } }).then(e => {
                    if (e.errors != null) {
                        addRoomNotification({
                            type: graphQLErrors,
                            createdAt: new Date().getTime(),
                            errors: e.errors,
                        });
                        onOk();
                        return;
                    }

                    if (e.data?.result.failureType != null) {
                        let text: string | undefined;
                        switch (e.data?.result.failureType) {
                            case ResetRoomMessagesFailureType.NotAuthorized:
                            case ResetRoomMessagesFailureType.NotParticipant:
                                text = 'この部屋の参加者でないため、削除できません。';
                                break;
                            case ResetRoomMessagesFailureType.RoomNotFound:
                                text = '部屋が存在しません。';
                                break;
                            default:
                                text = undefined;
                                break;
                        }
                        addRoomNotification({
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
            onCancel={() => onCancel()}
        >
            {roomCreatedByMe ? (
                <div>
                    <p>
                        この部屋のログを全て削除します。この部屋の参加者でない限り、ログを削除することはできません。
                    </p>
                    <p style={{ fontWeight: 'bold' }}>ログを削除すると元に戻すことはできません。</p>
                    <p>本当によろしいですか？</p>
                </div>
            ) : (
                <div>この部屋の参加者でないため、削除することができません。</div>
            )}
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
    const addRoomNotification = useUpdateAtom(roomNotificationsAtom);
    const [inputValue, setInputValue] = React.useState('');
    const [isPosting, setIsPosting] = React.useState(false);
    const [changeParticipantName] = useMutation(ChangeParticipantNameDocument);
    React.useEffect(() => {
        setInputValue('');
        setIsPosting(false);
    }, [visible, roomId]);

    const onOk = () => {
        setIsPosting(true);
        changeParticipantName({ variables: { roomId, newName: inputValue } }).then(e => {
            if (e.errors != null) {
                addRoomNotification({
                    type: graphQLErrors,
                    createdAt: new Date().getTime(),
                    errors: e.errors,
                });
                onOkCore();
                return;
            }

            if (e.data?.result.failureType != null) {
                addRoomNotification({
                    type: text,
                    notification: {
                        type: 'warning',
                        message: '名前の変更に失敗しました。',
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

const PanelsMenu: React.FC = () => {
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);
    const activeBoardPanel = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.activeBoardPanel
    );
    const boardPanels = useAtomSelector(roomConfigAtom, state => state?.panels.boardEditorPanels);
    const characterPanel = useAtomSelector(roomConfigAtom, state => state?.panels.characterPanel);
    const chatPalettePanels = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.chatPalettePanels
    );
    const gameEffectPanel = useAtomSelector(roomConfigAtom, state => state?.panels.gameEffectPanel);
    const participantPanel = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.participantPanel
    );
    const memoPanels = useAtomSelector(roomConfigAtom, state => state?.panels.memoPanels);
    const messagePanels = useAtomSelector(roomConfigAtom, state => state?.panels.messagePanels);
    const pieceValuePanel = useAtomSelector(roomConfigAtom, state => state?.panels.pieceValuePanel);
    const [panelOpacity, setPanelOpacity] = useAtom(panelOpacityAtom);

    const activeBoardPanelMenu = React.useMemo(() => {
        if (activeBoardPanel == null) {
            return null;
        }
        return (
            <Menu.Item
                onClick={() => {
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        roomConfig.panels.activeBoardPanel.isMinimized = false;
                        RoomConfigUtils.bringPanelToFront(roomConfig, {
                            type: 'activeBoardPanel',
                        });
                    });
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
        );
    }, [activeBoardPanel, setRoomConfig]);
    const boardPanelsMenu = React.useMemo(() => {
        if (boardPanels == null) {
            return null;
        }
        return (
            <Menu.SubMenu title='ボードエディター'>
                {recordToArray(boardPanels).map((pair, i) => {
                    return (
                        <Menu.Item
                            key={pair.key}
                            onClick={() => {
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    const boardEditorPanel =
                                        roomConfig?.panels.boardEditorPanels[pair.key];
                                    if (boardEditorPanel == null) {
                                        return;
                                    }

                                    // これは通常の操作が行われた場合は必要ないが、設定ファイルがおかしくなったりしたときのために書いている。これがないと、設定ファイルを直接編集しない限りは、isMinimized: trueになっているpanelを永遠に削除することができない。
                                    boardEditorPanel.isMinimized = false;

                                    RoomConfigUtils.bringPanelToFront(roomConfig, {
                                        type: 'boardEditorPanel',
                                        panelId: pair.key,
                                    });
                                });
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
                        setRoomConfig(roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            const panelId = simpleId();
                            roomConfig.panels.boardEditorPanels[panelId] = {
                                activeBoardId: undefined,
                                boards: {},
                                isMinimized: false,
                                x: 10,
                                y: 10,
                                width: 400,
                                height: 300,
                                zIndex: 0,
                            };
                            RoomConfigUtils.bringPanelToFront(roomConfig, {
                                type: 'boardEditorPanel',
                                panelId,
                            });
                        });
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
        );
    }, [boardPanels, setRoomConfig]);
    const characterPanelMenu = React.useMemo(() => {
        if (characterPanel == null) {
            return null;
        }
        return (
            <Menu.Item
                onClick={() => {
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        roomConfig.panels.characterPanel.isMinimized = false;
                        RoomConfigUtils.bringPanelToFront(roomConfig, {
                            type: 'characterPanel',
                        });
                    });
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
        );
    }, [characterPanel, setRoomConfig]);
    const chatPalettePanelsMenu = React.useMemo(() => {
        if (chatPalettePanels == null) {
            return null;
        }
        return (
            <Menu.SubMenu title='チャットパレット'>
                {recordToArray(chatPalettePanels).map((pair, i) => {
                    return (
                        <Menu.Item
                            key={pair.key}
                            onClick={() => {
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    const chatPalettePanel =
                                        roomConfig?.panels.chatPalettePanels[pair.key];
                                    if (chatPalettePanel == null) {
                                        return;
                                    }

                                    // これは通常の操作が行われた場合は必要ないが、設定ファイルがおかしくなったりしたときのために書いている。これがないと、設定ファイルを直接編集しない限りは、isMinimized: trueになっているpanelを永遠に削除することができない。
                                    chatPalettePanel.isMinimized = false;

                                    RoomConfigUtils.bringPanelToFront(roomConfig, {
                                        type: 'chatPalettePanel',
                                        panelId: pair.key,
                                    });
                                });
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
                        setRoomConfig(roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            const panelId = simpleId();
                            roomConfig.panels.chatPalettePanels[panelId] = {
                                isMinimized: false,
                                x: 10,
                                y: 10,
                                width: 400,
                                height: 300,
                                isPrivateMessageMode: false,
                                customCharacterName: '',
                                zIndex: 0,
                            };
                            RoomConfigUtils.bringPanelToFront(roomConfig, {
                                type: 'chatPalettePanel',
                                panelId,
                            });
                        });
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
        );
    }, [chatPalettePanels, setRoomConfig]);
    const gameEffectPanelMenu = React.useMemo(() => {
        if (gameEffectPanel == null) {
            return null;
        }
        return (
            <Menu.Item
                onClick={() => {
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        roomConfig.panels.gameEffectPanel.isMinimized = false;
                        RoomConfigUtils.bringPanelToFront(roomConfig, {
                            type: 'gameEffectPanel',
                        });
                    });
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
        );
    }, [gameEffectPanel, setRoomConfig]);
    const memoPanelsMenu = React.useMemo(() => {
        if (memoPanels == null) {
            return null;
        }
        return (
            <Menu.SubMenu title='共有メモ（部屋）'>
                {recordToArray(memoPanels).map((pair, i) => {
                    return (
                        <Menu.Item
                            key={pair.key}
                            onClick={() => {
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    const memoPanel = roomConfig?.panels.memoPanels[pair.key];
                                    if (memoPanel == null) {
                                        return;
                                    }

                                    // これは通常の操作が行われた場合は必要ないが、設定ファイルがおかしくなったりしたときのために書いている。これがないと、設定ファイルを直接編集しない限りは、isMinimized: trueになっているpanelを永遠に削除することができない。
                                    memoPanel.isMinimized = false;

                                    RoomConfigUtils.bringPanelToFront(roomConfig, {
                                        type: 'memoPanel',
                                        panelId: pair.key,
                                    });
                                });
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
                        setRoomConfig(roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            const panelId = simpleId();
                            roomConfig.panels.memoPanels[panelId] = defaultMemoPanelConfig();
                            RoomConfigUtils.bringPanelToFront(roomConfig, {
                                type: 'memoPanel',
                                panelId,
                            });
                        });
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
        );
    }, [memoPanels, setRoomConfig]);
    const messagePanelsMenu = React.useMemo(() => {
        if (messagePanels == null) {
            return null;
        }
        return (
            <Menu.SubMenu title='メッセージ'>
                {recordToArray(messagePanels).map((pair, i) => {
                    return (
                        <Menu.Item
                            key={pair.key}
                            onClick={() => {
                                setRoomConfig(roomConfig => {
                                    if (roomConfig == null) {
                                        return;
                                    }
                                    const messagePanel = roomConfig?.panels.messagePanels[pair.key];
                                    if (messagePanel == null) {
                                        return;
                                    }

                                    // これは通常の操作が行われた場合は必要ないが、設定ファイルがおかしくなったりしたときのために書いている。これがないと、設定ファイルを直接編集しない限りは、isMinimized: trueになっているpanelを永遠に削除することができない。
                                    messagePanel.isMinimized = false;

                                    RoomConfigUtils.bringPanelToFront(roomConfig, {
                                        type: 'messagePanel',
                                        panelId: pair.key,
                                    });
                                });
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
                        setRoomConfig(roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            const panelId = simpleId();
                            roomConfig.panels.messagePanels[panelId] = defaultMessagePanelConfig();
                            RoomConfigUtils.bringPanelToFront(roomConfig, {
                                type: 'messagePanel',
                                panelId,
                            });
                        });
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
        );
    }, [messagePanels, setRoomConfig]);
    const participantPanelMenu = React.useMemo(() => {
        if (participantPanel == null) {
            return null;
        }
        return (
            <Menu.Item
                onClick={() => {
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        roomConfig.panels.participantPanel.isMinimized = false;
                        RoomConfigUtils.bringPanelToFront(roomConfig, {
                            type: 'participantPanel',
                        });
                    });
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
        );
    }, [participantPanel, setRoomConfig]);
    const pieceValuePanelMenu = React.useMemo(() => {
        if (pieceValuePanel == null) {
            return null;
        }
        return (
            <Menu.Item
                onClick={() => {
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        roomConfig.panels.pieceValuePanel.isMinimized = false;
                        RoomConfigUtils.bringPanelToFront(roomConfig, {
                            type: 'pieceValuePanel',
                        });
                    });
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
        );
    }, [pieceValuePanel, setRoomConfig]);
    const opacityStyle: React.CSSProperties = React.useMemo(
        () => ({
            padding: '0 4px',
        }),
        []
    );

    return (
        <Menu.SubMenu title='ウィンドウ'>
            {characterPanelMenu}
            {activeBoardPanelMenu}
            {boardPanelsMenu}
            {chatPalettePanelsMenu}
            {messagePanelsMenu}
            {memoPanelsMenu}
            {pieceValuePanelMenu}
            {gameEffectPanelMenu}
            {participantPanelMenu}
            <Menu.Divider />
            <div className={classNames(flex, flexRow, itemsCenter)} style={opacityStyle}>
                <div>透過度</div>
                <OpacityBar
                    value={panelOpacity ?? defaultPanelOpacity}
                    minValue={minPanelOpacity}
                    onChange={setPanelOpacity}
                    inputNumberType='0-1'
                    readonly={false}
                />
            </div>
        </Menu.SubMenu>
    );
};

export const RoomMenu: React.FC = React.memo(function RoomMenu() {
    const me = useMe();
    const myUserUid = useMyUserUid();
    const myAuth = React.useContext(MyAuthContext);
    const router = useRouter();
    const signOut = useSignOut();
    const roomId = useAtomSelector(roomAtom, state => state.roomId);
    const createdBy = useAtomSelector(roomAtom, state => state.roomState?.state?.createdBy);

    const [showBackgroundBoardViewer, setShowBackgroundBoardViewerAtom] = useAtom(
        showBackgroundBoardViewerAtom
    );

    const [leaveRoomMutation] = useMutation(LeaveRoomDocument);
    const [isBecomePlayerModalVisible, setIsBecomePlayerModalVisible] = React.useState(false);
    const [isChangeMyParticipantNameModalVisible, setIsChangeMyParticipantNameModalVisible] =
        React.useState(false);
    const [isDeleteRoomModalVisible, setIsDeleteRoomModalVisible] = React.useState(false);
    const [isResetMessagesModalVisible, setIsResetMessagesModalVisible] = React.useState(false);
    const [isGenerateLogModalVisible, setIsGenerateSimpleLogModalVisible] = React.useState(false);
    const [filesManagerDrawerType, setFilesManagerDrawerType] =
        React.useState<FilesManagerDrawerType | null>(null);
    const setEditRoomDrawerVisibility = useUpdateAtom(editRoomDrawerVisibilityAtom);

    return React.useMemo(() => {
        if (me == null || myUserUid == null || typeof myAuth === 'string' || roomId == null) {
            return null;
        }

        return (
            <>
                <Menu triggerSubMenuAction='click' selectable={false} mode='horizontal'>
                    <Menu.Item onClick={() => router.push('/')}>
                        <img src='/assets/logo.png' width={24} height={24} />
                    </Menu.Item>
                    <Menu.SubMenu title='部屋'>
                        <Menu.Item onClick={() => setEditRoomDrawerVisibility(true)}>
                            編集
                        </Menu.Item>
                        <Menu.Item onClick={() => setIsDeleteRoomModalVisible(true)}>
                            <span style={Styles.Text.danger}>削除</span>
                        </Menu.Item>
                        <Menu.Item onClick={() => setIsResetMessagesModalVisible(true)}>
                            <span style={Styles.Text.danger}>ログの初期化</span>
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item onClick={() => setIsGenerateSimpleLogModalVisible(true)}>
                            ログをダウンロード
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title='表示'>
                        <PanelsMenu />
                        <Menu.Item
                            onClick={() => {
                                setShowBackgroundBoardViewerAtom(!showBackgroundBoardViewer);
                            }}
                        >
                            <div>
                                <span>
                                    {showBackgroundBoardViewer ? (
                                        <Icon.CheckSquareOutlined />
                                    ) : (
                                        <Icon.BorderOutlined />
                                    )}
                                </span>
                                <span>最背面にボードビュアーを表示する</span>
                            </div>
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.Item>
                        <Popover trigger='click' content={<RoomVolumeBar roomId={roomId} />}>
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
                                me.role === ParticipantRole.Player ||
                                me.role === ParticipantRole.Master
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
                                {myAuth.displayName} - {myAuth.uid}
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
                <ResetMessagesModal
                    visible={isResetMessagesModalVisible}
                    onOk={() => setIsResetMessagesModalVisible(false)}
                    onCancel={() => setIsResetMessagesModalVisible(false)}
                    roomId={roomId}
                    roomCreatedByMe={myUserUid === createdBy}
                />
                <GenerateLogModal
                    visible={isGenerateLogModalVisible}
                    onClose={() => setIsGenerateSimpleLogModalVisible(false)}
                    roomId={roomId}
                />
            </>
        );
    }, [
        createdBy,
        filesManagerDrawerType,
        isBecomePlayerModalVisible,
        isChangeMyParticipantNameModalVisible,
        isDeleteRoomModalVisible,
        isGenerateLogModalVisible,
        isResetMessagesModalVisible,
        leaveRoomMutation,
        me,
        myAuth,
        myUserUid,
        roomId,
        router,
        setEditRoomDrawerVisibility,
        setShowBackgroundBoardViewerAtom,
        showBackgroundBoardViewer,
        signOut,
    ]);
});
