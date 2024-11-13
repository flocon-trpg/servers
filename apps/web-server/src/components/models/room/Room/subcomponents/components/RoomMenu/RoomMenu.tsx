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
} from '@flocon-trpg/typed-document-node';
import { recordToArray } from '@flocon-trpg/utils';
import { useNavigate } from '@tanstack/react-router';
import { Input, Menu, Modal, Popover, Tooltip } from 'antd';
import { ItemType } from 'antd/lib/menu/interface';
import classNames from 'classnames';
import { useAtom, useAtomValue, useSetAtom } from 'jotai/react';
import { atom } from 'jotai/vanilla';
import React from 'react';
import { useMutation, useQuery } from 'urql';
import { editRoomModalVisibilityAtom } from '../../atoms/editRoomModalVisibilityAtom/editRoomModalVisibilityAtom';
import { useMe } from '../../hooks/useMe';
import { useRoomId } from '../../hooks/useRoomId';
import { GenerateLogModal } from './subcomponents/components/GenerageLogModal/GenerateLogModal';
import { RoomVolumeBar } from './subcomponents/components/RoomVolumeBar/RoomVolumeBar';
import {
    bringPanelToFront,
    custom,
    roomConfigAtomFamily,
} from '@/atoms/roomConfigAtom/roomConfigAtom';
import { defaultMemoPanelConfig } from '@/atoms/roomConfigAtom/types/memoPanelConfig';
import { defaultMessagePanelConfig } from '@/atoms/roomConfigAtom/types/messagePanelConfig';
import {
    defaultPanelOpacity,
    minPanelOpacity,
} from '@/atoms/roomConfigAtom/types/roomConfig/resources';
import { FileSelectorModal } from '@/components/models/file/FileSelectorModal/FileSelectorModal';
import { Jdenticon } from '@/components/ui/Jdenticon/Jdenticon';
import { OpacityBar } from '@/components/ui/VolumeBar/VolumeBar';
import { useAddNotification } from '@/hooks/useAddNotification';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';
import { firebaseUserValueAtom } from '@/hooks/useSetupApp';
import { useSignOut } from '@/hooks/useSignOut';
import { useSingleExecuteAsync0, useSingleExecuteAsync1 } from '@/hooks/useSingleExecuteAsync';
import { Styles } from '@/styles';
import { flex, flexRow, itemsCenter } from '@/styles/className';

const usePanelOpacity = (roomId: string) => {
    const [roomConfig, reduceRoomConfig] = useAtom(roomConfigAtomFamily(roomId));
    const setPanelOpacity = React.useCallback(
        (newValue: number) => {
            reduceRoomConfig({
                type: custom,
                action: roomConfig => {
                    roomConfig.panelOpacity = newValue;
                },
            });
        },
        [reduceRoomConfig],
    );
    return [roomConfig.panelOpacity, setPanelOpacity] as const;
};

