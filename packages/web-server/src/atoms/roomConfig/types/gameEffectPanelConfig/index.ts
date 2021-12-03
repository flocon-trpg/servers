import * as t from 'io-ts';
import { defaultGameEffectPanelPosition } from '../defaultPanelPositions';
import {
    deserializeDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

export type GameEffectPanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedGameEffectPanelConfig = t.intersection([
    t.partial({
        isMinimized: t.boolean,
    }),
    serializedDraggablePanelConfigBase,
]);

export type SerializedGameEffectPanelConfig = t.TypeOf<typeof serializedGameEffectPanelConfig>;

export const deserializeGameEffectPanelConfig = (
    source: SerializedGameEffectPanelConfig
): GameEffectPanelConfig => {
    return {
        ...deserializeDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultGameEffectPanelConfig = (): GameEffectPanelConfig => {
    return {
        ...defaultGameEffectPanelPosition,
    };
};
