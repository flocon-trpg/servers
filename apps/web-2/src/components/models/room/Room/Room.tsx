import { recordToArray } from '@flocon-trpg/utils';
import { Layout as AntdLayout, App, Result } from 'antd';
import classNames from 'classnames';
import { useAtomValue } from 'jotai/react';
import { NumberSize, ResizeDirection } from 're-resizable';
import React from 'react';
import { ControlPosition } from 'react-draggable';
import { BoardEditorModal } from './subcomponents/components/BoardEditorModal/BoardEditorModal';
import {
    BoardContextMenu,
    PieceTooltip,
    PopoverEditor,
} from './subcomponents/components/BoardPopover/BoardPopover';
import { CharacterEditorModal } from './subcomponents/components/CharacterEditorModal/CharacterEditorModal';
import { CharacterListPanelContent } from './subcomponents/components/CharacterListPanelContent/CharacterListPanelContent';
import { CharacterParameterNamesEditorModal } from './subcomponents/components/CharacterParameterNamesEditorModal/CharacterParameterNamesEditorModal';
import { CharacterTagNamesEditorModal } from './subcomponents/components/CharacterTagNamesEditorModal/CharacterTagNamesEditorModal';
import { ChatPalettePanelContent } from './subcomponents/components/ChatPalettePanelContent/ChatPalettePanelContent';
import { CommandEditorModal } from './subcomponents/components/CommandEditorModal/CommandEditorModal';
import { DicePieceEditorModal } from './subcomponents/components/DicePieceEditorModal/DicePieceEditorModal';
import { EditRoomModal } from './subcomponents/components/EditRoomModal/EditRoomModal';
import { ImagePieceModal } from './subcomponents/components/ImagePieceModal/ImagePieceModal';
import { ImportBoardModal } from './subcomponents/components/ImportBoardModal/ImportBoardModal';
import { ImportCharacterModal } from './subcomponents/components/ImportCharacterModal/ImportCharacterModal';
import { MemosPanelContent } from './subcomponents/components/MemosPanelContent/MemosPanelContent';
import { ParticipantListPanelContent } from './subcomponents/components/ParticipantListPanelContent/ParticipantListPanelContent';
import { PieceListPanelContent } from './subcomponents/components/PieceListPanelContent/PieceListPanelContent';
import { RollCall } from './subcomponents/components/RollCall/RollCall';
import { RoomMenu } from './subcomponents/components/RoomMenu/RoomMenu';
import { RoomMessagesPanelContent } from './subcomponents/components/RoomMessagesPanelContent/RoomMessagesPanelContent';
import { ShapePieceEditorModal } from './subcomponents/components/ShapePieceEditorModal/ShapePieceEditorModal';
import { SoundPlayerPanelContent } from './subcomponents/components/SoundPlayerPanelContent/SoundPlayerPanelContent';
import { StringPieceEditorModal } from './subcomponents/components/StringPieceEditorModal/StringPieceEditorModal';
import { usePlayBgm } from './subcomponents/hooks/usePlayBgm';
import { usePlaySoundEffect } from './subcomponents/hooks/usePlaySoundEffect';
import { usePushNotifications } from './subcomponents/hooks/usePushNotifications';
import { useRoomId } from './subcomponents/hooks/useRoomId';
import { panelHighlightKeysAtom } from '@/atoms/panelHighlightKeysAtom/panelHighlightKeysAtom';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { BoardEditorPanelConfig } from '@/atoms/roomConfigAtom/types/boardEditorPanelConfig';
import { ChatPalettePanelConfig } from '@/atoms/roomConfigAtom/types/chatPalettePanelConfig';
import { MemoPanelConfig } from '@/atoms/roomConfigAtom/types/memoPanelConfig';
import { MessagePanelConfig } from '@/atoms/roomConfigAtom/types/messagePanelConfig';
import { RoomConfigUtils } from '@/atoms/roomConfigAtom/types/roomConfig/utils';
import { RoomGlobalStyle } from '@/components/globalStyles/RoomGlobalStyle';
import {
    debouncedWindowInnerHeightAtom,
    debouncedWindowInnerWidthAtom,
} from '@/components/pages/room/RoomIdPage/RoomIdPage';
import { DraggableCard, horizontalPadding } from '@/components/ui/DraggableCard/DraggableCard';
import { LoadingResult } from '@/components/ui/LoadingResult/LoadingResult';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { useImmerSetAtom } from '@/hooks/useImmerSetAtom';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';
import { relative } from '@/styles/className';
import { Board } from './subcomponents/components/Board/Board';