const useShowBackgroundBoardViewer = (roomId: string) => {
    const [roomConfig, reduceRoomConfig] = useAtom(roomConfigAtomFamily(roomId));
    const setPanelOpacity = React.useCallback(
        (newValue: boolean) => {
            reduceRoomConfig({
                type: custom,
                action: roomConfig => {
                    roomConfig.showBackgroundBoardViewer = newValue;
                },
            });
        },
        [reduceRoomConfig],
    );
    return [roomConfig.showBackgroundBoardViewer, setPanelOpacity] as const;
};

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
    const [, promoteToPlayer] = useMutation(PromoteToPlayerDocument);
    const [getRoomAsListItemResult, getRoomAsListItem] = useQuery({
        query: GetRoomAsListItemDocument,
        pause: true,
        variables: { roomId },
    });
    const getRoomAsListItemRef = React.useRef(getRoomAsListItem);
    React.useEffect(() => {
        getRoomAsListItemRef.current = getRoomAsListItem;
    }, [getRoomAsListItem]);
    const onOkAsync = React.useCallback(
        async (requiresPlayerPassword: boolean) => {
            const e = await promoteToPlayer({
                roomId,
                password: requiresPlayerPassword ? inputValue : undefined,
            });
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
        },
        [addRoomNotification, inputValue, onOk, promoteToPlayer, roomId],
    );
    const { execute, isExecuting } = useSingleExecuteAsync1(onOkAsync);
    React.useEffect(() => {
        setInputValue('');
        getRoomAsListItemRef.current();
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
                okButtonProps={{ disabled: isExecuting }}
                onOk={execute == null ? undefined : () => execute(true)}
                onCancel={() => onCancel()}
            >
                <Input.Password
                    placeholder="パスワード"
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
            okButtonProps={{ disabled: isExecuting }}
            onOk={execute == null ? undefined : () => execute(false)}
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
    const [, deleteRoom] = useMutation(DeleteRoomDocument);
    const { execute, isExecuting } = useSingleExecuteAsync0(async () => {
        const e = await deleteRoom({ id: roomId });
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

    const disabled = isExecuting || !roomCreatedByMe;
    return (
        <Modal
            open={visible}
            title="部屋の削除"
            okButtonProps={{ disabled }}
            okType="danger"
            okText="削除する"
            cancelText={disabled ? '閉じる' : 'キャンセル'}
            onOk={execute}
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
    const [, resetMessages] = useMutation(ResetMessagesDocument);
    const { execute, isExecuting } = useSingleExecuteAsync0(async () => {
        const e = await resetMessages({ roomId });
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

    const disabled = isExecuting || !roomCreatedByMe;
    return (
        <Modal
            open={visible}
            title="ログの初期化"
            okButtonProps={{ disabled }}
            okType="danger"
            okText="削除する"
            cancelText={disabled ? '閉じる' : 'キャンセル'}
            onOk={execute}
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
    const roomId = useRoomId();
    const [panelOpacity, setPanelOpacity] = usePanelOpacity(roomId);
    const opacityStyle: React.CSSProperties = React.useMemo(
        () => ({
            padding: '0 4px',
        }),
        [],
    );
    return (
        <Modal
            open={visible}
            closable
            title="ウィンドウの透過度の設定"
            okButtonProps={{ style: { display: 'none' } }}
            cancelText="閉じる"
            onCancel={() => onClose()}
        >
            <div className={classNames(flex, flexRow, itemsCenter)} style={opacityStyle}>
                <div>透過度</div>
                <OpacityBar
                    value={panelOpacity ?? defaultPanelOpacity}
                    minValue={minPanelOpacity}
                    onChange={setPanelOpacity}
                    inputNumberType="0-1"
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
    const [, changeParticipantName] = useMutation(ChangeParticipantNameDocument);
    React.useEffect(() => {
        setInputValue('');
    }, [visible, roomId]);
    const { execute, isExecuting } = useSingleExecuteAsync0(async () => {
        const e = await changeParticipantName({ roomId, newName: inputValue });
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

    return (
        <Modal
            open={visible}
            title="名前を変更"
            okButtonProps={{ disabled: isExecuting }}
            onOk={execute}
            onCancel={() => onCancel()}
        >
            <Input
                placeholder="新しい名前"
                autoFocus
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onPressEnter={execute}
            />
        </Modal>
    );
};

const usePanelsMenuItem = () => {
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const reduceRoomConfig = useSetAtom(roomConfigAtom);
    const activeBoardPanel = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.activeBoardPanel,
    );
    const boardPanels = useAtomSelector(roomConfigAtom, state => state.panels.boardEditorPanels);
    const characterPanel = useAtomSelector(roomConfigAtom, state => state.panels.characterPanel);
    const chatPalettePanels = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.chatPalettePanels,
    );
    const gameEffectPanel = useAtomSelector(roomConfigAtom, state => state?.panels.gameEffectPanel);
    const participantPanel = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.participantPanel,
    );
    const memoPanels = useAtomSelector(roomConfigAtom, state => state.panels.memoPanels);
    const messagePanels = useAtomSelector(roomConfigAtom, state => state.panels.messagePanels);
    const pieceValuePanel = useAtomSelector(roomConfigAtom, state => state.panels.pieceValuePanel);
    const rollCallPanel = useAtomSelector(roomConfigAtom, state => state.panels.rollCallPanel);
    const setIsPanelsOpacityModalVisible = useSetAtom(panelsOpacityModalVisibilityAtom);

    const activeBoardPanelMenu = React.useMemo(() => {
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
                reduceRoomConfig({
                    type: bringPanelToFront,
                    panelType: { type: 'activeBoardPanel' },
                    action: {
                        unminimizePanel: true,
                    },
                });
            },
        };
    }, [activeBoardPanel, reduceRoomConfig]);
    const boardPanelsMenu = React.useMemo(() => {
        return {
            key: 'boardPanelsMenu',
            label: 'ボードエディター',
            children: [
                ...recordToArray(boardPanels).map((pair, i) => {
                    return {
                        key: pair.key,
                        onClick: () => {
                            reduceRoomConfig({
                                type: bringPanelToFront,
                                panelType: { type: 'boardEditorPanel', panelId: pair.key },
                                action: {
                                    unminimizePanel: true,
                                },
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
                        const panelId = simpleId();
                        reduceRoomConfig({
                            type: custom,
                            action: roomConfig => {
                                if (roomConfig == null) {
                                    return;
                                }
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
                            },
                        });
                        reduceRoomConfig({
                            type: bringPanelToFront,
                            panelType: { type: 'boardEditorPanel', panelId },
                            action: {
                                unminimizePanel: true,
                            },
                        });
                    },
                },
            ],
        };
    }, [boardPanels, reduceRoomConfig]);

    const characterPanelMenu = React.useMemo(() => {
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
                reduceRoomConfig({
                    type: bringPanelToFront,
                    panelType: { type: 'characterPanel' },
                    action: {
                        unminimizePanel: true,
                    },
                });
            },
        };
    }, [characterPanel, reduceRoomConfig]);
    const chatPalettePanelsMenu = React.useMemo(() => {
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
                            reduceRoomConfig({
                                type: bringPanelToFront,
                                panelType: { type: 'chatPalettePanel', panelId: pair.key },
                                action: {
                                    unminimizePanel: true,
                                },
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
                        const panelId = simpleId();
                        reduceRoomConfig({
                            type: custom,
                            action: roomConfig => {
                                if (roomConfig == null) {
                                    return;
                                }
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
                            },
                        });
                        reduceRoomConfig({
                            type: bringPanelToFront,
                            panelType: { type: 'chatPalettePanel', panelId },
                            action: {
                                unminimizePanel: true,
                            },
                        });
                    },
                },
            ],
        };
    }, [chatPalettePanels, reduceRoomConfig]);
    const gameEffectPanelMenu = React.useMemo(() => {
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
                reduceRoomConfig({
                    type: bringPanelToFront,
                    panelType: { type: 'gameEffectPanel' },
                    action: {
                        unminimizePanel: true,
                    },
                });
            },
        };
    }, [gameEffectPanel, reduceRoomConfig]);
    const memoPanelsMenu = React.useMemo(() => {
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
                            reduceRoomConfig({
                                type: bringPanelToFront,
                                panelType: { type: 'memoPanel', panelId: pair.key },
                                action: {
                                    unminimizePanel: true,
                                },
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
                        const panelId = simpleId();
                        reduceRoomConfig({
                            type: custom,
                            action: roomConfig => {
                                if (roomConfig == null) {
                                    return;
                                }
                                roomConfig.panels.memoPanels[panelId] = defaultMemoPanelConfig();
                            },
                        });
                        reduceRoomConfig({
                            type: bringPanelToFront,
                            panelType: { type: 'memoPanel', panelId },
                            action: {
                                unminimizePanel: true,
                            },
                        });
                    },
                },
            ],
        };
    }, [memoPanels, reduceRoomConfig]);
    const messagePanelsMenu = React.useMemo(() => {
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
                            reduceRoomConfig({
                                type: bringPanelToFront,
                                panelType: { type: 'messagePanel', panelId: pair.key },
                                action: {
                                    unminimizePanel: true,
                                },
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
                        const panelId = simpleId();
                        reduceRoomConfig({
                            type: custom,
                            action: roomConfig => {
                                if (roomConfig == null) {
                                    return;
                                }
                                roomConfig.panels.messagePanels[panelId] =
                                    defaultMessagePanelConfig();
                            },
                        });
                        reduceRoomConfig({
                            type: bringPanelToFront,
                            panelType: { type: 'messagePanel', panelId },
                            action: {
                                unminimizePanel: true,
                            },
                        });
                    },
                },
            ],
        };
    }, [messagePanels, reduceRoomConfig]);
    const participantPanelMenu = React.useMemo(() => {
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
                reduceRoomConfig({
                    type: bringPanelToFront,
                    panelType: { type: 'participantPanel' },
                    action: {
                        unminimizePanel: true,
                    },
                });
            },
        };
    }, [participantPanel, reduceRoomConfig]);
    const pieceValuePanelMenu = React.useMemo(() => {
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
                reduceRoomConfig({
                    type: bringPanelToFront,
                    panelType: { type: 'pieceValuePanel' },
                    action: {
                        unminimizePanel: true,
                    },
                });
            },
        };
    }, [pieceValuePanel, reduceRoomConfig]);
    const rollCallPanelMenu = React.useMemo(() => {
        return {
            key: 'rollCallPanelMenu',
            label: (
                <div>
                    <span>
                        {rollCallPanel.isMinimized ? (
                            <Icon.BorderOutlined />
                        ) : (
                            <Icon.CheckSquareOutlined />
                        )}
                    </span>
                    <span>点呼</span>
                </div>
            ),
            onClick: () => {
                reduceRoomConfig({
                    type: bringPanelToFront,
                    panelType: { type: 'rollCallPanel' },
                    action: {
                        unminimizePanel: true,
                    },
                });
            },
        };
    }, [rollCallPanel, reduceRoomConfig]);

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
                gameEffectPanelMenu,
                participantPanelMenu,
                rollCallPanelMenu,
                pieceValuePanelMenu,
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
        rollCallPanelMenu,
        setIsPanelsOpacityModalVisible,
    ]);

    return menuItem;
};

