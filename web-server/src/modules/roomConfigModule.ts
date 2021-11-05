import { createSlice, PayloadAction } from '@reduxjs/toolkit';
//import { BoardConfig, BoardsPanelConfig } from '../states/BoardsPanelConfig';
import {
    activeBoardPanel,
    boardEditorPanel,
    characterPanel,
    gameEffectPanel,
    messagePanel,
    pieceValuePanel,
    PanelAction,
    participantPanel,
    RoomConfig,
    memoPanel,
    chatPalettePanel,
} from '../states/RoomConfig';
import { ResizableDelta } from 'react-rnd';
import { ResizeDirection } from 're-resizable';
import { BoardEditorPanelConfig } from '../states/BoardEditorPanelConfig';
import { MessageFilter, MessagePanelConfig } from '../states/MessagePanelConfig';
import { reset, Reset } from '../utils/types';
import { BoardConfig, defaultBoardConfig } from '../states/BoardConfig';
import { CompositeKey, recordToArray, keyNames } from '@kizahasi/util';
import { MemoPanelConfig } from '../states/MemoPanelConfig';
import { ChatPalettePanelConfig } from '../states/ChatPalettePanelConfig';
import { simpleId, StrIndex5 } from '@kizahasi/flocon-core';

const roomMenuHeight = 38;

export type SetOtherValuesAction = {
    roomId: string;
    masterVolume?: number;
    seVolume?: number;
    messageNotificationFilter?: MessageFilter;
};

export type SetChannelVolumeAction = {
    roomId: string;
    channelKey: StrIndex5;
    volume: number;
};

export type MovePanelAction = {
    roomId: string;
    x: number;
    y: number;
};

export type ResizePanelAction = {
    roomId: string;
    dir: ResizeDirection;
    delta: ResizableDelta;
};

export type AddBoardEditorPanelConfigAction = {
    roomId: string;
    panel: Omit<BoardEditorPanelConfig, 'zIndex'>;
};

export type UpdateBoardEditorPanelAction = {
    roomId: string;
    boardEditorPanelId: string;
    panel: Omit<Partial<BoardEditorPanelConfig>, 'boards'>;
};

export type RemoveBoardEditorPanelAction = {
    roomId: string;
    boardEditorPanelId: string;
};

// zoomのとき自動移動させたい場合は代わりにZoomBoardActionで行う
export type UpdateBoardAction = {
    roomId: string;
    boardEditorPanelId: string | null; // nullならばActiveBoardPanelが対象になる。
    boardKey: CompositeKey;
    offsetXDelta?: number;
    offsetYDelta?: number;
    zoomDelta?: number;
    showGrid?: boolean;
    gridLineTension?: number;
    gridLineColor?: string;
};

export type ZoomBoardAction = {
    roomId: string;
    boardEditorPanelId: string | null; // nullならばActiveBoardPanelが対象になる。
    boardKey: CompositeKey;
    zoomDelta: number;
    prevCanvasWidth: number;
    prevCanvasHeight: number;
};

export type ResetBoardAction = {
    roomId: string;
    boardEditorPanelId: string | null; // nullならばActiveBoardPanelが対象になる。
    boardKey: CompositeKey;
};

export type UpdateChannelVisibilityAction = {
    roomId: string;
    channelKey: string;
    newValue: boolean | undefined;
};

export type AddChatPalettePanelConfigAction = {
    roomId: string;
    panel: Omit<ChatPalettePanelConfig, 'zIndex'>;
};

export type UpdateChatPalettePanelAction = {
    roomId: string;
    panelId: string;
    panel: Omit<Partial<ChatPalettePanelConfig>, 'selectedTextColor'> & {
        selectedTextColor?: string | Reset;
    };
};

export type RemoveChatPalettePanelAction = {
    roomId: string;
    panelId: string;
};

export type AddMemoPanelConfigAction = {
    roomId: string;
    panel: Omit<MemoPanelConfig, 'zIndex'>;
};

export type UpdateMemoPanelAction = {
    roomId: string;
    panelId: string;
    panel: Partial<MemoPanelConfig>;
};

export type RemoveMemoPanelAction = {
    roomId: string;
    panelId: string;
};

export type AddMessagePanelConfigAction = {
    roomId: string;
    panel: Omit<MessagePanelConfig, 'zIndex'>;
};