type ConfigProps<T> = {
    config: T;
};

type ConfigAndKeyProps<T> = {
    keyName: string;
} & ConfigProps<T>;

namespace ChildrenContainerStyle {
    const childrenContainerPadding = `12px ${horizontalPadding}px`;
    export const defaultStyle: React.CSSProperties = {
        padding: childrenContainerPadding,
        overflowY: 'scroll',
    };
    export const overflowHiddenStyle: React.CSSProperties = { overflow: 'hidden' };
    export const characterListPanelStyle: React.CSSProperties = {
        ...overflowHiddenStyle,
        padding: '12px 12px',
    };
}

const ActiveBoardPanel: React.FC = React.memo(function ActiveBoardPanel() {
    const config = useAtomSelector(roomConfigAtom, state => state?.panels.activeBoardPanel);
    const setRoomConfig = useImmerSetAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.movePanel(roomConfig.panels.activeBoardPanel, e);
            });
        },
        [setRoomConfig],
    );
    const onResizeStop = React.useCallback(
        (dir: ResizeDirection, delta: NumberSize) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.resizePanel(roomConfig.panels.activeBoardPanel, dir, delta);
            });
        },
        [setRoomConfig],
    );
    const onMoveToFront = React.useCallback(() => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            RoomConfigUtils.bringPanelToFront(roomConfig, {
                type: 'activeBoardPanel',
            });
        });
    }, [setRoomConfig]);
    const onClose = React.useCallback(() => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            roomConfig.panels.activeBoardPanel.isMinimized = true;
        });
    }, [setRoomConfig]);

    if (config == null || config.isMinimized) {
        return null;
    }

    return (
        <DraggableCard
            header='ボードビュアー'
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
            onMoveToFront={onMoveToFront}
            onClose={onClose}
            childrenContainerStyle={ChildrenContainerStyle.overflowHiddenStyle}
            position={config}
            size={config}
            minHeight={150}
            minWidth={150}
            zIndex={config.zIndex}
        >
            <Board
                canvasWidth={config.width}
                canvasHeight={config.height}
                type='activeBoard'
                isBackground={false}
                config={config}
            />
        </DraggableCard>
    );
});

const BoardEditorPanel: React.FC<ConfigAndKeyProps<BoardEditorPanelConfig>> = React.memo(
    function BoardEditorPanel({ config, keyName }) {
        const setRoomConfig = useImmerSetAtom(roomConfigAtom);

        const onDragStop = React.useCallback(
            (e: ControlPosition) => {
                setRoomConfig(roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    const boardEditorPanel = roomConfig.panels.boardEditorPanels[keyName];
                    if (boardEditorPanel == null) {
                        return;
                    }
                    RoomConfigUtils.movePanel(boardEditorPanel, e);
                });
            },
            [keyName, setRoomConfig],
        );
        const onResizeStop = React.useCallback(
            (dir: ResizeDirection, delta: NumberSize) => {
                setRoomConfig(roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    const boardEditorPanel = roomConfig.panels.boardEditorPanels[keyName];
                    if (boardEditorPanel == null) {
                        return;
                    }
                    RoomConfigUtils.resizePanel(boardEditorPanel, dir, delta);
                });
            },
            [keyName, setRoomConfig],
        );
        const onMoveToFront = React.useCallback(() => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                const boardEditorPanel = roomConfig.panels.boardEditorPanels[keyName];
                if (boardEditorPanel == null) {
                    return;
                }
                RoomConfigUtils.bringPanelToFront(roomConfig, {
                    type: 'boardEditorPanel',
                    panelId: keyName,
                });
            });
        }, [keyName, setRoomConfig]);
        const onClose = React.useCallback(() => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                roomConfig.panels.boardEditorPanels[keyName] = undefined;
            });
        }, [keyName, setRoomConfig]);

        if (config.isMinimized) {
            return null;
        }

        // canvasWidthとcanvasHeightはDraggableCardのchildrenの表示領域より大きい値
        return (
            <DraggableCard
                key={keyName}
                header='ボードエディター'
                onDragStop={onDragStop}
                onResizeStop={onResizeStop}
                onMoveToFront={onMoveToFront}
                onClose={onClose}
                childrenContainerStyle={ChildrenContainerStyle.overflowHiddenStyle}
                position={config}
                size={config}
                minHeight={150}
                minWidth={150}
                zIndex={config.zIndex}
            >
                <Board
                    canvasWidth={config.width}
                    canvasHeight={config.height}
                    type='boardEditor'
                    boardEditorPanelId={keyName}
                    config={config}
                />
            </DraggableCard>
        );
    },
);

