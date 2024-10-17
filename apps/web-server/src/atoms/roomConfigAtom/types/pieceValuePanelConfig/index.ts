import { z } from 'zod';
import { defaultPieceValuePanelPosition } from '../defaultPanelPositions';
import {
    DraggablePanelConfigBase,
    deserializeDraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

export type PieceValuePanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedPieceValuePanelConfig = z
    .object({
        isMinimized: z.boolean(),
    })
    .partial()
    .merge(serializedDraggablePanelConfigBase);

export type SerializedPieceValuePanelConfig = z.TypeOf<typeof serializedPieceValuePanelConfig>;

export const deserializePieceValuePanelConfig = (
    source: SerializedPieceValuePanelConfig,
): PieceValuePanelConfig => {
    return {
        ...deserializeDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultPieceValuePanelConfig = (): PieceValuePanelConfig => {
    return {
        ...defaultPieceValuePanelPosition,
    };
};