export const RoomMenu: React.FC = React.memo(function RoomMenu() {
    const me = useMe();
    const myUserUid = useMyUserUid();
    const firebaseUser = useAtomValue(firebaseUserValueAtom);
    const router = useNavigate();
    const signOut = useSignOut();
    const roomId = useRoomId();
    const createdBy = useRoomStateValueSelector(state => state.createdBy);

    const [showBackgroundBoardViewer, setShowBackgroundBoardViewerAtom] =
        useShowBackgroundBoardViewer(roomId);

    const [, leaveRoomMutation] = useMutation(LeaveRoomDocument);
    const [isBecomePlayerModalVisible, setIsBecomePlayerModalVisible] = React.useState(false);
    const [isChangeMyParticipantNameModalVisible, setIsChangeMyParticipantNameModalVisible] =
        React.useState(false);
    const [isDeleteRoomModalVisible, setIsDeleteRoomModalVisible] = React.useState(false);
    const [isPanelsOpacityModalVisible, setIsPanelsOpacityModalVisible] = useAtom(
        panelsOpacityModalVisibilityAtom,
    );
    const [isResetMessagesModalVisible, setIsResetMessagesModalVisible] = React.useState(false);
    const [isGenerateLogModalVisible, setIsGenerateSimpleLogModalVisible] = React.useState(false);
    const [fileSelectorModalVisible, setFileSelectorModalVisible] = React.useState(false);
    const setEditRoomModalVisibility = useSetAtom(editRoomModalVisibilityAtom);

    const panelsMenuItem = usePanelsMenuItem();

    const { execute: executeLeaveRoomMutation, isExecuting: isExecutingLeaveRoomMutation } =
        useSingleExecuteAsync0(async () => {
            const result = await leaveRoomMutation({ id: roomId });
            if (result.data == null) {
                return;
            }
            await router({ to: '/rooms' });
        });
    const { execute: executeSignOut, isExecuting: isExecutingSignOut } = useSingleExecuteAsync0(
        async () => {
            await signOut();
        },
    );

    return React.useMemo(() => {
        if (me == null || myUserUid == null || firebaseUser == null || roomId == null) {
            return null;
        }
        const menuItems: ItemType[] = [
            {
                key: 'logo@menu',
                label: (
                    <img
                        src="/assets/logo.png"
                        width={24}
                        height={24}
                        style={{ verticalAlign: 'middle' }}
                    />
                ),
                // routing であれば複数回実行されてもあまり問題ないため、Promise の結果を無視してコードを簡略化している。
                onClick: () => void router({ to: '/' }),
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
                    <Popover trigger="click" content={<RoomVolumeBar />}>
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
                                <Tooltip title="すでに昇格済みです。">参加者に昇格</Tooltip>
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
                        disabled: isExecutingLeaveRoomMutation,
                        onClick: executeLeaveRoomMutation,
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
                        disabled: isExecutingSignOut,
                        onClick: executeSignOut,
                    },
                ],
            },
        ];

        return (
            <>
                <Menu
                    items={menuItems}
                    triggerSubMenuAction="click"
                    selectable={false}
                    mode="horizontal"
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
        isExecutingLeaveRoomMutation,
        executeLeaveRoomMutation,
        isExecutingSignOut,
        executeSignOut,
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
        setIsPanelsOpacityModalVisible,
    ]);
});
