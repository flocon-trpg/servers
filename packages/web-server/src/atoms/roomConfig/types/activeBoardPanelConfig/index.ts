import * as t from 'io-ts';
import {
    BoardConfig,
    defaultBoardConfig,
    deserializeBoardConfig,
    serializedBoardConfig,
} from '../boardConfig';
import { defaultActiveBoardPanelPosition } from '../defaultPanelPositions';
import {
    deserializeDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

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

export const deserializeActiveBoardPanelConfig = (
    source: SerializedActiveBoardPanelConfig
): ActiveBoardPanelConfig => {
    return {
        ...deserializeDraggablePanelConfigBase(source),
        board: source.board == null ? defaultBoardConfig() : deserializeBoardConfig(source.board),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultActiveBoardPanelsConfig = (): ActiveBoardPanelConfig => {
    return {
        ...defaultActiveBoardPanelPosition,
        board: defaultBoardConfig(),
    };
};
