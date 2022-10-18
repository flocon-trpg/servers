import { recordToArray } from '@flocon-trpg/utils';
import { Layout as AntdLayout, Modal, Result } from 'antd';
import classNames from 'classnames';
import { useAtomValue } from 'jotai/utils';
import dynamic from 'next/dynamic';
import { NumberSize, ResizeDirection } from 're-resizable';
import React from 'react';
import { ControlPosition } from 'react-draggable';
import { Props as BoardProps } from './subcomponents/components/Board/Board';
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
import { EditRoomDrawer } from './subcomponents/components/EditRoomDrawer/EditRoomDrawer';
import { ImagePieceModal } from './subcomponents/components/ImagePieceModal/ImagePieceModal';
import { ImportBoardModal } from './subcomponents/components/ImportBoardModal/ImportBoardModal';
import { ImportCharacterModal } from './subcomponents/components/ImportCharacterModal/ImportCharacterModal';
import { MemosPanelContent } from './subcomponents/components/MemosPanelContent/MemosPanelContent';
import { ParticipantListPanelContent } from './subcomponents/components/ParticipantListPanelContent/ParticipantListPanelContent';
import { PieceListPanelContent } from './subcomponents/components/PieceListPanelContent/PieceListPanelContent';
import { RoomMenu } from './subcomponents/components/RoomMenu/RoomMenu';
import { RoomMessagesPanelContent } from './subcomponents/components/RoomMessagesPanelContent/RoomMessagesPanelContent';
import { ShapePieceEditorModal } from './subcomponents/components/ShapePieceEditorModal/ShapePieceEditorModal';
import { SoundPlayerPanelContent } from './subcomponents/components/SoundPlayerPanelContent/SoundPlayerPanelContent';
import { StringPieceEditorModal } from './subcomponents/components/StringPieceEditorModal/StringPieceEditorModal';
import { useMessageNotification } from './subcomponents/hooks/useMessageNotification';
import { usePlayBgm } from './subcomponents/hooks/usePlayBgm';
import { usePlaySoundEffect } from './subcomponents/hooks/usePlaySoundEffect';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { BoardEditorPanelConfig } from '@/atoms/roomConfigAtom/types/boardEditorPanelConfig';
import { ChatPalettePanelConfig } from '@/atoms/roomConfigAtom/types/chatPalettePanelConfig';
import { MemoPanelConfig } from '@/atoms/roomConfigAtom/types/memoPanelConfig';
import { MessagePanelConfig } from '@/atoms/roomConfigAtom/types/messagePanelConfig';
import { RoomConfigUtils } from '@/atoms/roomConfigAtom/types/roomConfig/utils';
import {
    debouncedWindowInnerHeightAtom,
    debouncedWindowInnerWidthAtom,
} from '@/components/pages/room/RoomIdPage/RoomIdPage';
import { DraggableCard, horizontalPadding } from '@/components/ui/DraggableCard/DraggableCard';
import { LoadingResult } from '@/components/ui/LoadingResult/LoadingResult';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { useImmerUpdateAtom } from '@/hooks/useImmerUpdateAtom';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { relative } from '@/styles/className';

/*
Boardをdynamicを使わず直接importすると、next exportのときに次のエラーが出る（next export以外は問題なしの模様）。

Error occurred prerendering page "/rooms/[id]". Read more: https://nextjs.org/docs/messages/prerender-error
Error: Cannot find module 'canvas'
Require stack:
- /home/runner/work/servers/servers/node_modules/konva/cmj/index-node.js
- /home/runner/work/servers/servers/node_modules/react-konva/lib/ReactKonva.js
- /home/runner/work/servers/servers/apps/web-server/.next/server/pages/rooms/[id].js

index-node.jsを見てみると、次のコードがある(konva@v8.3.9で確認)。ここでエラーが出ていると思われる。

const Canvas = require("canvas");

もしかするとyarn add canvasで直るかもしれないが、このパッケージのReadmeによると「node-canvas is a Cairo-backed Canvas implementation for Node.js.」とのことであり、詳しくは調査していないが、next exportを使うか否かで挙動が変わってしまう可能性がある。そのため、代わりにdynamicを使うことで対処している。
今のところreact-konvaはBoardでしか使っていないが、他のコンポーネントでも使うのであればそちらもdynamicを使ったほうがよさそう。
*/
const Board: React.ComponentType<BoardProps> = dynamic(
    () => import('./subcomponents/components/Board/Board').then(mod => mod.Board as any),
    { ssr: false }
);

const overflowHidden = { overflow: 'hidden' } as const;

type ConfigProps<T> = {
    config: T;
};

type ConfigAndKeyProps<T> = {
    keyName: string;
} & ConfigProps<T>;