const BoardEditorPanels: React.FC = () => {
    const config = useAtomSelector(roomConfigAtom, state => state?.panels.boardEditorPanels);

    if (config == null) {
        return null;
    }

    return (
        <>
            {recordToArray(config).map(pair => (
                <BoardEditorPanel key={pair.key} keyName={pair.key} config={pair.value} />
            ))}
        </>
    );
};

const ChatPalettePanel: React.FC<ConfigAndKeyProps<ChatPalettePanelConfig>> = React.memo(
    function ChatPalettePanel({ keyName, config }) {
        const setRoomConfig = useImmerSetAtom(roomConfigAtom);
        const roomId = useRoomId();

        const onDragStop = React.useCallback(
            (e: ControlPosition) => {
                setRoomConfig(roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    const chatPalettePanel = roomConfig.panels.chatPalettePanels[keyName];
                    if (chatPalettePanel == null) {
                        return;
                    }
                    RoomConfigUtils.movePanel(chatPalettePanel, e);
                });
            },
            [keyName, setRoomConfig],
        );
        const onResizeStop = React.useCallback(
            (dir: ResizeDirection, delta: NumberSize) => {
                setRoomConfig(roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    const chatPalettePanel = roomConfig.panels.chatPalettePanels[keyName];
                    if (chatPalettePanel == null) {
                        return;
                    }
                    RoomConfigUtils.resizePanel(chatPalettePanel, dir, delta);
                });
            },
            [keyName, setRoomConfig],
        );
        const onMoveToFront = React.useCallback(() => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                const chatPalettePanel = roomConfig.panels.chatPalettePanels[keyName];
                if (chatPalettePanel == null) {
                    return;
                }
                RoomConfigUtils.bringPanelToFront(roomConfig, {
                    type: 'chatPalettePanel',
                    panelId: keyName,
                });
            });
        }, [keyName, setRoomConfig]);
        const onClose = React.useCallback(() => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                roomConfig.panels.chatPalettePanels[keyName] = undefined;
            });
        }, [keyName, setRoomConfig]);

        if (config.isMinimized) {
            return null;
        }

        return (
            <DraggableCard
                key={keyName}
                header='チャットパレット'
                onDragStop={onDragStop}
                onResizeStop={onResizeStop}
                onMoveToFront={onMoveToFront}
                onClose={onClose}
                childrenContainerStyle={ChildrenContainerStyle.overflowHiddenStyle}
                position={config}
                size={config}
                minHeight={150}
                minWidth={150}
                zIndex={config.zIndex}
            >
                <ChatPalettePanelContent roomId={roomId} panelId={keyName} />
            </DraggableCard>
        );
    },
);

