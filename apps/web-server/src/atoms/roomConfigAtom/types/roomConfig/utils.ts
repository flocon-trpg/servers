import { RoomConfig } from '.';
import { ResizeDirection } from 're-resizable';
import { recordToArray } from '@flocon-trpg/utils';
import { BoardConfig, defaultBoardConfig } from '../boardConfig';
import { BoardType } from '../../../../utils/types';

export namespace RoomConfigUtils {
    export const activeBoardPanel = 'activeBoardPanel';
    export const boardEditorPanel = 'boardEditorPanel';
    export const characterPanel = 'characterPanel';
    export const chatPalettePanel = 'chatPalettePanel';
    export const gameEffectPanel = 'gameEffectPanel';
    export const memoPanel = 'memoPanel';
    export const messagePanel = 'messagePanel';
    export const participantPanel = 'participantPanel';
    export const pieceValuePanel = 'pieceValuePanel';

    export type PanelAction =
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
          };

    export type ZoomBoardAction = {
        roomId: string;
        boardType: BoardType;
        boardId: string;
        zoomDelta: number;
        prevCanvasWidth: number;
        prevCanvasHeight: number;
    };

    const fixPosition = (position: { x: number; y: number }): void => {
        position.x = Math.max(0, position.x);
        position.y = Math.max(0, position.y);
    };

    export const fixRoomConfig = (config: RoomConfig): void => {
        fixPosition(config.panels.activeBoardPanel);
        recordToArray(config.panels.boardEditorPanels).forEach(pair => fixPosition(pair.value));
        fixPosition(config.panels.characterPanel);
        recordToArray(config.panels.chatPalettePanels).forEach(pair => fixPosition(pair.value));
        fixPosition(config.panels.gameEffectPanel);
        recordToArray(config.panels.memoPanels).forEach(pair => fixPosition(pair.value));
        recordToArray(config.panels.messagePanels).forEach(pair => fixPosition(pair.value));
        fixPosition(config.panels.participantPanel);
        fixPosition(config.panels.pieceValuePanel);
    };

    // DraggablePanelが移動できない位置に行くのを防ぐ処理。
    // Redux側ではなくUI側にこの処理を任せるとReduxとUIの独立性が高まるので一見良さそうだが、localforageからデータを読み込むときも似たような処理をしているため、もしRedux外に任せても結局Configを読み込むときにこの処理を行わなければならず、トータルで見たときの独立性は高くなっていない。そのため、Redux側でこの処理を取り扱うことにしている。
    export const movePanel = (
        state: { x: number; y: number },
        newPosition: { x: number; y: number }
    ): void => {
        state.x = newPosition.x;
        state.y = newPosition.y;
        fixPosition(state);
    };

    export const bringPanelToFront = (state: RoomConfig, action: PanelAction): void => {
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
        }
    };

    export const resizePanel = (
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
        fixPosition(state);
    };

    export const zoomBoard = (state: RoomConfig, action: ZoomBoardAction): void => {
        RoomConfigUtils.editBoard(state, action.boardId, action.boardType, board => {
            const prevZoom = board.zoom;
            const nextZoom = prevZoom + action.zoomDelta;
            const prevScale = Math.pow(2, prevZoom);
            const nextScale = Math.pow(2, nextZoom);

            board.zoom = nextZoom;
            board.offsetX -= (action.prevCanvasWidth / 2) * (1 / nextScale - 1 / prevScale);
            board.offsetY -= (action.prevCanvasHeight / 2) * (1 / nextScale - 1 / prevScale);
        });
    };

    export const editBoard = (
        state: RoomConfig,
        boardId: string,
        boardType: BoardType,
        action: (source: BoardConfig) => void
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
        action(board);
        targetPanel.boards[boardId] = board;
    };
}
