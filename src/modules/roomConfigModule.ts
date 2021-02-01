import { createSlice, PayloadAction } from '@reduxjs/toolkit';
//import { BoardConfig, BoardsPanelConfig } from '../states/BoardsPanelConfig';
import { boardsPanel, charactersPanel, gameEffectPanel, messagesPanel, PanelAction, RoomConfig, UpdateGameTypeAction } from '../states/RoomConfig';
import * as generators from '../utils/generators';
import { ResizableDelta } from 'react-rnd';
import { ResizeDirection } from 're-resizable';
import { recordToArray } from '../utils/record';
import { BoardConfig, BoardsPanelConfig, createDefaultBoardConfig } from '../states/BoardsPanelConfig';
import { CompositeKey, compositeKeyToString } from '../@shared/StateMap';

export type MovePanelAction = {
    roomId: string;
    x: number;
    y: number;
}

export type ResizePanelAction = {
    roomId: string;
    dir: ResizeDirection;
    delta: ResizableDelta;
}

export type AddBoardPanelConfigAction = {
    roomId: string;
    panel: Omit<BoardsPanelConfig, 'zIndex'>;
}

export type UpdateBoardPanelAction = {
    roomId: string;
    panelId: string;
    panel: Omit<Partial<BoardsPanelConfig>, 'boards'>;
}

export type RemoveBoardPanelAction = {
    roomId: string;
    panelId: string;
}

// zoomのとき自動移動させたい場合は代わりにZoomBoardActionで行う
export type UpdateBoardAction = {
    roomId: string;
    panelId: string;
    boardKey: CompositeKey;
    offsetXDelta?: number;
    offsetYDelta?: number;
    zoomDelta?: number;
}

export type ZoomBoardAction = {
    roomId: string;
    panelId: string;
    boardKey: CompositeKey;
    zoomDelta: number;
    prevCanvasWidth: number;
    prevCanvasHeight: number;
}

export type ResetBoardAction = {
    roomId: string;
    panelId: string;
    boardKey: CompositeKey;
}

export type RemoveBoardAction = {
    roomId: string;
    panelId: string;
    boardKey: CompositeKey;
}

export type UpdateChannelVisibilityAction = {
    roomId: string;
    channelKey: string;
    newValue: boolean | undefined;
}

// DraggablePanelが移動できない位置に行くのを防ぐ処理。
// Redux側ではなくUI側にこの処理を任せるとReduxとUIの独立性が高まるので一見良さそうだが、localforageからデータを読み込むときも似たような処理をしているため、もしRedux外に任せても結局Configを読み込むときにこの処理を行わなければならず、トータルで見たときの独立性は高くなっていない。UI側でデータの調整をしてdispatchする手もあるが、UI画面を開き直すたびにこの処理が走るので無駄。そのため、Redux側でこの処理を取り扱うことにしている。
const movePanel = (state: { x: number; y: number }, newPosition: { x: number; y: number }): void => {
    state.x = Math.max(0, newPosition.x);
    state.y = Math.max(0, newPosition.y);
};

const resizePanel = (state: { x: number; y: number; width: number; height: number }, actionDir: ResizeDirection, actionDelta: { width: number; height: number }): void => {
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
        position.y = Math.max(0, position.y);
    };
    recordToArray(config.panels.boardsPanels).forEach(pair => fixPosition(pair.value));
    fixPosition(config.panels.charactersPanel);
    fixPosition(config.panels.messagesPanel);
};

const bringPanelToFront = (state: RoomConfig | null, action: PanelAction): void => {
    if (state == null || state.roomId !== action.roomId) {
        return;
    }

    const panels: { zIndex: number }[] = [];
    for (const panelId in state.panels.boardsPanels) {
        const panel = state.panels.boardsPanels[panelId];
        panels.push(panel);
    }
    panels.push(state.panels.charactersPanel);
    panels.push(state.panels.gameEffectPanel);
    panels.push(state.panels.messagesPanel);

    // まずzIndexが小さい順に0,1,2,…と割り振っていく。こうすることで、例えば[-100, 5, 10000]のように飛び飛びになっている状態を修正する。zIndexが同一であるパネルが複数ある場合でも異なるzIndexになるため、場合によっては前面に来るパネルが変わる可能性もあるが、直接Configを編集したりしていない限りすべてが異なるzIndexであるはずなので無視している。
    // 次に、最前面にさせたいパネルのzIndexに(max(割り振ったzIndex) + 1)を代入して完了。

    panels.sort((x, y) => x.zIndex - y.zIndex).forEach((panel, i) => {
        panel.zIndex = i;
    });

    switch (action.target.type) {
        case boardsPanel: {
            const targetPanel = state.panels.boardsPanels[action.target.panelId];
            if (targetPanel == null) {
                return;
            }
            targetPanel.zIndex = panels.length;
            return;
        }
        case charactersPanel: {
            state.panels.charactersPanel.zIndex = panels.length;
            return;
        }
        case gameEffectPanel: {
            state.panels.gameEffectPanel.zIndex = panels.length;
            return;
        }
        case messagesPanel: {
            state.panels.messagesPanel.zIndex = panels.length;
            return;
        }
    }
};

