import { recordToArray } from '@flocon-trpg/utils';
import { produce } from 'immer';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import localforage from 'localforage';
import { NumberSize, ResizeDirection } from 're-resizable';
import { atomWithDebounceStorage } from '../atomWithDebounceStorage/atomWithDebounceStorage';
import { ActiveBoardPanelConfig } from './types/activeBoardPanelConfig';
import { BoardConfig, defaultBoardConfig } from './types/boardConfig';
import { BoardEditorPanelConfig } from './types/boardEditorPanelConfig';
import { CharactersPanelConfig } from './types/charactersPanelConfig';
import { ChatPalettePanelConfig } from './types/chatPalettePanelConfig';
import { GameEffectPanelConfig } from './types/gameEffectPanelConfig';
import { MemoPanelConfig } from './types/memoPanelConfig';
import { MessagePanelConfig } from './types/messagePanelConfig';
import { PanelsConfig } from './types/panelsConfig';
import { ParticipantsPanelConfig } from './types/participantsPanelConfig';
import { PieceValuePanelConfig } from './types/pieceValuePanelConfig';
import { RollCallPanelConfig } from './types/rollCallPanelConfig';
import {
    RoomConfig,
    SerializedRoomConfig,
    defaultRoomConfig,
    deserializeRoomConfig,
    serializedRoomConfig,
} from './types/roomConfig';
import { tryParseJSON } from '@/utils/tryParseJSON';
import { BoardType } from '@/utils/types';

export const activeBoardPanel = 'activeBoardPanel';
export const boardEditorPanel = 'boardEditorPanel';
export const characterPanel = 'characterPanel';
export const chatPalettePanel = 'chatPalettePanel';
export const gameEffectPanel = 'gameEffectPanel';
export const memoPanel = 'memoPanel';
export const messagePanel = 'messagePanel';
export const participantPanel = 'participantPanel';
export const pieceValuePanel = 'pieceValuePanel';
export const rollCallPanel = 'rollCallPanel';

export type PanelType =
    | {
          type: typeof activeBoardPanel;
      }
    | {
          type: typeof boardEditorPanel;
          panelId: string;
      }
    | {
          type: typeof characterPanel;
      }
    | {
          type: typeof chatPalettePanel;
          panelId: string;
      }
    | {
          type: typeof gameEffectPanel;
      }
    | {
          type: typeof memoPanel;
          panelId: string;
      }
    | {
          type: typeof messagePanel;
          panelId: string;
      }
    | {
          type: typeof participantPanel;
      }
    | {
          type: typeof pieceValuePanel;
      }
    | { type: typeof rollCallPanel };

export type ZoomBoardAction = {
    roomId: string;
    boardType: BoardType;
    boardId: string;
    zoomDelta: number;
    prevCanvasWidth: number;
    prevCanvasHeight: number;
};

const updatePanelMutate = (
    state: PanelsConfig,
    panelType: PanelType,
    action: (prev: AnyPanel) => void,
): void => {
    switch (panelType.type) {
        case activeBoardPanel: {
            action(state.activeBoardPanel);
            break;
        }
        case boardEditorPanel: {
            const panel = state.boardEditorPanels[panelType.panelId];
            if (panel == null) {
                return;
            }
            action(panel);
            break;
        }
        case characterPanel: {
            action(state.characterPanel);
            break;
        }
        case chatPalettePanel: {
            const panel = state.chatPalettePanels[panelType.panelId];
            if (panel == null) {
                return;
            }
            action(panel);
            break;
        }
        case gameEffectPanel: {
            action(state.gameEffectPanel);
            break;
        }
        case memoPanel: {
            const panel = state.memoPanels[panelType.panelId];
            if (panel == null) {
                return;
            }
            action(panel);
            break;
        }
        case messagePanel: {
            const panel = state.messagePanels[panelType.panelId];
            if (panel == null) {
                return;
            }
            action(panel);
            break;
        }
        case participantPanel: {
            action(state.participantPanel);
            break;
        }
        case pieceValuePanel: {
            action(state.pieceValuePanel);
            break;
        }
        case rollCallPanel: {
            action(state.rollCallPanel);
            break;
        }
    }
};

