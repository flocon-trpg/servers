import { z } from 'zod';
import {
    BoardConfig,
    defaultBoardConfig,
    deserializeBoardConfig,
    serializedBoardConfig,
} from '../boardConfig';
import { defaultActiveBoardPanelPosition } from '../defaultPanelPositions';
import {
    DraggablePanelConfigBase,
    deserializeDraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

export type ActiveBoardPanelConfig = {
    // ボードエディターとは異なり、オフセットやズーム設定は共通化しているほうが演出効果が狙えることがあるため、共通化している。
    board: BoardConfig;
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedActiveBoardPanelConfig = z
    .object({
        board: serializedBoardConfig,
        isMinimized: z.boolean(),
    })
    .partial()
    .merge(serializedDraggablePanelConfigBase);

export type SerializedActiveBoardPanelConfig = z.TypeOf<typeof serializedActiveBoardPanelConfig>;

export const deserializeActiveBoardPanelConfig = (
    source: SerializedActiveBoardPanelConfig,
): ActiveBoardPanelConfig => {
    return {
        ...deserializeDraggablePanelConfigBase(source),
        board: source.board == null ? defaultBoardConfig() : deserializeBoardConfig(source.board),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultActiveBoardPanelConfig = (): ActiveBoardPanelConfig => {
    return {
        ...defaultActiveBoardPanelPosition,
        board: defaultBoardConfig(),
    };
};
