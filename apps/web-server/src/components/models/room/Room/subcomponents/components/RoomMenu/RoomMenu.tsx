import * as Icon from '@ant-design/icons';
import { simpleId } from '@flocon-trpg/core';
import {
    ChangeParticipantNameDocument,
    DeleteRoomDocument,
    DeleteRoomFailureType,
    GetRoomAsListItemDocument,
    LeaveRoomDocument,
    ParticipantRole,
    PromoteFailureType,
    PromoteToPlayerDocument,
    ResetMessagesDocument,
    ResetRoomMessagesFailureType,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { recordToArray } from '@flocon-trpg/utils';
import { Input, Menu, Modal, Popover, Tooltip } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import classNames from 'classnames';
import produce from 'immer';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { useRouter } from 'next/router';
import React from 'react';
import { useMutation, useQuery } from 'urql';
import { editRoomModalVisibilityAtom } from '../../atoms/editRoomModalVisibilityAtom/editRoomModalVisibilityAtom';
import { useMe } from '../../hooks/useMe';
import { useRoomId } from '../../hooks/useRoomId';
import { GenerateLogModal } from './subcomponents/components/GenerageLogModal/GenerateLogModal';
import { RoomVolumeBar } from './subcomponents/components/RoomVolumeBar/RoomVolumeBar';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { defaultMemoPanelConfig } from '@/atoms/roomConfigAtom/types/memoPanelConfig';
import { defaultMessagePanelConfig } from '@/atoms/roomConfigAtom/types/messagePanelConfig';
import {
    defaultPanelOpacity,
    minPanelOpacity,
} from '@/atoms/roomConfigAtom/types/roomConfig/resources';
import { RoomConfigUtils } from '@/atoms/roomConfigAtom/types/roomConfig/utils';
import { FileSelectorModal } from '@/components/models/file/FileSelectorModal/FileSelectorModal';
import { Jdenticon } from '@/components/ui/Jdenticon/Jdenticon';
import { OpacityBar } from '@/components/ui/VolumeBar/VolumeBar';
import { useAddNotification } from '@/hooks/useAddNotification';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { useImmerUpdateAtom } from '@/hooks/useImmerUpdateAtom';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';
import { useSignOut } from '@/hooks/useSignOut';
import { firebaseUserValueAtom } from '@/pages/_app';
import { path } from '@/resources/path';
import { Styles } from '@/styles';
import { flex, flexRow, itemsCenter } from '@/styles/className';

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

const panelsOpacityModalVisibilityAtom = atom(false);

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
    const addRoomNotification = useAddNotification();
    const [inputValue, setInputValue] = React.useState('');
    const [isPosting, setIsPosting] = React.useState(false);
    const [, promoteToPlayer] = useMutation(PromoteToPlayerDocument);
    const [getRoomAsListItemResult, getRoomAsListItem] = useQuery({
        query: GetRoomAsListItemDocument,
        pause: true,
        variables: { roomId },
    });
    const requiresPlayerPasswordRef = React.useRef(getRoomAsListItem);
    React.useEffect(() => {
        requiresPlayerPasswordRef.current = getRoomAsListItem;
    }, [getRoomAsListItem]);
    React.useEffect(() => {
        setInputValue('');
        setIsPosting(false);
        requiresPlayerPasswordRef.current();
    }, [visible, roomId]);

    const title = '参加者に昇格';

    if (getRoomAsListItemResult.data?.result.__typename !== 'GetRoomAsListItemSuccessResult') {
        return (
            <Modal
                open={visible}
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
                open={visible}
                title={title}
                okButtonProps={{ disabled: isPosting }}
                onOk={() => {
                    setIsPosting(true);
                    promoteToPlayer({ roomId, password: inputValue }).then(e => {
                        if (e.error != null) {
                            addRoomNotification({
                                type: 'error',
                                error: e.error,
                                message: 'PromoteToPlayer Mutation でエラーが発生しました。',
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
                                type: 'warning',
                                message: '参加者への昇格に失敗しました。',
                                description: text,
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
            open={visible}
            title={title}
            okButtonProps={{ disabled: isPosting }}
            onOk={() => {
                setIsPosting(true);
                promoteToPlayer({ roomId }).then(e => {
                    if (e.error != null) {
                        addRoomNotification({
                            type: 'error',
                            error: e.error,
                            message: 'PromoteToPlayer Mutation でエラーが発生しました。',
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
                            type: 'warning',
                            message: '参加者への昇格に失敗しました。',
                            description: text,
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
    const addRoomNotification = useAddNotification();
    const [isPosting, setIsPosting] = React.useState(false);
    const [, deleteRoom] = useMutation(DeleteRoomDocument);
    React.useEffect(() => {
        setIsPosting(false);
    }, [visible, roomId]);

    const disabled = isPosting || !roomCreatedByMe;
    return (
        <Modal
            open={visible}
            title='部屋の削除'
            okButtonProps={{ disabled }}
            okType='danger'
            okText='削除する'
            cancelText={disabled ? '閉じる' : 'キャンセル'}
            onOk={() => {
                setIsPosting(true);
                deleteRoom({ id: roomId }).then(e => {
                    if (e.error != null) {
                        addRoomNotification({
                            type: 'error',
                            error: e.error,
                            message: 'DeleteRoom Mutation でエラーが発生しました。',
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
                            type: 'warning',
                            message: '部屋の削除に失敗しました。',
                            description: text,
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
    const addRoomNotification = useAddNotification();
    const [isPosting, setIsPosting] = React.useState(false);
    const [, resetMessages] = useMutation(ResetMessagesDocument);
    React.useEffect(() => {
        setIsPosting(false);
    }, [visible, roomId]);

    const disabled = isPosting || !roomCreatedByMe;
    return (
        <Modal
            open={visible}
            title='ログの初期化'
            okButtonProps={{ disabled }}
            okType='danger'
            okText='削除する'
            cancelText={disabled ? '閉じる' : 'キャンセル'}
            onOk={() => {
                setIsPosting(true);
                resetMessages({ roomId }).then(e => {
                    if (e.error != null) {
                        addRoomNotification({
                            type: 'error',
                            error: e.error,
                            message: 'ResetMessages Mutation でエラーが発生しました。',
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
                            type: 'warning',
                            message: '部屋の削除に失敗しました。',
                            description: text,
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

const PanelsOpacityModal: React.FC<{
    visible: boolean;
    onClose: () => void;
}> = ({ visible, onClose }) => {
    const [panelOpacity, setPanelOpacity] = useAtom(panelOpacityAtom);
    const opacityStyle: React.CSSProperties = React.useMemo(
        () => ({
            padding: '0 4px',
        }),
        []
    );
    return (
        <Modal
            open={visible}
            closable
            title='ウィンドウの透過度の設定'
            okButtonProps={{ style: { display: 'none' } }}
            cancelText='閉じる'
            onCancel={() => onClose()}
        >
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
    const addRoomNotification = useAddNotification();
    const [inputValue, setInputValue] = React.useState('');
    const [isPosting, setIsPosting] = React.useState(false);
    const [, changeParticipantName] = useMutation(ChangeParticipantNameDocument);
    React.useEffect(() => {
        setInputValue('');
        setIsPosting(false);
    }, [visible, roomId]);

    const onOk = () => {
        setIsPosting(true);
        changeParticipantName({ roomId, newName: inputValue }).then(e => {
            if (e.error != null) {
                addRoomNotification({
                    type: 'error',
                    error: e.error,
                    message: 'ChangeParticipantName Mutation でエラーが発生しました。',
                });
                onOkCore();
                return;
            }

            if (e.data?.result.failureType != null) {
                addRoomNotification({
                    type: 'warning',
                    message: '名前の変更に失敗しました。',
                });
                onOkCore();
                return;
            }

            onOkCore();
        });
    };

    return (
        <Modal
            open={visible}
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

const usePanelsMenuItem = () => {
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
    const setIsPanelsOpacityModalVisible = useSetAtom(panelsOpacityModalVisibilityAtom);

    const activeBoardPanelMenu = React.useMemo(() => {
        if (activeBoardPanel == null) {
            return null;
        }
        return {
            key: 'activeBoardPanelMenu',
            label: (
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
            ),
            onClick: () => {
                setRoomConfig(roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    roomConfig.panels.activeBoardPanel.isMinimized = false;
                    RoomConfigUtils.bringPanelToFront(roomConfig, {
                        type: 'activeBoardPanel',
                    });
                });
            },
        };
    }, [activeBoardPanel, setRoomConfig]);
    const boardPanelsMenu = React.useMemo(() => {
        if (boardPanels == null) {
            return null;
        }
        return {
            key: 'boardPanelsMenu',
            label: 'ボードエディター',
            children: [
                ...recordToArray(boardPanels).map((pair, i) => {
                    return {
                        key: pair.key,
                        onClick: () => {
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
                        },
                        label: (
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
                        ),
                    };
                }),
                { type: 'divider' },
                {
                    key: '新規作成@boardPanelsMenu',
                    label: (
                        <div>
                            <span>
                                <Icon.PlusOutlined />
                            </span>
                            <span>新規作成</span>
                        </div>
                    ),
                    onClick: () => {
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
                    },
                },
            ],
        };
    }, [boardPanels, setRoomConfig]);

    const characterPanelMenu = React.useMemo(() => {
        if (characterPanel == null) {
            return null;
        }
        return {
            key: 'characterPanelMenu',
            label: (
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
            ),
            onClick: () => {
                setRoomConfig(roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    roomConfig.panels.characterPanel.isMinimized = false;
                    RoomConfigUtils.bringPanelToFront(roomConfig, {
                        type: 'characterPanel',
                    });
                });
            },
        };
    }, [characterPanel, setRoomConfig]);
    const chatPalettePanelsMenu = React.useMemo(() => {
        if (chatPalettePanels == null) {
            return null;
        }
        return {
            key: 'chatPalettePanelsMenu',
            label: 'チャットパレット',
            children: [
                ...recordToArray(chatPalettePanels).map((pair, i) => {
                    return {
                        key: pair.key,
                        label: (
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
                        ),
                        onClick: () => {
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
                        },
                    };
                }),
                { type: 'divider' },
                {
                    key: '新規作成@chatPalettePanelsMenu',
                    label: (
                        <div>
                            <span>
                                <Icon.PlusOutlined />
                            </span>
                            <span>新規作成</span>
                        </div>
                    ),
                    onClick: () => {
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
                    },
                },
            ],
        };
    }, [chatPalettePanels, setRoomConfig]);
    const gameEffectPanelMenu = React.useMemo(() => {
        if (gameEffectPanel == null) {
            return null;
        }
        return {
            key: 'gameEffectPanelMenu',
            label: (
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
            ),
            onClick: () => {
                setRoomConfig(roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    roomConfig.panels.gameEffectPanel.isMinimized = false;
                    RoomConfigUtils.bringPanelToFront(roomConfig, {
                        type: 'gameEffectPanel',
                    });
                });
            },
        };
    }, [gameEffectPanel, setRoomConfig]);
    const memoPanelsMenu = React.useMemo(() => {
        if (memoPanels == null) {
            return null;
        }
        return {
            key: 'memoPanelsMenu',
            label: '共有メモ（部屋）',
            children: [
                ...recordToArray(memoPanels).map((pair, i) => {
                    return {
                        key: pair.key,
                        label: (
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
                        ),
                        onClick: () => {
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
                        },
                    };
                }),
                { type: 'divider' },
                {
                    key: '新規作成@memoPanelsMenu',
                    label: (
                        <div>
                            <span>
                                <Icon.PlusOutlined />
                            </span>
                            <span>新規作成</span>
                        </div>
                    ),
                    onClick: () => {
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
                    },
                },
            ],
        };
    }, [memoPanels, setRoomConfig]);
    const messagePanelsMenu = React.useMemo(() => {
        if (messagePanels == null) {
            return null;
        }
        return {
            key: 'messagePanelsMenu',
            label: 'メッセージ',
            children: [
                ...recordToArray(messagePanels).map((pair, i) => {
                    return {
                        key: pair.key,
                        label: (
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
                        ),
                        onClick: () => {
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
                        },
                    };
                }),
                { type: 'divider' },
                {
                    key: '新規作成@messagePanelsMenu',
                    label: (
                        <div>
                            <span>
                                <Icon.PlusOutlined />
                            </span>
                            <span>新規作成</span>
                        </div>
                    ),
                    onClick: () => {
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
                    },
                },
            ],
        };
    }, [messagePanels, setRoomConfig]);
    const participantPanelMenu = React.useMemo(() => {
        if (participantPanel == null) {
            return null;
        }
        return {
            key: 'participantPanelMenu',
            label: (
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
            ),
            onClick: () => {
                setRoomConfig(roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    roomConfig.panels.participantPanel.isMinimized = false;
                    RoomConfigUtils.bringPanelToFront(roomConfig, {
                        type: 'participantPanel',
                    });
                });
            },
        };
    }, [participantPanel, setRoomConfig]);
    const pieceValuePanelMenu = React.useMemo(() => {
        if (pieceValuePanel == null) {
            return null;
        }
        return {
            key: 'pieceValuePanelMenu',
            label: (
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
            ),
            onClick: () => {
                setRoomConfig(roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    roomConfig.panels.pieceValuePanel.isMinimized = false;
                    RoomConfigUtils.bringPanelToFront(roomConfig, {
                        type: 'pieceValuePanel',
                    });
                });
            },
        };
    }, [pieceValuePanel, setRoomConfig]);

    const menuItem = React.useMemo((): ItemType => {
        return {
            key: 'windowsMenuItem',
            label: 'ウィンドウ',
            children: [
                characterPanelMenu,
                activeBoardPanelMenu,
                boardPanelsMenu,
                chatPalettePanelsMenu,
                messagePanelsMenu,
                memoPanelsMenu,
                pieceValuePanelMenu,
                gameEffectPanelMenu,
                participantPanelMenu,
                { type: 'divider' },
                {
                    key: '透過度の設定',
                    label: '透過度の設定',
                    onClick: () => setIsPanelsOpacityModalVisible(true),
                },
            ],
        };
    }, [
        activeBoardPanelMenu,
        boardPanelsMenu,
        characterPanelMenu,
        chatPalettePanelsMenu,
        gameEffectPanelMenu,
        memoPanelsMenu,
        messagePanelsMenu,
        participantPanelMenu,
        pieceValuePanelMenu,
        setIsPanelsOpacityModalVisible,
    ]);

    return menuItem;
};

export const RoomMenu: React.FC = React.memo(function RoomMenu() {
    const me = useMe();
    const myUserUid = useMyUserUid();
    const firebaseUser = useAtomValue(firebaseUserValueAtom);
    const router = useRouter();
    const signOut = useSignOut();
    const roomId = useRoomId();
    const createdBy = useRoomStateValueSelector(state => state.createdBy);

    const [showBackgroundBoardViewer, setShowBackgroundBoardViewerAtom] = useAtom(
        showBackgroundBoardViewerAtom
    );

    const [, leaveRoomMutation] = useMutation(LeaveRoomDocument);
    const [isBecomePlayerModalVisible, setIsBecomePlayerModalVisible] = React.useState(false);
    const [isChangeMyParticipantNameModalVisible, setIsChangeMyParticipantNameModalVisible] =
        React.useState(false);
    const [isDeleteRoomModalVisible, setIsDeleteRoomModalVisible] = React.useState(false);
    const [isPanelsOpacityModalVisible, setIsPanelsOpacityModalVisible] = useAtom(
        panelsOpacityModalVisibilityAtom
    );
    const [isResetMessagesModalVisible, setIsResetMessagesModalVisible] = React.useState(false);
    const [isGenerateLogModalVisible, setIsGenerateSimpleLogModalVisible] = React.useState(false);
    const [fileSelectorModalVisible, setFileSelectorModalVisible] = React.useState(false);
    const setEditRoomModalVisibility = useUpdateAtom(editRoomModalVisibilityAtom);

    const panelsMenuItem = usePanelsMenuItem();

    return React.useMemo(() => {
        if (me == null || myUserUid == null || firebaseUser == null || roomId == null) {
            return null;
        }
        const menuItems: ItemType[] = [
            {
                key: 'logo@menu',
                label: <img src='/assets/logo.png' width={24} height={24} />,
                onClick: () => router.push('/'),
            },
            {
                key: '部屋@menu',
                label: '部屋',
                children: [
                    {
                        key: '編集@menu',
                        label: '編集',
                        onClick: () => setEditRoomModalVisibility(true),
                    },
                    {
                        key: '削除@menu',
                        label: <span style={Styles.Text.danger}>削除</span>,
                        onClick: () => setIsDeleteRoomModalVisible(true),
                    },
                    {
                        key: 'ログの初期化@menu',
                        label: <span style={Styles.Text.danger}>ログの初期化</span>,
                        onClick: () => setIsResetMessagesModalVisible(true),
                    },
                    { type: 'divider' },
                    {
                        key: 'ログをダウンロード@menu',
                        label: 'ログをダウンロード',
                        onClick: () => setIsGenerateSimpleLogModalVisible(true),
                    },
                ],
            },
            {
                key: '表示@menu',
                label: '表示',
                children: [
                    panelsMenuItem,
                    {
                        key: '最背面にボードビュアーを表示する@menu',
                        label: (
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
                        ),
                        onClick: () => {
                            setShowBackgroundBoardViewerAtom(!showBackgroundBoardViewer);
                        },
                    },
                ],
            },
            {
                key: 'ボリューム@menu',
                label: (
                    <Popover trigger='click' content={<RoomVolumeBar />}>
                        ボリューム
                    </Popover>
                ),
            },
            {
                key: 'アップローダー@menu',
                label: 'アップローダー',
                onClick: () => setFileSelectorModalVisible(true),
            },
            {
                key: '自分のParticipant@menu',
                label: (
                    <div className={classNames(flex, flexRow, itemsCenter)}>
                        <Jdenticon
                            hashOrValue={myUserUid}
                            size={20}
                            tooltipMode={{ type: 'userUid' }}
                        />
                        <span style={{ marginLeft: 4 }}>{me.name}</span>
                    </div>
                ),
                children: [
                    {
                        key: '名前を変更@menu',
                        label: '名前を変更',
                        onClick: () => setIsChangeMyParticipantNameModalVisible(true),
                    },
                    {
                        key: '参加者に昇格@menu',
                        label:
                            me.role === ParticipantRole.Player ||
                            me.role === ParticipantRole.Master ? (
                                <Tooltip title='すでに昇格済みです。'>参加者に昇格</Tooltip>
                            ) : (
                                '参加者に昇格'
                            ),
                        disabled:
                            me.role === ParticipantRole.Player ||
                            me.role === ParticipantRole.Master,
                        onClick: () => setIsBecomePlayerModalVisible(true),
                    },
                    {
                        key: '退室する@menu',
                        label: '退室する',
                        onClick: () => {
                            leaveRoomMutation({ id: roomId }).then(result => {
                                if (result.data == null) {
                                    return;
                                }
                                router.push(path.rooms.index);
                            });
                        },
                    },
                ],
            },
            {
                key: '自分のUser@menu',
                icon: <Icon.UserOutlined />,
                label: `${firebaseUser.displayName} - ${firebaseUser.uid}`,
                children: [
                    {
                        key: 'ログアウト@menu',
                        label: 'ログアウト',
                        onClick: () => signOut(),
                    },
                ],
            },
        ];

        return (
            <>
                <Menu
                    items={menuItems}
                    triggerSubMenuAction='click'
                    selectable={false}
                    mode='horizontal'
                />
                <FileSelectorModal
                    visible={fileSelectorModalVisible}
                    onSelect={null}
                    defaultFileTypeFilter={null}
                    onClose={() => setFileSelectorModalVisible(false)}
                    uploaderFileBrowserHeight={null}
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
                <PanelsOpacityModal
                    visible={isPanelsOpacityModalVisible}
                    onClose={() => setIsPanelsOpacityModalVisible(false)}
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
        me,
        myUserUid,
        firebaseUser,
        roomId,
        panelsMenuItem,
        showBackgroundBoardViewer,
        fileSelectorModalVisible,
        isBecomePlayerModalVisible,
        isChangeMyParticipantNameModalVisible,
        isDeleteRoomModalVisible,
        createdBy,
        isPanelsOpacityModalVisible,
        isResetMessagesModalVisible,
        isGenerateLogModalVisible,
        router,
        setEditRoomModalVisibility,
        setShowBackgroundBoardViewerAtom,
        leaveRoomMutation,
        signOut,
        setIsPanelsOpacityModalVisible,
    ]);
});