const ChatPalettePanels: React.FC = () => {
    const config = useAtomSelector(roomConfigAtom, state => state?.panels.chatPalettePanels);

    if (config == null) {
        return null;
    }

    return (
        <>
            {recordToArray(config).map(pair => (
                <ChatPalettePanel key={pair.key} keyName={pair.key} config={pair.value} />
            ))}
        </>
    );
};

const CharacterPanel: React.FC = React.memo(function CharacterPanel() {
    const config = useAtomSelector(roomConfigAtom, state => state?.panels.characterPanel);
    const setRoomConfig = useImmerSetAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.movePanel(roomConfig.panels.characterPanel, e);
            });
        },
        [setRoomConfig],
    );
    const onResizeStop = React.useCallback(
        (dir: ResizeDirection, delta: NumberSize) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.resizePanel(roomConfig.panels.characterPanel, dir, delta);
            });
        },
        [setRoomConfig],
    );
    const onMoveToFront = React.useCallback(() => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            RoomConfigUtils.bringPanelToFront(roomConfig, {
                type: 'characterPanel',
            });
        });
    }, [setRoomConfig]);
    const onClose = React.useCallback(() => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            roomConfig.panels.characterPanel.isMinimized = true;
        });
    }, [setRoomConfig]);

    if (config == null || config.isMinimized) {
        return null;
    }

    return (
        <DraggableCard
            header='キャラクター'
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
            onMoveToFront={onMoveToFront}
            onClose={onClose}
            childrenContainerStyle={ChildrenContainerStyle.characterListPanelStyle}
            position={config}
            size={config}
            minHeight={150}
            minWidth={150}
            zIndex={config.zIndex}
        >
            <CharacterListPanelContent height={config.height} />
        </DraggableCard>
    );
});

const GameEffectPanel: React.FC = React.memo(function GameEffectPanel() {
    const config = useAtomSelector(roomConfigAtom, state => state?.panels.gameEffectPanel);
    const setRoomConfig = useImmerSetAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.movePanel(roomConfig.panels.gameEffectPanel, e);
            });
        },
        [setRoomConfig],
    );
    const onResizeStop = React.useCallback(
        (dir: ResizeDirection, delta: NumberSize) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.resizePanel(roomConfig.panels.gameEffectPanel, dir, delta);
            });
        },
        [setRoomConfig],
    );
    const onMoveToFront = React.useCallback(() => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            RoomConfigUtils.bringPanelToFront(roomConfig, {
                type: 'gameEffectPanel',
            });
        });
    }, [setRoomConfig]);
    const onClose = React.useCallback(() => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            roomConfig.panels.gameEffectPanel.isMinimized = true;
        });
    }, [setRoomConfig]);

    if (config == null || config.isMinimized) {
        return null;
    }

    return (
        <DraggableCard
            header='SE, BGM'
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
            onMoveToFront={onMoveToFront}
            onClose={onClose}
            childrenContainerStyle={ChildrenContainerStyle.defaultStyle}
            position={config}
            size={config}
            minHeight={150}
            minWidth={150}
            zIndex={config.zIndex}
        >
            <SoundPlayerPanelContent />
        </DraggableCard>
    );
});

