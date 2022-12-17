import { DraggablePanelConfigBase } from './draggablePanelConfig';

const xRatio = 30;
const yRatio = 30;

type PanelPosition = DraggablePanelConfigBase & { isMinimized: boolean };

export const defaultPieceValuePanelPosition: PanelPosition = {
    x: 0,
    y: 0,
    width: 400,
    height: 400,
    zIndex: 0,
    isMinimized: false,
};

export const defaultRollCallPanelPosition: PanelPosition = {
    x: xRatio * 1,
    y: yRatio * 1,
    width: 400,
    height: 350,
    zIndex: 1,
    isMinimized: false,
};

export const defaultParticipantsPanelPosition: PanelPosition = {
    x: xRatio * 2,
    y: yRatio * 2,
    width: 400,
    height: 400,
    zIndex: 2,
    isMinimized: false,
};

export const defaultChatPalettePanelPosition: PanelPosition = {
    x: xRatio * 3,
    y: yRatio * 3,
    width: 600,
    height: 700,
    zIndex: 3,
    isMinimized: false,
};

export const defaultGameEffectPanelPosition: PanelPosition = {
    x: xRatio * 4,
    y: yRatio * 4,
    width: 450,
    height: 550,
    zIndex: 4,
    isMinimized: false,
};

export const defaultMemoPanelPosition: PanelPosition = {
    x: xRatio * 5,
    y: yRatio * 5,
    width: 500,
    height: 400,
    zIndex: 5,
    isMinimized: false,
};

export const defaultCharactersPanelPosition: PanelPosition = {
    x: xRatio * 6,
    y: yRatio * 6,
    width: 800,
    height: 450,
    zIndex: 6,
    isMinimized: false,
};

export const defaultBoardEditorPanelPosition: PanelPosition = {
    x: xRatio * 7,
    y: yRatio * 7,
    width: 800,
    height: 600,
    zIndex: 7,
    isMinimized: false,
};

export const defaultMessagePanelPosition: PanelPosition = {
    x: xRatio * 8,
    y: yRatio * 8,
    width: 600,
    height: 600,
    zIndex: 8,
    isMinimized: false,
};

export const defaultActiveBoardPanelPosition: PanelPosition = {
    x: xRatio * 9,
    y: yRatio * 9,
    width: 800,
    height: 600,
    zIndex: 9,
    isMinimized: true,
};
