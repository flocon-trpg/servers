import { createSlice, PayloadAction } from '@reduxjs/toolkit';
//import { BoardConfig, BoardsPanelConfig } from '../states/BoardsPanelConfig';
import { boardPanel, characterPanel, gameEffectPanel, messagePanel, myValuePanel, PanelAction, participantPanel, RoomConfig, UpdateGameSystemAction } from '../states/RoomConfig';
import * as generators from '../utils/generators';
import { ResizableDelta } from 'react-rnd';
import { ResizeDirection } from 're-resizable';
import { recordToArray } from '../utils/record';
import { BoardConfig, BoardsPanelConfig, createDefaultBoardConfig } from '../states/BoardsPanelConfig';
import { CompositeKey, compositeKeyToString } from '../@shared/StateMap';
import { StrIndex5 } from '../@shared/indexes';
import { MessageFilter, MessagePanelConfig } from '../states/MessagesPanelConfig';
import { reset, Reset } from '../utils/types';

export type SetOtherValuesAction = {
    roomId: string;
    masterVolume?: number;
    seVolume?: number;
    messageNotificationFilter?: MessageFilter;
}

export type SetChannelVolumeAction = {
    roomId: string;
    channelKey: StrIndex5;
    volume: number;
};

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

export type AddMessagePanelConfigAction = {
    roomId: string;
    panel: Omit<MessagePanelConfig, 'zIndex'>;
}

export type UpdateMessagePanelAction = {
    roomId: string;
    panelId: string;
    panel: Omit<Partial<MessagePanelConfig>, 'selectedTextColor'> & { selectedTextColor?: string | Reset };
}

export type RemoveMessagePanelAction = {
    roomId: string;
    panelId: string;
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
    recordToArray(config.panels.boardPanels).forEach(pair => fixPosition(pair.value));
    fixPosition(config.panels.characterPanel);
    recordToArray(config.panels.messagePanels).forEach(pair => fixPosition(pair.value));
};