const MemoPanel: React.FC<ConfigAndKeyProps<MemoPanelConfig>> = React.memo(function MemoPanel({
    config,
    keyName,
}) {
    const setRoomConfig = useImmerSetAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                const memoPanel = roomConfig.panels.memoPanels[keyName];
                if (memoPanel == null) {
                    return;
                }
                RoomConfigUtils.movePanel(memoPanel, e);
            });
        },
        [keyName, setRoomConfig],
    );
    const onResizeStop = React.useCallback(
        (dir: ResizeDirection, delta: NumberSize) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                const memoPanel = roomConfig.panels.memoPanels[keyName];
                if (memoPanel == null) {
                    return;
                }
                RoomConfigUtils.resizePanel(memoPanel, dir, delta);
            });
        },
        [keyName, setRoomConfig],
    );
    const onMoveToFront = React.useCallback(() => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            const memoPanel = roomConfig.panels.memoPanels[keyName];
            if (memoPanel == null) {
                return;
            }
            RoomConfigUtils.bringPanelToFront(roomConfig, {
                type: 'memoPanel',
                panelId: keyName,
            });
        });
    }, [keyName, setRoomConfig]);
    const onClose = React.useCallback(() => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            roomConfig.panels.memoPanels[keyName] = undefined;
        });
    }, [keyName, setRoomConfig]);
    const onSelectedMemoIdChange = React.useCallback(
        (newId: string) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                const memoPanel = roomConfig.panels.memoPanels[keyName];
                if (memoPanel == null) {
                    return;
                }
                memoPanel.selectedMemoId = newId;
            });
        },
        [keyName, setRoomConfig],
    );

    if (config.isMinimized) {
        return null;
    }

    return (
        <DraggableCard
            key={keyName}
            header='共有メモ（部屋）'
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
            onMoveToFront={onMoveToFront}
            onClose={onClose}
            childrenContainerStyle={ChildrenContainerStyle.overflowHiddenStyle}
            position={config}
            size={config}
            minHeight={150}
            minWidth={150}
            zIndex={config.zIndex}
        >
            <MemosPanelContent
                selectedMemoId={config.selectedMemoId}
                onSelectedMemoIdChange={onSelectedMemoIdChange}
            />
        </DraggableCard>
    );
});

const MemoPanels: React.FC = () => {
    const config = useAtomSelector(roomConfigAtom, state => state?.panels.memoPanels);

    if (config == null) {
        return null;
    }

    return (
        <>
            {recordToArray(config).map(pair => (
                <MemoPanel key={pair.key} keyName={pair.key} config={pair.value} />
            ))}
        </>
    );
};

const ParticipantPanel: React.FC = () => {
    const participantPanel = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.participantPanel,
    );
    const setRoomConfig = useImmerSetAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.movePanel(roomConfig.panels.participantPanel, e);
            });
        },
        [setRoomConfig],
    );
    const onResizeStop = React.useCallback(
        (dir: ResizeDirection, delta: NumberSize) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.resizePanel(roomConfig.panels.participantPanel, dir, delta);
            });
        },
        [setRoomConfig],
    );
    const onMoveToFront = React.useCallback(() => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            RoomConfigUtils.bringPanelToFront(roomConfig, {
                type: 'participantPanel',
            });
        });
    }, [setRoomConfig]);
    const onClose = React.useCallback(() => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            roomConfig.panels.participantPanel.isMinimized = true;
        });
    }, [setRoomConfig]);

    if (participantPanel == null || participantPanel.isMinimized) {
        return null;
    }

    return (
        <DraggableCard
            header='入室者'
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
            onMoveToFront={onMoveToFront}
            onClose={onClose}
            childrenContainerStyle={ChildrenContainerStyle.defaultStyle}
            position={participantPanel}
            size={participantPanel}
            minHeight={150}
            minWidth={150}
            zIndex={participantPanel.zIndex}
        >
            <ParticipantListPanelContent />
        </DraggableCard>
    );
};

const PieceValuePanel: React.FC = () => {
    const config = useAtomSelector(roomConfigAtom, state => state?.panels.pieceValuePanel);
    const setRoomConfig = useImmerSetAtom(roomConfigAtom);
    const activeBoardId = useRoomStateValueSelector(state => state.activeBoardId);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.movePanel(roomConfig.panels.pieceValuePanel, e);
            });
        },
        [setRoomConfig],
    );
    const onResizeStop = React.useCallback(
        (dir: ResizeDirection, delta: NumberSize) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.resizePanel(roomConfig.panels.pieceValuePanel, dir, delta);
            });
        },
        [setRoomConfig],
    );
    const onMoveToFront = React.useCallback(() => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            RoomConfigUtils.bringPanelToFront(roomConfig, {
                type: 'pieceValuePanel',
            });
        });
    }, [setRoomConfig]);
    const onClose = React.useCallback(() => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            roomConfig.panels.pieceValuePanel.isMinimized = true;
        });
    }, [setRoomConfig]);

    if (config == null || config.isMinimized) {
        return null;
    }

    return (
        <DraggableCard
            header='コマ(仮)'
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
            onMoveToFront={onMoveToFront}
            onClose={onClose}
            childrenContainerStyle={ChildrenContainerStyle.defaultStyle}
            position={config}
            size={config}
            minHeight={150}
            minWidth={150}
            zIndex={config.zIndex}
        >
            {activeBoardId == null ? (
                'ボードビュアーにボードが表示されていないため、無効化されています'
            ) : (
                <PieceListPanelContent boardId={activeBoardId} />
            )}
        </DraggableCard>
    );
};

