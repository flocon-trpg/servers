import * as t from 'io-ts';
import { defaultCharactersPanelPosition } from '../defaultPanelPositions';
import {
    deserializeDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

export type CharactersPanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedCharactersPanelConfig = t.intersection([
    t.partial({
        isMinimized: t.boolean,
    }),
    serializedDraggablePanelConfigBase,
]);

export type SerializedCharactersPanelConfig = t.TypeOf<typeof serializedCharactersPanelConfig>;

export const deserializeCharactersPanelConfig = (
    source: SerializedCharactersPanelConfig
): CharactersPanelConfig => {
    return {
        ...deserializeDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultCharactersPanelConfig = (): CharactersPanelConfig => {
    return {
        ...defaultCharactersPanelPosition,
    };
};