const bringPanelToFront = (state: RoomConfig | null, action: PanelAction): void => {
    if (state == null || state.roomId !== action.roomId) {
        return;
    }

    const panels: { zIndex: number }[] = [];
    for (const panelId in state.panels.boardPanels) {
        const panel = state.panels.boardPanels[panelId];
        panels.push(panel);
    }
    panels.push(state.panels.characterPanel);
    panels.push(state.panels.gameEffectPanel);
    for (const panelId in state.panels.messagePanels) {
        const panel = state.panels.messagePanels[panelId];
        panels.push(panel);
    }
    panels.push(state.panels.myValuePanel);
    panels.push(state.panels.participantPanel);

    // まずzIndexが小さい順に0,1,2,…と割り振っていく。こうすることで、例えば[-100, 5, 10000]のように飛び飛びになっている状態を修正する。zIndexが同一であるパネルが複数ある場合でも異なるzIndexになるため、場合によっては前面に来るパネルが変わる可能性もあるが、直接Configを編集したりしていない限りすべてが異なるzIndexであるはずなので無視している。
    // 次に、最前面にさせたいパネルのzIndexに(max(割り振ったzIndex) + 1)を代入して完了。

    panels.sort((x, y) => x.zIndex - y.zIndex).forEach((panel, i) => {
        panel.zIndex = i;
    });

    switch (action.target.type) {
        case boardPanel: {
            const targetPanel = state.panels.boardPanels[action.target.panelId];
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
        case gameEffectPanel: {
            state.panels.gameEffectPanel.zIndex = panels.length;
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
        case participantPanel: {
            state.panels.myValuePanel.zIndex = panels.length;
            return;
        }
    }
};

// CONSIDER: 各panelのmoveとresizeは、細分化する必要性が薄いため統合したほうがよさそう。
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
        setChannelVolume: (state: RoomConfig | null, action: PayloadAction<SetChannelVolumeAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            state.channelVolumes[action.payload.channelKey] = action.payload.volume;
        },

        bringPanelToFront: (state: RoomConfig | null, action: PayloadAction<PanelAction>) => {
            bringPanelToFront(state, action.payload);
        },
        setIsMinimized: (state: RoomConfig | null, action: PayloadAction<PanelAction & { newValue: boolean }>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }

            switch (action.payload.target.type) {
                case boardPanel: {
                    const targetPanel = state.panels.boardPanels[action.payload.target.panelId];
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
                case gameEffectPanel: {
                    state.panels.gameEffectPanel.isMinimized = action.payload.newValue;
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
                case myValuePanel: {
                    state.panels.myValuePanel.isMinimized = action.payload.newValue;
                    return;
                }
            }
        },

        addBoardPanelConfig: (state: RoomConfig | null, action: PayloadAction<AddBoardPanelConfigAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const panelId = generators.simpleId();
            state.panels.boardPanels[panelId] = { ...action.payload.panel, zIndex: -1 };
            bringPanelToFront(state, { roomId: action.payload.roomId, target: { type: boardPanel, panelId } });
        },
        updateBoardPanel: (state: RoomConfig | null, action: PayloadAction<UpdateBoardPanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.boardPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            state.panels.boardPanels[action.payload.panelId] = {
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
            const targetPanel = state.panels.boardPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizeBoardPanel: (state: RoomConfig | null, action: PayloadAction<ResizePanelAction & { panelId: string }>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.boardPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },
        removeBoardPanel: (state: RoomConfig | null, action: PayloadAction<RemoveBoardPanelAction>) => {
            if (state == null) {
                return;
            }
            delete state.panels.boardPanels[action.payload.panelId];
        },
        // BoardConfigが存在しない場合、createDefaultBoardConfig()の値がデフォルト値であるという認識が呼び出し側でも共有されているという前提。
        updateBoard: (state: RoomConfig | null, action: PayloadAction<UpdateBoardAction>) => {
            if (state == null) {
                return;
            }
            const targetPanel = state.panels.boardPanels[action.payload.panelId];
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
            const targetPanel = state.panels.boardPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            const board = targetPanel.boards[compositeKeyToString(action.payload.boardKey)] ?? createDefaultBoardConfig();

            const prevZoom = board.zoom;
            const nextZoom = prevZoom + action.payload.zoomDelta;
            const prevScale = Math.pow(2, prevZoom);
            const nextScale = Math.pow(2, nextZoom);

            board.zoom = nextZoom;
            board.offsetX -= (action.payload.prevCanvasWidth / 2 * (1 / nextScale - 1 / prevScale));
            board.offsetY -= (action.payload.prevCanvasHeight / 2 * (1 / nextScale - 1 / prevScale));

            targetPanel.boards[compositeKeyToString(action.payload.boardKey)] = board;
        },
        resetBoard: (state: RoomConfig | null, action: PayloadAction<ResetBoardAction>) => {
            if (state == null) {
                return;
            }
            const targetPanel = state.panels.boardPanels[action.payload.panelId];
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
            const targetPanel = state.panels.boardPanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            delete targetPanel.boards[compositeKeyToString(action.payload.boardKey)];
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
        resizeCharacterPanel: (state: RoomConfig | null, action: PayloadAction<ResizePanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.characterPanel;
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
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

        addMessagePanelConfig: (state: RoomConfig | null, action: PayloadAction<AddMessagePanelConfigAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const panelId = generators.simpleId();
            state.panels.messagePanels[panelId] = { ...action.payload.panel, zIndex: -1 };
            bringPanelToFront(state, { roomId: action.payload.roomId, target: { type: messagePanel, panelId } });
        },
        updateMessagePanel: (state: RoomConfig | null, action: PayloadAction<UpdateMessagePanelAction>) => {
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
                selectedChannelType: action.payload.panel.selectedChannelType ?? targetPanel.selectedChannelType,
                selectedPublicChannelKey: action.payload.panel.selectedPublicChannelKey ?? targetPanel.selectedPublicChannelKey,
                selectedCharacterType: action.payload.panel.selectedCharacterType ?? targetPanel.selectedCharacterType,
                selectedCharacterStateId: action.payload.panel.selectedCharacterStateId ?? targetPanel.selectedCharacterStateId,
                customCharacterName: action.payload.panel.customCharacterName ?? targetPanel.customCharacterName,
                selectedGameSystem: action.payload.panel.selectedGameSystem ?? targetPanel.selectedGameSystem,
            };
        },
        moveMessagePanel: (state: RoomConfig | null, action: PayloadAction<MovePanelAction & { panelId: string }>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.messagePanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizeMessagePanel: (state: RoomConfig | null, action: PayloadAction<ResizePanelAction & { panelId: string }>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.messagePanels[action.payload.panelId];
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },
        removeMessagePanel: (state: RoomConfig | null, action: PayloadAction<RemoveMessagePanelAction>) => {
            if (state == null) {
                return;
            }
            delete state.panels.messagePanels[action.payload.panelId];
        },

        moveParticipantPanel: (state: RoomConfig | null, action: PayloadAction<MovePanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.participantPanel;
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizeParticipantPanel: (state: RoomConfig | null, action: PayloadAction<ResizePanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.participantPanel;
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },
        
        moveMyValuePanel: (state: RoomConfig | null, action: PayloadAction<MovePanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.myValuePanel;
            if (targetPanel == null) {
                return;
            }
            movePanel(targetPanel, action.payload);
        },
        resizeMyValuePanel: (state: RoomConfig | null, action: PayloadAction<ResizePanelAction>) => {
            if (state == null || state.roomId !== action.payload.roomId) {
                return;
            }
            const targetPanel = state.panels.myValuePanel;
            if (targetPanel == null) {
                return;
            }
            resizePanel(targetPanel, action.payload.dir, action.payload.delta);
        },
    }
});

export default roomConfigModule;