const RollCallPanel: React.FC = () => {
    const config = useAtomSelector(roomConfigAtom, state => state?.panels.rollCallPanel);
    const setRoomConfig = useImmerSetAtom(roomConfigAtom);
    const highlightKey = useAtomValue(panelHighlightKeysAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.movePanel(roomConfig.panels.rollCallPanel, e);
            });
        },
        [setRoomConfig],
    );
    const onResizeStop = React.useCallback(
        (dir: ResizeDirection, delta: NumberSize) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.resizePanel(roomConfig.panels.rollCallPanel, dir, delta);
            });
        },
        [setRoomConfig],
    );
    const onMoveToFront = React.useCallback(() => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            RoomConfigUtils.bringPanelToFront(roomConfig, {
                type: 'rollCallPanel',
            });
        });
    }, [setRoomConfig]);
    const onClose = React.useCallback(() => {
        setRoomConfig(roomConfig => {
            if (roomConfig == null) {
                return;
            }
            roomConfig.panels.rollCallPanel.isMinimized = true;
        });
    }, [setRoomConfig]);
    const rollCalls = useRoomStateValueSelector(state => state.rollCalls);

    if (config == null || config.isMinimized) {
        return null;
    }

    return (
        <DraggableCard
            header='点呼'
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
            onMoveToFront={onMoveToFront}
            onClose={onClose}
            childrenContainerStyle={ChildrenContainerStyle.defaultStyle}
            position={config}
            size={config}
            minHeight={150}
            minWidth={150}
            zIndex={config.zIndex}
            highlightKey={highlightKey.rollCallPanel}
        >
            <RollCall rollCalls={rollCalls ?? {}} />
        </DraggableCard>
    );
};

const RoomMessagePanel: React.FC<ConfigAndKeyProps<MessagePanelConfig>> = React.memo(
    function RoomMessagePanel({ config, keyName }) {
        const setRoomConfig = useImmerSetAtom(roomConfigAtom);
        const { modal } = App.useApp();

        const onDragStop = React.useCallback(
            (e: ControlPosition) => {
                setRoomConfig(roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    const messagePanel = roomConfig.panels.messagePanels[keyName];
                    if (messagePanel == null) {
                        return;
                    }
                    RoomConfigUtils.movePanel(messagePanel, e);
                });
            },
            [keyName, setRoomConfig],
        );
        const onResizeStop = React.useCallback(
            (dir: ResizeDirection, delta: NumberSize) => {
                setRoomConfig(roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    const messagePanel = roomConfig.panels.messagePanels[keyName];
                    if (messagePanel == null) {
                        return;
                    }
                    RoomConfigUtils.resizePanel(messagePanel, dir, delta);
                });
            },
            [keyName, setRoomConfig],
        );
        const onMoveToFront = React.useCallback(() => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                const messagePanel = roomConfig.panels.messagePanels[keyName];
                if (messagePanel == null) {
                    return;
                }
                RoomConfigUtils.bringPanelToFront(roomConfig, {
                    type: 'messagePanel',
                    panelId: keyName,
                });
            });
        }, [keyName, setRoomConfig]);
        const onClose = React.useCallback(() => {
            modal.confirm({
                title: '削除の確認',
                content: '選択されたメッセージウィンドウを削除します。よろしいですか？',
                onOk: () => {
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        roomConfig.panels.messagePanels[keyName] = undefined;
                    });
                },
                okText: '削除',
                cancelText: 'キャンセル',
                closable: true,
                maskClosable: true,
            });
        }, [keyName, modal, setRoomConfig]);

        if (config == null || config.isMinimized) {
            return null;
        }

        return (
            <DraggableCard
                key={keyName}
                header='メッセージ'
                onDragStop={onDragStop}
                onResizeStop={onResizeStop}
                onMoveToFront={onMoveToFront}
                onClose={onClose}
                childrenContainerStyle={ChildrenContainerStyle.overflowHiddenStyle}
                position={config}
                size={config}
                minHeight={150}
                minWidth={150}
                zIndex={config.zIndex}
            >
                <RoomMessagesPanelContent panelId={keyName} height={config.height} />
            </DraggableCard>
        );
    },
);

