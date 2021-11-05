import {
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
    toCompleteDraggablePanelConfigBase,
} from './DraggablePanelConfigBase';
import * as t from 'io-ts';

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

export const toCompletePieceValuePanelConfig = (
    source: SerializedPieceValuePanelConfig
): PieceValuePanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultPieceValuePanelConfig = (): PieceValuePanelConfig => {
    return {
        x: 1000,
        y: 400,
        width: 300,
        height: 300,
        zIndex: 0,
        isMinimized: false,
    };
};