export type UpdateMessagePanelAction = {
    roomId: string;
    panelId: string;
    panel: Omit<Partial<MessagePanelConfig>, 'selectedTextColor'> & {
        selectedTextColor?: string | Reset;
    };
};

export type RemoveMessagePanelAction = {
    roomId: string;
    panelId: string;
};

// DraggablePanelが移動できない位置に行くのを防ぐ処理。
// Redux側ではなくUI側にこの処理を任せるとReduxとUIの独立性が高まるので一見良さそうだが、localforageからデータを読み込むときも似たような処理をしているため、もしRedux外に任せても結局Configを読み込むときにこの処理を行わなければならず、トータルで見たときの独立性は高くなっていない。そのため、Redux側でこの処理を取り扱うことにしている。
const movePanel = (
    state: { x: number; y: number },
    newPosition: { x: number; y: number }
): void => {
    state.x = Math.max(0, newPosition.x);
    state.y = Math.max(roomMenuHeight, newPosition.y);
};

const resizePanel = (
    state: { x: number; y: number; width: number; height: number },
    actionDir: ResizeDirection,
    actionDelta: { width: number; height: number }
): void => {
    state.width += actionDelta.width;
    state.height += actionDelta.height;
    switch (actionDir) {
        // xもyも固定
        case 'right':
        case 'bottomRight':
        case 'bottom':
            break;
        // xは変わるがyは固定
        case 'bottomLeft':
        case 'left':
            state.x -= actionDelta.width;
            break;
        // xもyも変わる
        case 'topLeft':
            state.x -= actionDelta.width;
            state.y -= actionDelta.height;
            break;
        case 'top':
        case 'topRight':
            state.y -= actionDelta.height;
            break;
    }
};

const fixRoomConfig = (config: RoomConfig): void => {
    const fixPosition = (position: { x: number; y: number }): void => {
        position.x = Math.max(0, position.x);
        position.y = Math.max(roomMenuHeight, position.y);
    };
    recordToArray(config.panels.boardEditorPanels).forEach(pair => fixPosition(pair.value));
    fixPosition(config.panels.characterPanel);
    recordToArray(config.panels.memoPanels).forEach(pair => fixPosition(pair.value));
    recordToArray(config.panels.messagePanels).forEach(pair => fixPosition(pair.value));
};

const bringPanelToFront = (state: RoomConfig | null, action: PanelAction): void => {
    if (state == null || state.roomId !== action.roomId) {
        return;
    }

    const panels: { zIndex: number }[] = [];
    panels.push(state.panels.activeBoardPanel);
    for (const panelId in state.panels.boardEditorPanels) {
        const panel = state.panels.boardEditorPanels[panelId];
        if (panel != null) {
            panels.push(panel);
        }
    }
    panels.push(state.panels.characterPanel);
    for (const panelId in state.panels.chatPalettePanels) {
        const panel = state.panels.chatPalettePanels[panelId];
        if (panel != null) {
            panels.push(panel);
        }
    }
    panels.push(state.panels.gameEffectPanel);
    for (const panelId in state.panels.memoPanels) {
        const panel = state.panels.memoPanels[panelId];
        if (panel != null) {
            panels.push(panel);
        }
    }
    for (const panelId in state.panels.messagePanels) {
        const panel = state.panels.messagePanels[panelId];
        if (panel != null) {
            panels.push(panel);
        }
    }
    panels.push(state.panels.pieceValuePanel);
    panels.push(state.panels.participantPanel);

    // まずzIndexが小さい順に0,1,2,…と割り振っていく。こうすることで、例えば[-100, 5, 10000]のように飛び飛びになっている状態を修正する。zIndexが同一であるパネルが複数ある場合でも異なるzIndexになるため、場合によっては前面に来るパネルが変わる可能性もあるが、直接Configを編集したりしていない限りすべてのzIndexは異なっているはずなので無視している。
    // 次に、最前面にさせたいパネルのzIndexに(max(割り振ったzIndexの集合) + 1)を代入して完了。

    panels
        .sort((x, y) => x.zIndex - y.zIndex)
        .forEach((panel, i) => {
            panel.zIndex = i;
        });

    switch (action.target.type) {
        case activeBoardPanel: {
            state.panels.activeBoardPanel.zIndex = panels.length;
            return;
        }
        case boardEditorPanel: {
            const targetPanel = state.panels.boardEditorPanels[action.target.panelId];
            if (targetPanel == null) {
                return;
            }
            targetPanel.zIndex = panels.length;
            return;
        }
        case characterPanel: {
            state.panels.characterPanel.zIndex = panels.length;
            return;
        }
        case chatPalettePanel: {
            const targetPanel = state.panels.chatPalettePanels[action.target.panelId];
            if (targetPanel == null) {
                return;
            }
            targetPanel.zIndex = panels.length;
            return;
        }
        case gameEffectPanel: {
            state.panels.gameEffectPanel.zIndex = panels.length;
            return;
        }
        case memoPanel: {
            const targetPanel = state.panels.memoPanels[action.target.panelId];
            if (targetPanel == null) {
                return;
            }
            targetPanel.zIndex = panels.length;
            return;
        }
        case messagePanel: {
            const targetPanel = state.panels.messagePanels[action.target.panelId];
            if (targetPanel == null) {
                return;
            }
            targetPanel.zIndex = panels.length;
            return;
        }
        case participantPanel: {
            state.panels.participantPanel.zIndex = panels.length;
            return;
        }
        case pieceValuePanel: {
            state.panels.pieceValuePanel.zIndex = panels.length;
            return;
        }
    }
};