const RoomMessagePanels: React.FC = () => {
    const config = useAtomSelector(roomConfigAtom, state => state?.panels.messagePanels);

    if (config == null) {
        return null;
    }

    return (
        <>
            {recordToArray(config).map(pair => (
                <RoomMessagePanel key={pair.key} keyName={pair.key} config={pair.value} />
            ))}
        </>
    );
};

type Props = {
    debug?: {
        window?: {
            innerHeight?: number;
            innerWidth?: number;
        };
    };
};

export const Room: React.FC<Props> = ({ debug }) => {
    const myUserUid = useMyUserUid();
    const innerWidth = useAtomValue(debouncedWindowInnerWidthAtom);
    const innerHeight = useAtomValue(debouncedWindowInnerHeightAtom);
    const roomIdOfRoomConfig = useAtomSelector(roomConfigAtom, state => state?.roomId);
    const showBackgroundBoardViewer = useAtomSelector(
        roomConfigAtom,
        state => state?.showBackgroundBoardViewer,
    );
    const activeBoardBackgroundConfig = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.activeBoardBackground,
    );

    usePlayBgm();
    usePlaySoundEffect();
    usePushNotifications();

    const roomId = useRoomId();

    if (
        roomIdOfRoomConfig == null ||
        roomIdOfRoomConfig !== roomId ||
        activeBoardBackgroundConfig == null
    ) {
        return <LoadingResult title='個人設定のデータをブラウザから読み込んでいます…' />;
    }

    if (myUserUid == null) {
        return (
            <AntdLayout>
                <AntdLayout.Content>
                    <Result
                        status='warning'
                        title='ログインしていないか、Participantの取得に失敗しました。'
                    />
                </AntdLayout.Content>
            </AntdLayout>
        );
    }

    return (
        <AntdLayout>
            <RoomGlobalStyle />
            <AntdLayout.Content>
                <RoomMenu />
                <div className={classNames(relative)}>
                    {showBackgroundBoardViewer == true && (
                        <Board
                            canvasWidth={debug?.window?.innerWidth ?? innerWidth}
                            canvasHeight={
                                (debug?.window?.innerHeight ?? innerHeight) -
                                40 /* TODO: 40という値は適当 */
                            }
                            type='activeBoard'
                            isBackground={true}
                            config={activeBoardBackgroundConfig}
                        />
                    )}
                    <BoardEditorPanels />
                    <ActiveBoardPanel />
                    <RoomMessagePanels />
                    <CharacterPanel />
                    <ChatPalettePanels />
                    <GameEffectPanel />
                    <MemoPanels />
                    <ParticipantPanel />
                    <PieceValuePanel />
                    <RollCallPanel />
                </div>

                <BoardContextMenu />
                <PieceTooltip />
                <PopoverEditor />

                <BoardEditorModal />
                <CharacterEditorModal />
                <CharacterTagNamesEditorModal />
                <DicePieceEditorModal />
                <ImagePieceModal />
                <ShapePieceEditorModal />
                <StringPieceEditorModal />
                <CharacterParameterNamesEditorModal />
                <EditRoomModal />
                <ImportBoardModal />
                <ImportCharacterModal />

                <CommandEditorModal />
            </AntdLayout.Content>
        </AntdLayout>
    );
};
