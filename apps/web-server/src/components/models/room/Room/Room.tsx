import { recordToArray } from '@flocon-trpg/utils';
import { Layout as AntdLayout, App, Result } from 'antd';
import classNames from 'classnames';
import { useAtomValue, useSetAtom } from 'jotai/react';
import { NumberSize, ResizeDirection } from 're-resizable';
import React from 'react';
import { ControlPosition } from 'react-draggable';
import { Board } from './subcomponents/components/Board/Board';
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
import {
    activeBoardPanel,
    boardEditorPanel,
    bringPanelToFront,
    characterPanel,
    chatPalettePanel,
    gameEffectPanel,
    manual,
    memoPanel,
    messagePanel,
    minimize,
    movePanel,
    participantPanel,
    pieceValuePanel,
    resizePanel,
    rollCallPanel,
    roomConfigAtomFamily,
} from '@/atoms/roomConfigAtom/roomConfigAtom';
import { BoardEditorPanelConfig } from '@/atoms/roomConfigAtom/types/boardEditorPanelConfig';
import { ChatPalettePanelConfig } from '@/atoms/roomConfigAtom/types/chatPalettePanelConfig';
import { MemoPanelConfig } from '@/atoms/roomConfigAtom/types/memoPanelConfig';
import { MessagePanelConfig } from '@/atoms/roomConfigAtom/types/messagePanelConfig';
import { RoomGlobalStyle } from '@/components/globalStyles/RoomGlobalStyle';
import {
    debouncedWindowInnerHeightAtom,
    debouncedWindowInnerWidthAtom,
} from '@/components/pages/room/RoomIdPage/RoomIdPage';
import { DraggableCard, horizontalPadding } from '@/components/ui/DraggableCard/DraggableCard';
import { LoadingResult } from '@/components/ui/LoadingResult/LoadingResult';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';
import { relative } from '@/styles/className';

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
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const config = useAtomSelector(roomConfigAtom, state => state.panels.activeBoardPanel);
    const reduceRoomConfig = useSetAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            reduceRoomConfig({
                type: movePanel,
                panelType: { type: activeBoardPanel },
                action: e,
            });
        },
        [reduceRoomConfig],
    );
    const onResizeStop = React.useCallback(
        (dir: ResizeDirection, delta: NumberSize) => {
            reduceRoomConfig({
                type: resizePanel,
                panelType: { type: activeBoardPanel },
                action: { dir, delta },
            });
        },
        [reduceRoomConfig],
    );
    const onMoveToFront = React.useCallback(() => {
        reduceRoomConfig({
            type: bringPanelToFront,
            panelType: { type: activeBoardPanel },
            action: {
                unminimizePanel: true,
            },
        });
    }, [reduceRoomConfig]);
    const onClose = React.useCallback(() => {
        reduceRoomConfig({
            type: minimize,
            panelType: { type: activeBoardPanel },
        });
    }, [reduceRoomConfig]);

    if (config.isMinimized) {
        return null;
    }

    return (
        <DraggableCard
            header="ボードビュアー"
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
                type="activeBoard"
                isBackground={false}
                config={config}
            />
        </DraggableCard>
    );
});

const BoardEditorPanel: React.FC<ConfigAndKeyProps<BoardEditorPanelConfig>> = React.memo(
    function BoardEditorPanel({ config, keyName }) {
        const roomId = useRoomId();
        const roomConfigAtom = roomConfigAtomFamily(roomId);
        const reduceRoomConfig = useSetAtom(roomConfigAtom);

        const onDragStop = React.useCallback(
            (e: ControlPosition) => {
                reduceRoomConfig({
                    type: movePanel,
                    panelType: { type: boardEditorPanel, panelId: keyName },
                    action: e,
                });
            },
            [keyName, reduceRoomConfig],
        );
        const onResizeStop = React.useCallback(
            (dir: ResizeDirection, delta: NumberSize) => {
                reduceRoomConfig({
                    type: resizePanel,
                    panelType: { type: boardEditorPanel, panelId: keyName },
                    action: { dir, delta },
                });
            },
            [keyName, reduceRoomConfig],
        );
        const onMoveToFront = React.useCallback(() => {
            reduceRoomConfig({
                type: bringPanelToFront,
                panelType: { type: boardEditorPanel, panelId: keyName },
                action: {
                    unminimizePanel: true,
                },
            });
        }, [keyName, reduceRoomConfig]);
        const onClose = React.useCallback(() => {
            reduceRoomConfig({
                type: minimize,
                panelType: { type: boardEditorPanel, panelId: keyName },
            });
        }, [keyName, reduceRoomConfig]);

        if (config.isMinimized) {
            return null;
        }

        // canvasWidthとcanvasHeightはDraggableCardのchildrenの表示領域より大きい値
        return (
            <DraggableCard
                key={keyName}
                header="ボードエディター"
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
                    type="boardEditor"
                    boardEditorPanelId={keyName}
                    config={config}
                />
            </DraggableCard>
        );
    },
);