const ActiveBoardPanel: React.FC = React.memo(function ActiveBoardPanel() {
    const config = useAtomSelector(roomConfigAtom, state => state?.panels.activeBoardPanel);
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.movePanel(roomConfig.panels.activeBoardPanel, e);
            });
        },
        [setRoomConfig]
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
        [setRoomConfig]
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
            childrenContainerStyle={overflowHidden}
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
        const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);

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
            [keyName, setRoomConfig]
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
            [keyName, setRoomConfig]
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
                childrenContainerStyle={overflowHidden}
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
    }
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
        const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);
        const roomId = useAtomSelector(roomAtom, state => state.roomId);

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
            [keyName, setRoomConfig]
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
            [keyName, setRoomConfig]
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

        if (roomId == null) {
            return null;
        }

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
                childrenContainerStyle={overflowHidden}
                position={config}
                size={config}
                minHeight={150}
                minWidth={150}
                zIndex={config.zIndex}
            >
                <ChatPalettePanelContent roomId={roomId} panelId={keyName} />
            </DraggableCard>
        );
    }
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
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.movePanel(roomConfig.panels.characterPanel, e);
            });
        },
        [setRoomConfig]
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
        [setRoomConfig]
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
    const childrenContainerStyle: React.CSSProperties = React.useMemo(
        () => ({
            padding: childrenContainerPadding,
        }),
        []
    );

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
            childrenContainerStyle={childrenContainerStyle}
            position={config}
            size={config}
            minHeight={150}
            minWidth={150}
            zIndex={config.zIndex}
        >
            <CharacterListPanelContent />
        </DraggableCard>
    );
});

const GameEffectPanel: React.FC = React.memo(function GameEffectPanel() {
    const config = useAtomSelector(roomConfigAtom, state => state?.panels.gameEffectPanel);
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.movePanel(roomConfig.panels.gameEffectPanel, e);
            });
        },
        [setRoomConfig]
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
        [setRoomConfig]
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
    const childrenContainerStyle: React.CSSProperties = React.useMemo(
        () => ({
            padding: childrenContainerPadding,
            overflowY: 'scroll',
        }),
        []
    );

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
            childrenContainerStyle={childrenContainerStyle}
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
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);

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
        [keyName, setRoomConfig]
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
        [keyName, setRoomConfig]
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
        [keyName, setRoomConfig]
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
            childrenContainerStyle={overflowHidden}
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
        state => state?.panels.participantPanel
    );
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.movePanel(roomConfig.panels.participantPanel, e);
            });
        },
        [setRoomConfig]
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
        [setRoomConfig]
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
    const childrenContainerStyle: React.CSSProperties = React.useMemo(
        () => ({
            padding: childrenContainerPadding,
            overflowY: 'scroll',
        }),
        []
    );

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
            childrenContainerStyle={childrenContainerStyle}
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
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);
    const activeBoardId = useAtomSelector(roomAtom, state => state.roomState?.state?.activeBoardId);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                RoomConfigUtils.movePanel(roomConfig.panels.pieceValuePanel, e);
            });
        },
        [setRoomConfig]
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
        [setRoomConfig]
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
    const childrenContainerStyle: React.CSSProperties = React.useMemo(
        () => ({
            padding: childrenContainerPadding,
            overflowY: 'scroll',
        }),
        []
    );

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
            childrenContainerStyle={childrenContainerStyle}
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

const RoomMessagePanel: React.FC<ConfigAndKeyProps<MessagePanelConfig>> = React.memo(
    function RoomMessagePanel({ config, keyName }) {
        const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);

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
            [keyName, setRoomConfig]
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
            [keyName, setRoomConfig]
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
            Modal.confirm({
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
        }, [keyName, setRoomConfig]);

        if (config == null || config.isMinimized) {
            return null;
        }

        // canvasWidthとcanvasHeightはDraggableCardのchildrenの表示領域より大きい値
        return (
            <DraggableCard
                key={keyName}
                header='メッセージ'
                onDragStop={onDragStop}
                onResizeStop={onResizeStop}
                onMoveToFront={onMoveToFront}
                onClose={onClose}
                childrenContainerStyle={overflowHidden}
                position={config}
                size={config}
                minHeight={150}
                minWidth={150}
                zIndex={config.zIndex}
            >
                <RoomMessagesPanelContent panelId={keyName} height={config.height} />
            </DraggableCard>
        );
    }
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

const childrenContainerPadding = `12px ${horizontalPadding}px`;

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
        state => state?.showBackgroundBoardViewer
    );
    const activeBoardBackgroundConfig = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.activeBoardBackground
    );

    usePlayBgm();
    usePlaySoundEffect();
    useMessageNotification();

    const roomId = useAtomSelector(roomAtom, state => state.roomId);

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
                <EditRoomDrawer />
                <ImportBoardModal />
                <ImportCharacterModal />

                <CommandEditorModal />
            </AntdLayout.Content>
        </AntdLayout>
    );
};
