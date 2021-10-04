import {
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
    toCompleteDraggablePanelConfigBase,
} from './DraggablePanelConfigBase';
import {
    BoardConfig,
    defaultBoardConfig,
    serializedBoardConfig,
    toCompleteBoardConfig,
} from './BoardConfig';
import * as t from 'io-ts';

export type ActiveBoardPanelConfig = {
    // ボードエディターとは異なり、オフセットやズーム設定は共通化しているほうが演出効果が狙えることがあるため、共通化している。
    board: BoardConfig;
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedActiveBoardPanelConfig = t.intersection([
    t.partial({
        board: serializedBoardConfig,
        isMinimized: t.boolean,
    }),
    serializedDraggablePanelConfigBase,
]);

export type SerializedActiveBoardPanelConfig = t.TypeOf<typeof serializedActiveBoardPanelConfig>;

export const toCompleteActiveBoardPanelConfig = (
    source: SerializedActiveBoardPanelConfig
): ActiveBoardPanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        board: source.board == null ? defaultBoardConfig() : toCompleteBoardConfig(source.board),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultActiveBoardPanelsConfig = (): ActiveBoardPanelConfig => {
    return {
        board: defaultBoardConfig(),
        x: 0,
        y: 0,
        width: 400,
        height: 400,
        zIndex: 0,
        isMinimized: false,
    };
};
