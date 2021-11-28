import * as t from 'io-ts';
import { defaultPieceValuePanelPosition } from '../defaultPanelPositions';
import {
    deserializeDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

export type PieceValuePanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedPieceValuePanelConfig = t.intersection([
    t.partial({
        isMinimized: t.boolean,
    }),
    serializedDraggablePanelConfigBase,
]);

export type SerializedPieceValuePanelConfig = t.TypeOf<typeof serializedPieceValuePanelConfig>;

export const deserializePieceValuePanelConfig = (
    source: SerializedPieceValuePanelConfig
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
