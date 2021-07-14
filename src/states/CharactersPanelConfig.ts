import * as Room from '../stateManagers/states/room';
import isObject from '../utils/isObject';
import {
    castToPartialDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    toCompleteDraggablePanelConfigBase,
} from './DraggablePanelConfigBase';

export type CharactersPanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export type PartialCharactersPanelConfig = Partial<CharactersPanelConfig>;

export const castToPartialCharactersPanelConfig = (
    source: unknown
): PartialCharactersPanelConfig | undefined => {
    if (!isObject<PartialCharactersPanelConfig>(source)) {
        return;
    }
    return castToPartialDraggablePanelConfigBase(source);
};

export const toCompleteCharactersPanelConfig = (
    source: PartialCharactersPanelConfig
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