const BoardEditorPanels: React.FC = () => {
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const config = useAtomSelector(roomConfigAtom, state => state.panels.boardEditorPanels);

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
        const roomId = useRoomId();
        const roomConfigAtom = roomConfigAtomFamily(roomId);
        const reduceRoomConfig = useSetAtom(roomConfigAtom);

        const onDragStop = React.useCallback(
            (e: ControlPosition) => {
                reduceRoomConfig({
                    type: movePanel,
                    panelType: { type: chatPalettePanel, panelId: keyName },
                    action: e,
                });
            },
            [keyName, reduceRoomConfig],
        );
        const onResizeStop = React.useCallback(
            (dir: ResizeDirection, delta: NumberSize) => {
                reduceRoomConfig({
                    type: resizePanel,
                    panelType: { type: chatPalettePanel, panelId: keyName },
                    action: { dir, delta },
                });
            },
            [keyName, reduceRoomConfig],
        );
        const onMoveToFront = React.useCallback(() => {
            reduceRoomConfig({
                type: bringPanelToFront,
                panelType: { type: chatPalettePanel, panelId: keyName },
                action: {
                    unminimizePanel: true,
                },
            });
        }, [keyName, reduceRoomConfig]);
        const onClose = React.useCallback(() => {
            reduceRoomConfig({
                type: minimize,
                panelType: { type: chatPalettePanel, panelId: keyName },
            });
        }, [keyName, reduceRoomConfig]);

        if (config.isMinimized) {
            return null;
        }

        return (
            <DraggableCard
                key={keyName}
                header="チャットパレット"
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
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const config = useAtomSelector(roomConfigAtom, state => state.panels.chatPalettePanels);

    return (
        <>
            {recordToArray(config).map(pair => (
                <ChatPalettePanel key={pair.key} keyName={pair.key} config={pair.value} />
            ))}
        </>
    );
};

const CharacterPanel: React.FC = React.memo(function CharacterPanel() {
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const config = useAtomSelector(roomConfigAtom, state => state.panels.characterPanel);
    const reduceRoomConfig = useSetAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            reduceRoomConfig({
                type: movePanel,
                panelType: { type: characterPanel },
                action: e,
            });
        },
        [reduceRoomConfig],
    );
    const onResizeStop = React.useCallback(
        (dir: ResizeDirection, delta: NumberSize) => {
            reduceRoomConfig({
                type: resizePanel,
                panelType: { type: characterPanel },
                action: { dir, delta },
            });
        },
        [reduceRoomConfig],
    );
    const onMoveToFront = React.useCallback(() => {
        reduceRoomConfig({
            type: bringPanelToFront,
            panelType: { type: characterPanel },
            action: {
                unminimizePanel: true,
            },
        });
    }, [reduceRoomConfig]);
    const onClose = React.useCallback(() => {
        reduceRoomConfig({
            type: minimize,
            panelType: { type: characterPanel },
        });
    }, [reduceRoomConfig]);

    if (config.isMinimized) {
        return null;
    }

    return (
        <DraggableCard
            header="キャラクター"
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
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const config = useAtomSelector(roomConfigAtom, state => state.panels.gameEffectPanel);
    const reduceRoomConfig = useSetAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            reduceRoomConfig({
                type: movePanel,
                panelType: { type: gameEffectPanel },
                action: e,
            });
        },
        [reduceRoomConfig],
    );
    const onResizeStop = React.useCallback(
        (dir: ResizeDirection, delta: NumberSize) => {
            reduceRoomConfig({
                type: resizePanel,
                panelType: { type: gameEffectPanel },
                action: { dir, delta },
            });
        },
        [reduceRoomConfig],
    );
    const onMoveToFront = React.useCallback(() => {
        reduceRoomConfig({
            type: bringPanelToFront,
            panelType: { type: gameEffectPanel },
            action: {
                unminimizePanel: true,
            },
        });
    }, [reduceRoomConfig]);
    const onClose = React.useCallback(() => {
        reduceRoomConfig({
            type: minimize,
            panelType: { type: gameEffectPanel },
        });
    }, [reduceRoomConfig]);

    if (config.isMinimized) {
        return null;
    }

    return (
        <DraggableCard
            header="SE, BGM"
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
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const reduceRoomConfig = useSetAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            reduceRoomConfig({
                type: movePanel,
                panelType: { type: memoPanel, panelId: keyName },
                action: e,
            });
        },
        [keyName, reduceRoomConfig],
    );
    const onResizeStop = React.useCallback(
        (dir: ResizeDirection, delta: NumberSize) => {
            reduceRoomConfig({
                type: resizePanel,
                panelType: { type: memoPanel, panelId: keyName },
                action: { dir, delta },
            });
        },
        [keyName, reduceRoomConfig],
    );
    const onMoveToFront = React.useCallback(() => {
        reduceRoomConfig({
            type: bringPanelToFront,
            panelType: { type: memoPanel, panelId: keyName },
            action: {
                unminimizePanel: true,
            },
        });
    }, [keyName, reduceRoomConfig]);
    const onClose = React.useCallback(() => {
        reduceRoomConfig({
            type: minimize,
            panelType: { type: memoPanel, panelId: keyName },
        });
    }, [keyName, reduceRoomConfig]);
    const onSelectedMemoIdChange = React.useCallback(
        (newId: string) => {
            reduceRoomConfig({
                type: manual,
                action: roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    const memoPanel = roomConfig.panels.memoPanels[keyName];
                    if (memoPanel == null) {
                        return;
                    }
                    memoPanel.selectedMemoId = newId;
                },
            });
        },
        [keyName, reduceRoomConfig],
    );

    if (config.isMinimized) {
        return null;
    }

    return (
        <DraggableCard
            key={keyName}
            header="共有メモ（部屋）"
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
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const config = useAtomSelector(roomConfigAtom, state => state.panels.memoPanels);

    return (
        <>
            {recordToArray(config).map(pair => (
                <MemoPanel key={pair.key} keyName={pair.key} config={pair.value} />
            ))}
        </>
    );
};