const fixPositionMutate = (position: { x: number; y: number }): void => {
    position.x = Math.max(0, position.x);
    position.y = Math.max(0, position.y);
};

// DraggablePanelが移動できない位置に行くのを防ぐ処理。
// CONSIDER: ↓はReduxを使っていた時の話であり、現在の状態でも成立するのか不明。
// Redux側ではなくUI側にこの処理を任せるとReduxとUIの独立性が高まるので一見良さそうだが、localforageからデータを読み込むときも似たような処理をしているため、もしRedux外に任せても結局Configを読み込むときにこの処理を行わなければならず、トータルで見たときの独立性は高くなっていない。そのため、Redux側でこの処理を取り扱うことにしている。
const fixRoomConfigMutate = (config: RoomConfig): void => {
    fixPositionMutate(config.panels.activeBoardPanel);
    recordToArray(config.panels.boardEditorPanels).forEach(pair => fixPositionMutate(pair.value));
    fixPositionMutate(config.panels.characterPanel);
    recordToArray(config.panels.chatPalettePanels).forEach(pair => fixPositionMutate(pair.value));
    fixPositionMutate(config.panels.gameEffectPanel);
    recordToArray(config.panels.memoPanels).forEach(pair => fixPositionMutate(pair.value));
    recordToArray(config.panels.messagePanels).forEach(pair => fixPositionMutate(pair.value));
    fixPositionMutate(config.panels.participantPanel);
    fixPositionMutate(config.panels.pieceValuePanel);
};

const movePanelMutate = (
    state: { x: number; y: number },
    newPosition: { x: number; y: number },
): void => {
    state.x = newPosition.x;
    state.y = newPosition.y;
    fixPositionMutate(state);
};

