import {
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
    toCompleteDraggablePanelConfigBase,
} from './DraggablePanelConfigBase';
import * as t from 'io-ts';

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

export const toCompleteCharactersPanelConfig = (
    source: SerializedCharactersPanelConfig
): CharactersPanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultCharactersPanelConfig = (): CharactersPanelConfig => {
    return {
        x: 400,
        y: 0,
        width: 300,
        height: 300,
        zIndex: 1,
        isMinimized: false,
    };
};