const ParticipantPanel: React.FC = () => {
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const config = useAtomSelector(roomConfigAtom, state => state.panels.participantPanel);
    const reduceRoomConfig = useSetAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            reduceRoomConfig({
                type: movePanel,
                panelType: { type: participantPanel },
                action: e,
            });
        },
        [reduceRoomConfig],
    );
    const onResizeStop = React.useCallback(
        (dir: ResizeDirection, delta: NumberSize) => {
            reduceRoomConfig({
                type: resizePanel,
                panelType: { type: participantPanel },
                action: { dir, delta },
            });
        },
        [reduceRoomConfig],
    );
    const onMoveToFront = React.useCallback(() => {
        reduceRoomConfig({
            type: bringPanelToFront,
            panelType: { type: participantPanel },
            action: {
                unminimizePanel: true,
            },
        });
    }, [reduceRoomConfig]);
    const onClose = React.useCallback(() => {
        reduceRoomConfig({
            type: minimize,
            panelType: { type: participantPanel },
        });
    }, [reduceRoomConfig]);

    if (config.isMinimized) {
        return null;
    }

    return (
        <DraggableCard
            header="入室者"
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
            <ParticipantListPanelContent />
        </DraggableCard>
    );
};

const PieceValuePanel: React.FC = () => {
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const config = useAtomSelector(roomConfigAtom, state => state.panels.pieceValuePanel);
    const activeBoardId = useRoomStateValueSelector(state => state.activeBoardId);
    const reduceRoomConfig = useSetAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            reduceRoomConfig({
                type: movePanel,
                panelType: { type: pieceValuePanel },
                action: e,
            });
        },
        [reduceRoomConfig],
    );
    const onResizeStop = React.useCallback(
        (dir: ResizeDirection, delta: NumberSize) => {
            reduceRoomConfig({
                type: resizePanel,
                panelType: { type: pieceValuePanel },
                action: { dir, delta },
            });
        },
        [reduceRoomConfig],
    );
    const onMoveToFront = React.useCallback(() => {
        reduceRoomConfig({
            type: bringPanelToFront,
            panelType: { type: pieceValuePanel },
            action: {
                unminimizePanel: true,
            },
        });
    }, [reduceRoomConfig]);
    const onClose = React.useCallback(() => {
        reduceRoomConfig({
            type: minimize,
            panelType: { type: pieceValuePanel },
        });
    }, [reduceRoomConfig]);

    if (config.isMinimized) {
        return null;
    }

    return (
        <DraggableCard
            header="コマ(仮)"
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
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const config = useAtomSelector(roomConfigAtom, state => state.panels.rollCallPanel);
    const highlightKey = useAtomValue(panelHighlightKeysAtom);
    const rollCalls = useRoomStateValueSelector(state => state.rollCalls);
    const reduceRoomConfig = useSetAtom(roomConfigAtom);

    const onDragStop = React.useCallback(
        (e: ControlPosition) => {
            reduceRoomConfig({
                type: movePanel,
                panelType: { type: rollCallPanel },
                action: e,
            });
        },
        [reduceRoomConfig],
    );
    const onResizeStop = React.useCallback(
        (dir: ResizeDirection, delta: NumberSize) => {
            reduceRoomConfig({
                type: resizePanel,
                panelType: { type: rollCallPanel },
                action: { dir, delta },
            });
        },
        [reduceRoomConfig],
    );
    const onMoveToFront = React.useCallback(() => {
        reduceRoomConfig({
            type: bringPanelToFront,
            panelType: { type: rollCallPanel },
            action: {
                unminimizePanel: true,
            },
        });
    }, [reduceRoomConfig]);
    const onClose = React.useCallback(() => {
        reduceRoomConfig({
            type: minimize,
            panelType: { type: rollCallPanel },
        });
    }, [reduceRoomConfig]);

    if (config.isMinimized) {
        return null;
    }

    return (
        <DraggableCard
            header="点呼"
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
        const { modal } = App.useApp();
        const roomId = useRoomId();
        const roomConfigAtom = roomConfigAtomFamily(roomId);
        const reduceRoomConfig = useSetAtom(roomConfigAtom);

        const onDragStop = React.useCallback(
            (e: ControlPosition) => {
                reduceRoomConfig({
                    type: movePanel,
                    panelType: { type: messagePanel, panelId: keyName },
                    action: e,
                });
            },
            [keyName, reduceRoomConfig],
        );
        const onResizeStop = React.useCallback(
            (dir: ResizeDirection, delta: NumberSize) => {
                reduceRoomConfig({
                    type: resizePanel,
                    panelType: { type: messagePanel, panelId: keyName },
                    action: { dir, delta },
                });
            },
            [keyName, reduceRoomConfig],
        );
        const onMoveToFront = React.useCallback(() => {
            reduceRoomConfig({
                type: bringPanelToFront,
                panelType: { type: messagePanel, panelId: keyName },
                action: {
                    unminimizePanel: true,
                },
            });
        }, [keyName, reduceRoomConfig]);
        const onClose = React.useCallback(() => {
            modal.confirm({
                title: '削除の確認',
                content: '選択されたメッセージウィンドウを削除します。よろしいですか？',
                onOk: () => {
                    reduceRoomConfig({
                        type: minimize,
                        panelType: { type: messagePanel, panelId: keyName },
                    });
                },
                okText: '削除',
                cancelText: 'キャンセル',
                closable: true,
                maskClosable: true,
            });
        }, [keyName, modal, reduceRoomConfig]);

        if (config == null || config.isMinimized) {
            return null;
        }

        return (
            <DraggableCard
                key={keyName}
                header="メッセージ"
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
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const config = useAtomSelector(roomConfigAtom, state => state.panels.messagePanels);

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
    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const showBackgroundBoardViewer = useAtomSelector(
        roomConfigAtom,
        state => state.showBackgroundBoardViewer,
    );
    const activeBoardBackgroundConfig = useAtomSelector(
        roomConfigAtom,
        state => state?.panels.activeBoardBackground,
    );

    usePlayBgm();
    usePlaySoundEffect();
    usePushNotifications();

    if (myUserUid == null) {
        return (
            <AntdLayout>
                <AntdLayout.Content>
                    <Result
                        status="warning"
                        title="ログインしていないか、Participantの取得に失敗しました。"
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
                    {showBackgroundBoardViewer && (
                        <Board
                            canvasWidth={debug?.window?.innerWidth ?? innerWidth}
                            canvasHeight={
                                (debug?.window?.innerHeight ?? innerHeight) -
                                40 /* TODO: 40という値は適当 */
                            }
                            type="activeBoard"
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