const bringPanelToFrontMutate = (state: RoomConfig, action: PanelType): void => {
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
    panels.push(state.panels.participantPanel);
    panels.push(state.panels.pieceValuePanel);
    panels.push(state.panels.rollCallPanel);

    // まずzIndexが小さい順に0,1,2,…と割り振っていく。こうすることで、例えば[-100, 5, 10000]のように飛び飛びになっている状態を修正する。zIndexが同一であるパネルが複数ある場合でも異なるzIndexになるため、場合によっては前面に来るパネルが変わる可能性もあるが、直接Configを編集したりしていない限りすべてのzIndexは異なっているはずなので無視している。
    // 次に、最前面にさせたいパネルのzIndexに(max(割り振ったzIndexの集合) + 1)を代入して完了。

    panels
        .sort((x, y) => x.zIndex - y.zIndex)
        .forEach((panel, i) => {
            panel.zIndex = i;
        });

    switch (action.type) {
        case activeBoardPanel: {
            state.panels.activeBoardPanel.zIndex = panels.length;
            return;
        }
        case boardEditorPanel: {
            const targetPanel = state.panels.boardEditorPanels[action.panelId];
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
            const targetPanel = state.panels.chatPalettePanels[action.panelId];
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
            const targetPanel = state.panels.memoPanels[action.panelId];
            if (targetPanel == null) {
                return;
            }
            targetPanel.zIndex = panels.length;
            return;
        }
        case messagePanel: {
            const targetPanel = state.panels.messagePanels[action.panelId];
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
        case rollCallPanel: {
            state.panels.rollCallPanel.zIndex = panels.length;
            return;
        }
    }
};

const resizePanelMutate = (
    state: { x: number; y: number; width: number; height: number },
    actionDir: ResizeDirection,
    actionDelta: { width: number; height: number },
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
    fixPositionMutate(state);
};

const editBoardMutate = (
    state: RoomConfig,
    boardId: string,
    boardType: BoardType,
    action: (source: BoardConfig) => BoardConfig | void,
): void => {
    if (boardType.type === 'activeBoardViewer') {
        if (boardType.isBackground) {
            const result = action(state.panels.activeBoardBackground.board);
            if (result == null) {
                return;
            }
            state.panels.activeBoardBackground.board = result;
            return;
        }
        const result = action(state.panels.activeBoardPanel.board);
        if (result == null) {
            return;
        }
        state.panels.activeBoardPanel.board = result;
        return;
    }
    const targetPanel = state.panels.boardEditorPanels[boardType.boardEditorPanelId];
    if (targetPanel == null) {
        return;
    }
    const board = targetPanel.boards[boardId] ?? defaultBoardConfig();
    const actionResult = action(board);
    targetPanel.boards[boardId] = actionResult ?? board;
};

const zoomBoardMutate = (state: RoomConfig, action: ZoomBoardAction): void => {
    editBoardMutate(state, action.boardId, action.boardType, board => {
        const prevZoom = board.zoom;
        const nextZoom = prevZoom + action.zoomDelta;
        const prevScale = Math.pow(2, prevZoom);
        const nextScale = Math.pow(2, nextZoom);

        board.zoom = nextZoom;
        board.offsetX -= (action.prevCanvasWidth / 2) * (1 / nextScale - 1 / prevScale);
        board.offsetY -= (action.prevCanvasHeight / 2) * (1 / nextScale - 1 / prevScale);
    });
};

type Vector2 = {
    x: number;
    y: number;
};

export const bringPanelToFront = 'bringPanelToFront';
export const editBoard = 'editBoard';
export const fix = 'fix';
export const custom = 'custom';
export const minimize = 'minimize';
export const movePanel = 'movePanel';
export const resizePanel = 'resizePanel';
export const unminimize = 'unminimize';
export const zoomBoard = 'zoomBoard';

type AnyPanel =
    | ActiveBoardPanelConfig
    | BoardEditorPanelConfig
    | CharactersPanelConfig
    | ChatPalettePanelConfig
    | GameEffectPanelConfig
    | MemoPanelConfig
    | MessagePanelConfig
    | ParticipantsPanelConfig
    | PieceValuePanelConfig
    | RollCallPanelConfig;

type ResizePanelActionResult = {
    dir: ResizeDirection;
    delta: NumberSize;
};

export type Action =
    | {
          type: typeof bringPanelToFront;
          panelType: PanelType;
          action: {
              // これは movePanelToFront には必要のないプロパティだが、もしこれがないと minimize されている panel は movePanelToFront を実行しても minimize されたままということになり直感的ではなく問題を起こす可能性があるため、minimize を解除するかどうかを明示的に指定する必要があるという仕様にしている。
              unminimizePanel: boolean;
          };
      }
    | {
          type: typeof editBoard;
          boardId: string;
          boardType: BoardType;
          action: (source: BoardConfig) => BoardConfig | void;
      }
    | { type: typeof fix }
    | {
          type: typeof custom;
          action: (source: RoomConfig) => RoomConfig | void;
      }
    | {
          type: typeof minimize;
          panelType: PanelType;
      }
    | {
          type: typeof movePanel;
          panelType: PanelType;
          action: Vector2 | ((prev: Vector2) => Vector2);
      }
    | {
          type: typeof resizePanel;
          panelType: PanelType;
          action: ResizePanelActionResult | ((prev: AnyPanel) => ResizePanelActionResult);
      }
    | {
          type: typeof unminimize;
          panelType: PanelType;
      }
    | {
          type: typeof zoomBoard;
          action: ZoomBoardAction;
      };

const reducer = (prev: RoomConfig, action: Action): RoomConfig => {
    switch (action.type) {
        case bringPanelToFront: {
            return produce(prev, state => {
                if (state == null) {
                    return;
                }
                bringPanelToFrontMutate(state, action.panelType);
                if (action.action.unminimizePanel) {
                    updatePanelMutate(state.panels, action.panelType, panel => {
                        panel.isMinimized = false;
                    });
                }
            });
        }
        case editBoard: {
            return produce(prev, state => {
                if (state == null) {
                    return;
                }
                editBoardMutate(state, action.boardId, action.boardType, action.action);
            });
        }
        case fix: {
            return produce(prev, state => {
                if (state == null) {
                    return;
                }
                fixRoomConfigMutate(state);
            });
        }
        case custom: {
            return produce(prev, action.action);
        }
        case minimize: {
            return produce(prev, state => {
                if (state == null) {
                    return;
                }
                updatePanelMutate(state.panels, action.panelType, panel => {
                    panel.isMinimized = true;
                });
            });
        }
        case movePanel: {
            return produce(prev, state => {
                if (state == null) {
                    return;
                }
                updatePanelMutate(state.panels, action.panelType, panel => {
                    const actionResult =
                        typeof action.action === 'function' ? action.action(panel) : action.action;
                    movePanelMutate(panel, actionResult);
                });
            });
        }
        case resizePanel: {
            return produce(prev, state => {
                if (state == null) {
                    return;
                }
                updatePanelMutate(state.panels, action.panelType, panel => {
                    const actionResult =
                        typeof action.action === 'function' ? action.action(panel) : action.action;
                    resizePanelMutate(panel, actionResult.dir, actionResult.delta);
                });
            });
        }
        case unminimize: {
            return produce(prev, state => {
                if (state == null) {
                    return;
                }
                updatePanelMutate(state.panels, action.panelType, panel => {
                    panel.isMinimized = false;
                });
            });
        }
        case zoomBoard: {
            return produce(prev, state => {
                if (state == null) {
                    return;
                }
                zoomBoardMutate(state, action.action);
            });
        }
    }
};

const roomConfigKey = (roomId: string) => `room@${roomId}`;

const tryGetRoomConfig = async (roomId: string) => {
    const raw = await localforage.getItem(roomConfigKey(roomId));
    if (typeof raw !== 'string') {
        return undefined;
    }
    const json = tryParseJSON(raw);
    const result = serializedRoomConfig.passthrough().safeParse(json);
    if (result.success) {
        return result.data;
    }
    return undefined;
};

const getRoomConfig = async (roomId: string) => {
    const result = await tryGetRoomConfig(roomId);
    if (result == null) {
        return defaultRoomConfig(roomId);
    }
    return deserializeRoomConfig(result, roomId);
};

let mockRoomConfig: RoomConfig | null = null;
/** これを non-null にすると、`roomConfigAtomFamily` が mock モードになり、roomId が何かに関わらず setMockRoomConfig で渡した値が `roomConfigAtomFamily` の子の atom の初期値になります。roomId によって異なる初期値にする機能は現時点で需要がないと思われるため実装していません。 */
export const setMockRoomConfig = (value: RoomConfig | null) => {
    mockRoomConfig = value;
};

export const roomConfigAtomFamily = atomFamily((roomId: string) => {
    if (mockRoomConfig != null) {
        const baseAtom = atom(mockRoomConfig);
        return atom(
            get => Promise.resolve(get(baseAtom)),
            (get, set, action: Action) => {
                set(baseAtom, reducer(get(baseAtom), action));
            },
        );
    }
    return atomWithDebounceStorage({
        getItemFromStorage: () => getRoomConfig(roomId),
        setItemToStorage: async (newValue: RoomConfig) => {
            // RoomConfigを安全にSerializedRoomConfigへ型変換できない場合、decodeができなくなってしまう。それを防ぐため、ここで安全に型変換できるかどうかチェックしている。
            const serializedNewValue: SerializedRoomConfig = newValue;
            await localforage.setItem(roomConfigKey(roomId), JSON.stringify(serializedNewValue));
        },
        atomSet: reducer,
    });
});