const roomConfigModule = createSlice({
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
        setGameType: (state: RoomConfig | null, action: PayloadAction<UpdateGameTypeAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            state.gameType = action.payload.gameType;
        },
        bringPanelToFront: (state: RoomConfig | null, action: PayloadAction<PanelAction>) => {
            bringPanelToFront(state, action.payload);
        },
        setIsMinimized: (state: RoomConfig | null, action: PayloadAction<PanelAction & { newValue: boolean }>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }

            switch (action.payload.target.type) {
                case boardsPanel: {
                    const targetPanel = state.panels.boardsPanels[action.payload.target.panelId];
                    if (targetPanel == null) {
                        return;
                    }
                    targetPanel.isMinimized = action.payload.newValue;
                    return;
                }
                case charactersPanel: {
                    state.panels.charactersPanel.isMinimized = action.payload.newValue;
                    return;
                }
                case gameEffectPanel: {
                    state.panels.gameEffectPanel.isMinimized = action.payload.newValue;
                    return;
                }
                case messagesPanel: {
                    state.panels.messagesPanel.isMinimized = action.payload.newValue;
                    return;
                }
            }
        },

        addBoardPanelConfig: (state: RoomConfig | null, action: PayloadAction<AddBoardPanelConfigAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const panelId = generators.simpleId();
            state.panels.boardsPanels[panelId] = {...action.payload.panel, zIndex: -1 };
            bringPanelToFront(state, { roomId: action.payload.roomId, target: { type: boardsPanel, panelId } });
        },
        updateBoardPanel: (state: RoomConfig | null, action: PayloadAction<UpdateBoardPanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.boardsPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            state.panels.boardsPanels[action.payload.panelId] = {
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
        moveBoardPanel: (state: RoomConfig | null, action: PayloadAction<MovePanelAction & { panelId: string }>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.boardsPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizeBoardPanel: (state: RoomConfig | null, action: PayloadAction<ResizePanelAction & { panelId: string }>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.boardsPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },
        removeBoardPanel: (state: RoomConfig | null, action: PayloadAction<RemoveBoardPanelAction>) => {
            if (state == null) {
                return;
            }
            delete state.panels.boardsPanels[action.payload.panelId];
        },
        // BoardConfigが存在しない場合、createDefaultBoardConfig()の値がデフォルト値であるという認識が呼び出し側でも共有されているという前提。
        updateBoard: (state: RoomConfig | null, action: PayloadAction<UpdateBoardAction>) => {
            if (state == null) {
                return;
            }
            const targetPanel = state.panels.boardsPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            const board = targetPanel.boards[compositeKeyToString(action.payload.boardKey)] ?? createDefaultBoardConfig();
            if (action.payload.offsetXDelta != null) {
                board.offsetX = board.offsetX + action.payload.offsetXDelta;
            }
            if (action.payload.offsetYDelta != null) {
                board.offsetY = board.offsetY + action.payload.offsetYDelta;
            }
            if (action.payload.zoomDelta != null) {
                board.zoom = board.zoom + action.payload.zoomDelta;
            }
            targetPanel.boards[compositeKeyToString(action.payload.boardKey)] = board;
        },
        // BoardConfigが存在しない場合、createDefaultBoardConfig()の値がデフォルト値であるという認識が呼び出し側でも共有されているという前提。
        zoomBoard: (state: RoomConfig | null, action: PayloadAction<ZoomBoardAction>) => {
            if (state == null) {
                return;
            }
            const targetPanel = state.panels.boardsPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            const board = targetPanel.boards[compositeKeyToString(action.payload.boardKey)] ?? createDefaultBoardConfig();
            board.zoom = board.zoom + action.payload.zoomDelta;
            targetPanel.boards[compositeKeyToString(action.payload.boardKey)] = board;
        },
        resetBoard: (state: RoomConfig | null, action: PayloadAction<ResetBoardAction>) => {
            if (state == null) {
                return;
            }
            const targetPanel = state.panels.boardsPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            const board = createDefaultBoardConfig();
            targetPanel.boards[compositeKeyToString(action.payload.boardKey)] = board;
        },
        removeBoard: (state: RoomConfig | null, action: PayloadAction<RemoveBoardAction>) => {
            if (state == null) {
                return;
            }
            const targetPanel = state.panels.boardsPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            delete targetPanel.boards[compositeKeyToString(action.payload.boardKey)];
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
        resizeGameEffectPanel: (state: RoomConfig | null, action: PayloadAction<ResizePanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.gameEffectPanel;
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },

        moveCharactersPanel: (state: RoomConfig | null, action: PayloadAction<MovePanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.charactersPanel;
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizeCharactersPanel: (state: RoomConfig | null, action: PayloadAction<ResizePanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.charactersPanel;
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },

        moveMessagesPanel: (state: RoomConfig | null, action: PayloadAction<MovePanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.messagesPanel;
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizeMessagesPanel: (state: RoomConfig | null, action: PayloadAction<ResizePanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.messagesPanel;
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },
        updateChannelVisibility: (state: RoomConfig | null, action: PayloadAction<UpdateChannelVisibilityAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.messagesPanel;
            if (targetPanel == null) {
                return;
            }
            const targetConfig = targetPanel.channels[action.payload.channelKey];
            if (targetConfig == null) {
                targetPanel.channels[action.payload.channelKey] = {
                    show: action.payload.newValue,
                };
                return;
            }
            targetConfig.show = action.payload.newValue;
        },
    }
});

export default roomConfigModule;