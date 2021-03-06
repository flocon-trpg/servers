import { Input, Menu, Modal, Popover, Tooltip } from 'antd';
import React from 'react';
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
import * as Icon from '@ant-design/icons';
import { RoomVolumeBar } from './subcomponents/components/RoomVolumeBar/RoomVolumeBar';
import { Jdenticon } from '@/components/ui/Jdenticon/Jdenticon';
import { path } from '@/resources/path';
import { useRouter } from 'next/router';
import { recordToArray } from '@flocon-trpg/utils';
import { useMe } from '../../hooks/useMe';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { useSignOut } from '@/hooks/useSignOut';
import classNames from 'classnames';
import { flex, flexRow, itemsCenter } from '@/styles/className';
import { GenerateLogModal } from './subcomponents/components/GenerageLogModal/GenerateLogModal';
import { useMutation, useQuery } from 'urql';
import { error, roomAtom, roomNotificationsAtom, text } from '@/atoms/roomAtom/roomAtom';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { RoomConfigUtils } from '@/atoms/roomConfigAtom/types/roomConfig/utils';
import { simpleId } from '@flocon-trpg/core';
import { defaultMessagePanelConfig } from '@/atoms/roomConfigAtom/types/messagePanelConfig';
import { defaultMemoPanelConfig } from '@/atoms/roomConfigAtom/types/memoPanelConfig';
import { useUpdateAtom } from 'jotai/utils';
import { useImmerUpdateAtom } from '@/hooks/useImmerUpdateAtom';
import { editRoomDrawerVisibilityAtom } from '../../atoms/editRoomDrawerVisibilityAtom/editRoomDrawerVisibilityAtom';
import { OpacityBar } from '@/components/ui/VolumeBar/VolumeBar';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import produce from 'immer';
import {
    defaultPanelOpacity,
    minPanelOpacity,
} from '@/atoms/roomConfigAtom/types/roomConfig/resources';
import { Styles } from '@/styles';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { firebaseUserValueAtom } from '@/pages/_app';
import { FileSelectorModal } from '@/components/models/file/FileSelectorModal/FileSelectorModal';

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
    const addRoomNotification = useUpdateAtom(roomNotificationsAtom);
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

    const title = '??????????????????';

    if (getRoomAsListItemResult.data?.result.__typename !== 'GetRoomAsListItemSuccessResult') {
        return (
            <Modal
                visible={visible}
                title={title}
                okButtonProps={{ disabled: true }}
                onCancel={() => onCancel()}
            >
                ?????????????????????????????????
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
                    promoteToPlayer({ roomId, password: inputValue }).then(e => {
                        if (e.error != null) {
                            addRoomNotification({
                                type: error,
                                createdAt: new Date().getTime(),
                                error: e.error,
                            });
                            onOk();
                            return;
                        }

                        if (e.data?.result.failureType != null) {
                            let text: string | undefined;
                            switch (e.data?.result.failureType) {
                                case PromoteFailureType.WrongPassword:
                                    text = '???????????????????????????????????????';
                                    break;
                                case PromoteFailureType.NoNeedToPromote:
                                    text = '???????????????????????????';
                                    break;
                                default:
                                    text = undefined;
                                    break;
                            }
                            addRoomNotification({
                                type: 'text',
                                notification: {
                                    type: 'warning',
                                    message: '?????????????????????????????????????????????',
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
                    placeholder='???????????????'
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
                promoteToPlayer({ roomId }).then(e => {
                    if (e.error != null) {
                        addRoomNotification({
                            type: error,
                            createdAt: new Date().getTime(),
                            error: e.error,
                        });
                        onOk();
                        return;
                    }

                    if (e.data?.result.failureType != null) {
                        let text: string | undefined;
                        switch (e.data?.result.failureType) {
                            case PromoteFailureType.WrongPassword:
                                text = '???????????????????????????????????????';
                                break;
                            case PromoteFailureType.NoNeedToPromote:
                                text = '???????????????????????????';
                                break;
                            default:
                                text = undefined;
                                break;
                        }
                        addRoomNotification({
                            type: 'text',
                            notification: {
                                type: 'warning',
                                message: '?????????????????????????????????????????????',
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
            ??????????????????????????????????????????????????????????????????????????????
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
    const [, deleteRoom] = useMutation(DeleteRoomDocument);
    React.useEffect(() => {
        setIsPosting(false);
    }, [visible, roomId]);

    const disabled = isPosting || !roomCreatedByMe;
    return (
        <Modal
            visible={visible}
            title='???????????????'
            okButtonProps={{ disabled }}
            okType='danger'
            okText='????????????'
            cancelText={disabled ? '?????????' : '???????????????'}
            onOk={() => {
                setIsPosting(true);
                deleteRoom({ id: roomId }).then(e => {
                    if (e.error != null) {
                        addRoomNotification({
                            type: error,
                            createdAt: new Date().getTime(),
                            error: e.error,
                        });
                        onOk();
                        return;
                    }

                    if (e.data?.result.failureType != null) {
                        let text: string | undefined;
                        switch (e.data?.result.failureType) {
                            case DeleteRoomFailureType.NotCreatedByYou:
                                text = '??????????????????????????????????????????????????????????????????';
                                break;
                            case DeleteRoomFailureType.NotFound:
                                text = '??????????????????????????????????????????';
                                break;
                            default:
                                text = undefined;
                                break;
                        }
                        addRoomNotification({
                            type: 'text',
                            notification: {
                                type: 'warning',
                                message: '???????????????????????????????????????',
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
                        ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                    </p>
                    <p style={{ fontWeight: 'bold' }}>
                        ??????????????????????????????????????????????????????????????????????????????????????????
                    </p>
                    <p>?????????????????????????????????</p>
                </div>
            ) : (
                <div>?????????????????????????????????????????????????????????????????????????????????</div>
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
    const [, resetMessages] = useMutation(ResetMessagesDocument);
    React.useEffect(() => {
        setIsPosting(false);
    }, [visible, roomId]);

    const disabled = isPosting || !roomCreatedByMe;
    return (
        <Modal
            visible={visible}
            title='??????????????????'
            okButtonProps={{ disabled }}
            okType='danger'
            okText='????????????'
            cancelText={disabled ? '?????????' : '???????????????'}
            onOk={() => {
                setIsPosting(true);
                resetMessages({ roomId }).then(e => {
                    if (e.error != null) {
                        addRoomNotification({
                            type: error,
                            createdAt: new Date().getTime(),
                            error: e.error,
                        });
                        onOk();
                        return;
                    }

                    if (e.data?.result.failureType != null) {
                        let text: string | undefined;
                        switch (e.data?.result.failureType) {
                            case ResetRoomMessagesFailureType.NotAuthorized:
                            case ResetRoomMessagesFailureType.NotParticipant:
                                text = '??????????????????????????????????????????????????????????????????';
                                break;
                            case ResetRoomMessagesFailureType.RoomNotFound:
                                text = '??????????????????????????????';
                                break;
                            default:
                                text = undefined;
                                break;
                        }
                        addRoomNotification({
                            type: 'text',
                            notification: {
                                type: 'warning',
                                message: '???????????????????????????????????????',
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
                        ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                    </p>
                    <p style={{ fontWeight: 'bold' }}>???????????????????????????????????????????????????????????????</p>
                    <p>?????????????????????????????????</p>
                </div>
            ) : (
                <div>?????????????????????????????????????????????????????????????????????????????????</div>
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
            visible={visible}
            closable
            title='????????????????????????????????????'
            okButtonProps={{ style: { display: 'none' } }}
            cancelText='?????????'
            onCancel={() => onClose()}
        >
            <div className={classNames(flex, flexRow, itemsCenter)} style={opacityStyle}>
                <div>?????????</div>
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
    const addRoomNotification = useUpdateAtom(roomNotificationsAtom);
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
                    type: error,
                    createdAt: new Date().getTime(),
                    error: e.error,
                });
                onOkCore();
                return;
            }

            if (e.data?.result.failureType != null) {
                addRoomNotification({
                    type: text,
                    notification: {
                        type: 'warning',
                        message: '???????????????????????????????????????',
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
            title='???????????????'
            okButtonProps={{ disabled: isPosting }}
            onOk={() => onOk()}
            onCancel={() => onCancel()}
        >
            <Input
                placeholder='???????????????'
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
                    <span>?????????????????????</span>
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
            label: '????????????????????????',
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

                                // ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????isMinimized: true??????????????????panel????????????????????????????????????????????????
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
                                <span>{`?????????${i + 1}`}</span>
                            </div>
                        ),
                    };
                }),
                { type: 'divider' },
                {
                    key: '????????????@boardPanelsMenu',
                    label: (
                        <div>
                            <span>
                                <Icon.PlusOutlined />
                            </span>
                            <span>????????????</span>
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
                    <span>????????????????????????</span>
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
            label: '????????????????????????',
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
                                <span>{`?????????${i + 1}`}</span>
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

                                // ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????isMinimized: true??????????????????panel????????????????????????????????????????????????
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
                    key: '????????????@chatPalettePanelsMenu',
                    label: (
                        <div>
                            <span>
                                <Icon.PlusOutlined />
                            </span>
                            <span>????????????</span>
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
            label: '????????????????????????',
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
                                <span>{`?????????${i + 1}`}</span>
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

                                // ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????isMinimized: true??????????????????panel????????????????????????????????????????????????
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
                    key: '????????????@memoPanelsMenu',
                    label: (
                        <div>
                            <span>
                                <Icon.PlusOutlined />
                            </span>
                            <span>????????????</span>
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
            label: '???????????????',
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
                                <span>{`?????????${i + 1}`}</span>
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

                                // ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????isMinimized: true??????????????????panel????????????????????????????????????????????????
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
                    key: '????????????@messagePanelsMenu',
                    label: (
                        <div>
                            <span>
                                <Icon.PlusOutlined />
                            </span>
                            <span>????????????</span>
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
                    <span>?????????</span>
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
                    <span>??????</span>
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
            label: '???????????????',
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
                    key: '??????????????????',
                    label: '??????????????????',
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
    const roomId = useAtomSelector(roomAtom, state => state.roomId);
    const createdBy = useAtomSelector(roomAtom, state => state.roomState?.state?.createdBy);

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
    const setEditRoomDrawerVisibility = useUpdateAtom(editRoomDrawerVisibilityAtom);

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
                key: '??????@menu',
                label: '??????',
                children: [
                    {
                        key: '??????@menu',
                        label: '??????',
                        onClick: () => setEditRoomDrawerVisibility(true),
                    },
                    {
                        key: '??????@menu',
                        label: <span style={Styles.Text.danger}>??????</span>,
                        onClick: () => setIsDeleteRoomModalVisible(true),
                    },
                    {
                        key: '??????????????????@menu',
                        label: <span style={Styles.Text.danger}>??????????????????</span>,
                        onClick: () => setIsResetMessagesModalVisible(true),
                    },
                    { type: 'divider' },
                    {
                        key: '???????????????????????????@menu',
                        label: '???????????????????????????',
                        onClick: () => setIsGenerateSimpleLogModalVisible(true),
                    },
                ],
            },
            {
                key: '??????@menu',
                label: '??????',
                children: [
                    panelsMenuItem,
                    {
                        key: '????????????????????????????????????????????????@menu',
                        label: (
                            <div>
                                <span>
                                    {showBackgroundBoardViewer ? (
                                        <Icon.CheckSquareOutlined />
                                    ) : (
                                        <Icon.BorderOutlined />
                                    )}
                                </span>
                                <span>????????????????????????????????????????????????</span>
                            </div>
                        ),
                        onClick: () => {
                            setShowBackgroundBoardViewerAtom(!showBackgroundBoardViewer);
                        },
                    },
                ],
            },
            {
                key: '???????????????@menu',
                label: (
                    <Popover trigger='click' content={<RoomVolumeBar />}>
                        ???????????????
                    </Popover>
                ),
            },
            {
                key: '?????????????????????@menu',
                label: '?????????????????????',
                onClick: () => setFileSelectorModalVisible(true),
            },
            {
                key: '?????????Participant@menu',
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
                        key: '???????????????@menu',
                        label: '???????????????',
                        onClick: () => setIsChangeMyParticipantNameModalVisible(true),
                    },
                    {
                        key: '??????????????????@menu',
                        label:
                            me.role === ParticipantRole.Player ||
                            me.role === ParticipantRole.Master ? (
                                <Tooltip title='??????????????????????????????'>??????????????????</Tooltip>
                            ) : (
                                '??????????????????'
                            ),
                        disabled:
                            me.role === ParticipantRole.Player ||
                            me.role === ParticipantRole.Master,
                        onClick: () => setIsBecomePlayerModalVisible(true),
                    },
                    {
                        key: '????????????@menu',
                        label: '????????????',
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
                key: '?????????User@menu',
                icon: <Icon.UserOutlined />,
                label: `${firebaseUser.displayName} - ${firebaseUser.uid}`,
                children: [
                    {
                        key: '???????????????@menu',
                        label: '???????????????',
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
        setEditRoomDrawerVisibility,
        setShowBackgroundBoardViewerAtom,
        leaveRoomMutation,
        signOut,
        setIsPanelsOpacityModalVisible,
    ]);
});