const editBoard = (
    state: RoomConfig,
    boardKey: CompositeKey,
    boardEditorPanelId: string | null /* nullならばactiveBoardPanelが対象となる */,
    action: (source: BoardConfig) => BoardConfig | void
): void => {
    if (boardEditorPanelId == null) {
        const result = action(state.panels.activeBoardPanel.board);
        if (result == null) {
            return;
        }
        state.panels.activeBoardPanel.board = result;
    } else {
        const targetPanel = state.panels.boardEditorPanels[boardEditorPanelId];
        if (targetPanel == null) {
            return;
        }
        const board = targetPanel.boards[keyNames(boardKey)] ?? defaultBoardConfig();
        action(board);
        targetPanel.boards[keyNames(boardKey)] = board;
    }
};

// CONSIDER: 各panelのmoveとresizeは、細分化する必要性が薄いため統合したほうがよさそう。
export const roomConfigModule = createSlice({
    name: 'roomConfig',
    initialState: null as RoomConfig | null,
    reducers: {
        setRoomConfig: (state: RoomConfig | null, action: PayloadAction<RoomConfig | null>) => {
            if (action.payload == null) {
                return action.payload;
            }
            fixRoomConfig(action.payload);
            return action.payload;
        },
        setOtherValues: (state: RoomConfig | null, action: PayloadAction<SetOtherValuesAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            if (action.payload.masterVolume != null) {
                state.masterVolume = action.payload.masterVolume;
            }
            if (action.payload.seVolume != null) {
                state.seVolume = action.payload.seVolume;
            }
            if (action.payload.messageNotificationFilter != null) {
                state.messageNotificationFilter = action.payload.messageNotificationFilter;
            }
        },
        setChannelVolume: (
            state: RoomConfig | null,
            action: PayloadAction<SetChannelVolumeAction>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            state.channelVolumes[action.payload.channelKey] = action.payload.volume;
        },

        bringPanelToFront: (state: RoomConfig | null, action: PayloadAction<PanelAction>) => {
            bringPanelToFront(state, action.payload);
        },
        setIsMinimized: (
            state: RoomConfig | null,
            action: PayloadAction<PanelAction & { newValue: boolean }>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }

            switch (action.payload.target.type) {
                case activeBoardPanel: {
                    state.panels.activeBoardPanel.isMinimized = action.payload.newValue;
                    return;
                }
                case boardEditorPanel: {
                    const targetPanel =
                        state.panels.boardEditorPanels[action.payload.target.panelId];
                    if (targetPanel == null) {
                        return;
                    }
                    targetPanel.isMinimized = action.payload.newValue;
                    return;
                }
                case characterPanel: {
                    state.panels.characterPanel.isMinimized = action.payload.newValue;
                    return;
                }
                case chatPalettePanel: {
                    const targetPanel =
                        state.panels.chatPalettePanels[action.payload.target.panelId];
                    if (targetPanel == null) {
                        return;
                    }
                    targetPanel.isMinimized = action.payload.newValue;
                    return;
                }
                case gameEffectPanel: {
                    state.panels.gameEffectPanel.isMinimized = action.payload.newValue;
                    return;
                }
                case memoPanel: {
                    const targetPanel = state.panels.memoPanels[action.payload.target.panelId];
                    if (targetPanel == null) {
                        return;
                    }
                    targetPanel.isMinimized = action.payload.newValue;
                    return;
                }
                case messagePanel: {
                    const targetPanel = state.panels.messagePanels[action.payload.target.panelId];
                    if (targetPanel == null) {
                        return;
                    }
                    targetPanel.isMinimized = action.payload.newValue;
                    return;
                }
                case participantPanel: {
                    state.panels.participantPanel.isMinimized = action.payload.newValue;
                    return;
                }
                case pieceValuePanel: {
                    state.panels.pieceValuePanel.isMinimized = action.payload.newValue;
                    return;
                }
            }
        },

        addBoardEditorPanelConfig: (
            state: RoomConfig | null,
            action: PayloadAction<AddBoardEditorPanelConfigAction>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const panelId = simpleId();
            state.panels.boardEditorPanels[panelId] = { ...action.payload.panel, zIndex: 0 };
            bringPanelToFront(state, {
                roomId: action.payload.roomId,
                target: { type: boardEditorPanel, panelId },
            });
        },
        updateBoardEditorPanel: (
            state: RoomConfig | null,
            action: PayloadAction<UpdateBoardEditorPanelAction>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.boardEditorPanels[action.payload.boardEditorPanelId];
            if (targetPanel == null) {
                return;
            }
            state.panels.boardEditorPanels[action.payload.boardEditorPanelId] = {
                ...targetPanel,
                activeBoardKey: action.payload.panel.activeBoardKey ?? targetPanel.activeBoardKey,
                isMinimized: action.payload.panel.isMinimized ?? targetPanel.isMinimized,
                x: action.payload.panel.x ?? targetPanel.x,
                y: action.payload.panel.y ?? targetPanel.y,
                width: action.payload.panel.width ?? targetPanel.width,
                height: action.payload.panel.height ?? targetPanel.height,
                zIndex: action.payload.panel.zIndex ?? targetPanel.zIndex,
            };
        },
        moveBoardPanel: (
            state: RoomConfig | null,
            action: PayloadAction<MovePanelAction & { boardEditorPanelId: string | null }>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            if (action.payload.boardEditorPanelId == null) {
                movePanel(state.panels.activeBoardPanel, action.payload);
                return;
            }
            const targetPanel = state.panels.boardEditorPanels[action.payload.boardEditorPanelId];
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizeBoardPanel: (
            state: RoomConfig | null,
            action: PayloadAction<ResizePanelAction & { boardEditorPanelId: string | null }>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            if (action.payload.boardEditorPanelId == null) {
                resizePanel(
                    state.panels.activeBoardPanel,
                    action.payload.dir,
                    action.payload.delta
                );
                return;
            }
            const targetPanel = state.panels.boardEditorPanels[action.payload.boardEditorPanelId];
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },
        removeBoardPanel: (
            state: RoomConfig | null,
            action: PayloadAction<RemoveBoardEditorPanelAction>
        ) => {
            if (state == null) {
                return;
            }
            delete state.panels.boardEditorPanels[action.payload.boardEditorPanelId];
        },
        // BoardConfigが存在しない場合、createDefaultBoardConfig()の値がデフォルト値であるという認識が呼び出し側でも共有されているという前提。
        updateBoard: (state: RoomConfig | null, action: PayloadAction<UpdateBoardAction>) => {
            if (state == null) {
                return;
            }
            editBoard(state, action.payload.boardKey, action.payload.boardEditorPanelId, board => {
                if (action.payload.offsetXDelta != null) {
                    board.offsetX = board.offsetX + action.payload.offsetXDelta;
                }
                if (action.payload.offsetYDelta != null) {
                    board.offsetY = board.offsetY + action.payload.offsetYDelta;
                }
                if (action.payload.zoomDelta != null) {
                    board.zoom = board.zoom + action.payload.zoomDelta;
                }
                if (action.payload.showGrid != null) {
                    board.showGrid = action.payload.showGrid;
                }
                if (action.payload.gridLineColor != null) {
                    board.gridLineColor = action.payload.gridLineColor;
                }
                if (action.payload.gridLineTension != null) {
                    board.gridLineTension = action.payload.gridLineTension;
                }
            });
        },
        // BoardConfigが存在しない場合、createDefaultBoardConfig()の値がデフォルト値であるという認識が呼び出し側でも共有されているという前提。
        zoomBoard: (state: RoomConfig | null, action: PayloadAction<ZoomBoardAction>) => {
            if (state == null) {
                return;
            }

            editBoard(state, action.payload.boardKey, action.payload.boardEditorPanelId, board => {
                const prevZoom = board.zoom;
                const nextZoom = prevZoom + action.payload.zoomDelta;
                const prevScale = Math.pow(2, prevZoom);
                const nextScale = Math.pow(2, nextZoom);

                board.zoom = nextZoom;
                board.offsetX -=
                    (action.payload.prevCanvasWidth / 2) * (1 / nextScale - 1 / prevScale);
                board.offsetY -=
                    (action.payload.prevCanvasHeight / 2) * (1 / nextScale - 1 / prevScale);
            });
        },
        resetBoard: (state: RoomConfig | null, action: PayloadAction<ResetBoardAction>) => {
            if (state == null) {
                return;
            }

            editBoard(state, action.payload.boardKey, action.payload.boardEditorPanelId, () =>
                defaultBoardConfig()
            );
        },

        moveCharacterPanel: (state: RoomConfig | null, action: PayloadAction<MovePanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.characterPanel;
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizeCharacterPanel: (
            state: RoomConfig | null,
            action: PayloadAction<ResizePanelAction>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.characterPanel;
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },

        addChatPalettePanelConfig: (
            state: RoomConfig | null,
            action: PayloadAction<AddChatPalettePanelConfigAction>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const panelId = simpleId();
            state.panels.chatPalettePanels[panelId] = { ...action.payload.panel, zIndex: 0 };
            bringPanelToFront(state, {
                roomId: action.payload.roomId,
                target: { type: chatPalettePanel, panelId },
            });
        },
        updateChatPalettePanel: (
            state: RoomConfig | null,
            action: PayloadAction<UpdateChatPalettePanelAction>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.chatPalettePanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            let selectedTextColor: string | undefined = targetPanel.selectedTextColor;
            if (typeof action.payload.panel.selectedTextColor === 'string') {
                selectedTextColor = action.payload.panel.selectedTextColor;
            } else if (action.payload.panel.selectedTextColor?.type === reset) {
                selectedTextColor = undefined;
            }
            state.panels.chatPalettePanels[action.payload.panelId] = {
                ...targetPanel,
                isMinimized: action.payload.panel.isMinimized ?? targetPanel.isMinimized,
                x: action.payload.panel.x ?? targetPanel.x,
                y: action.payload.panel.y ?? targetPanel.y,
                width: action.payload.panel.width ?? targetPanel.width,
                height: action.payload.panel.height ?? targetPanel.height,
                zIndex: action.payload.panel.zIndex ?? targetPanel.zIndex,
                selectedTextColor,
                selectedPublicChannelKey:
                    action.payload.panel.selectedPublicChannelKey ??
                    targetPanel.selectedPublicChannelKey,
                selectedCharacterStateId:
                    action.payload.panel.selectedCharacterStateId ??
                    targetPanel.selectedCharacterStateId,
                customCharacterName:
                    action.payload.panel.customCharacterName ?? targetPanel.customCharacterName,
                selectedGameSystem:
                    action.payload.panel.selectedGameSystem ?? targetPanel.selectedGameSystem,
            };
        },
        moveChatPalettePanel: (
            state: RoomConfig | null,
            action: PayloadAction<MovePanelAction & { panelId: string }>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.chatPalettePanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizeChatPalettePanel: (
            state: RoomConfig | null,
            action: PayloadAction<ResizePanelAction & { panelId: string }>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.chatPalettePanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },
        removeChatPalettePanel: (
            state: RoomConfig | null,
            action: PayloadAction<RemoveChatPalettePanelAction>
        ) => {
            if (state == null) {
                return;
            }
            delete state.panels.chatPalettePanels[action.payload.panelId];
        },

        moveGameEffectPanel: (state: RoomConfig | null, action: PayloadAction<MovePanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.gameEffectPanel;
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizeGameEffectPanel: (
            state: RoomConfig | null,
            action: PayloadAction<ResizePanelAction>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.gameEffectPanel;
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },

        addMemoPanelConfig: (
            state: RoomConfig | null,
            action: PayloadAction<AddMemoPanelConfigAction>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const panelId = simpleId();
            state.panels.memoPanels[panelId] = { ...action.payload.panel, zIndex: 0 };
            bringPanelToFront(state, {
                roomId: action.payload.roomId,
                target: { type: memoPanel, panelId },
            });
        },
        updateMemoPanel: (
            state: RoomConfig | null,
            action: PayloadAction<UpdateMemoPanelAction>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.memoPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            state.panels.memoPanels[action.payload.panelId] = {
                ...targetPanel,
                isMinimized: action.payload.panel.isMinimized ?? targetPanel.isMinimized,
                x: action.payload.panel.x ?? targetPanel.x,
                y: action.payload.panel.y ?? targetPanel.y,
                width: action.payload.panel.width ?? targetPanel.width,
                height: action.payload.panel.height ?? targetPanel.height,
                zIndex: action.payload.panel.zIndex ?? targetPanel.zIndex,
                selectedMemoId: action.payload.panel.selectedMemoId ?? targetPanel.selectedMemoId,
            };
        },
        moveMemoPanel: (
            state: RoomConfig | null,
            action: PayloadAction<MovePanelAction & { panelId: string }>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.memoPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizeMemoPanel: (
            state: RoomConfig | null,
            action: PayloadAction<ResizePanelAction & { panelId: string }>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.memoPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },
        removeMemoPanel: (
            state: RoomConfig | null,
            action: PayloadAction<RemoveMemoPanelAction>
        ) => {
            if (state == null) {
                return;
            }
            delete state.panels.memoPanels[action.payload.panelId];
        },

        addMessagePanelConfig: (
            state: RoomConfig | null,
            action: PayloadAction<AddMessagePanelConfigAction>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const panelId = simpleId();
            state.panels.messagePanels[panelId] = { ...action.payload.panel, zIndex: 0 };
            bringPanelToFront(state, {
                roomId: action.payload.roomId,
                target: { type: messagePanel, panelId },
            });
        },
        updateMessagePanel: (
            state: RoomConfig | null,
            action: PayloadAction<UpdateMessagePanelAction>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.messagePanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            let selectedTextColor: string | undefined = targetPanel.selectedTextColor;
            if (typeof action.payload.panel.selectedTextColor === 'string') {
                selectedTextColor = action.payload.panel.selectedTextColor;
            } else if (action.payload.panel.selectedTextColor?.type === reset) {
                selectedTextColor = undefined;
            }
            state.panels.messagePanels[action.payload.panelId] = {
                ...targetPanel,
                isMinimized: action.payload.panel.isMinimized ?? targetPanel.isMinimized,
                x: action.payload.panel.x ?? targetPanel.x,
                y: action.payload.panel.y ?? targetPanel.y,
                width: action.payload.panel.width ?? targetPanel.width,
                height: action.payload.panel.height ?? targetPanel.height,
                zIndex: action.payload.panel.zIndex ?? targetPanel.zIndex,
                tabs: action.payload.panel.tabs ?? targetPanel.tabs,
                selectedTextColor,
                selectedPublicChannelKey:
                    action.payload.panel.selectedPublicChannelKey ??
                    targetPanel.selectedPublicChannelKey,
                selectedCharacterType:
                    action.payload.panel.selectedCharacterType ?? targetPanel.selectedCharacterType,
                selectedCharacterStateId:
                    action.payload.panel.selectedCharacterStateId ??
                    targetPanel.selectedCharacterStateId,
                customCharacterName:
                    action.payload.panel.customCharacterName ?? targetPanel.customCharacterName,
                selectedGameSystem:
                    action.payload.panel.selectedGameSystem ?? targetPanel.selectedGameSystem,
            };
        },
        moveMessagePanel: (
            state: RoomConfig | null,
            action: PayloadAction<MovePanelAction & { panelId: string }>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.messagePanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizeMessagePanel: (
            state: RoomConfig | null,
            action: PayloadAction<ResizePanelAction & { panelId: string }>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.messagePanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },
        removeMessagePanel: (
            state: RoomConfig | null,
            action: PayloadAction<RemoveMessagePanelAction>
        ) => {
            if (state == null) {
                return;
            }
            delete state.panels.messagePanels[action.payload.panelId];
        },

        moveParticipantPanel: (
            state: RoomConfig | null,
            action: PayloadAction<MovePanelAction>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.participantPanel;
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizeParticipantPanel: (
            state: RoomConfig | null,
            action: PayloadAction<ResizePanelAction>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.participantPanel;
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },

        movePieceValuePanel: (state: RoomConfig | null, action: PayloadAction<MovePanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.pieceValuePanel;
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizePieceValuePanel: (
            state: RoomConfig | null,
            action: PayloadAction<ResizePanelAction>
        ) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.pieceValuePanel;
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },
    },
});
