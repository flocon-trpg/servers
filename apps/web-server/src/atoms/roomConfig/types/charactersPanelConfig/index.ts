import * as t from 'io-ts';
import {
    CharacterTabConfig,
    deserializeCharacterTabConfig,
    partialCharacterTabConfig,
} from '../characterTabConfig';
import { defaultCharactersPanelPosition } from '../defaultPanelPositions';
import {
    deserializeDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';
import { CharacterTabConfigUtils } from '../characterTabConfig/utils';

export type CharactersPanelConfig = {
    isMinimized: boolean;
    tabs: CharacterTabConfig[];
} & DraggablePanelConfigBase;

export const serializedCharactersPanelConfig = t.intersection([
    t.partial({
        isMinimized: t.boolean,
        tabs: t.array(partialCharacterTabConfig),
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
        tabs: (source.tabs ?? []).map(deserializeCharacterTabConfig),
    };
};

export const defaultCharactersPanelConfig = (): CharactersPanelConfig => {
    return {
        ...defaultCharactersPanelPosition,
        tabs: [
            {
                ...CharacterTabConfigUtils.createEmpty({}),
                showNoTag: true,
            },
            {
                ...CharacterTabConfigUtils.createEmpty({}),
                showTag1: true,
            },
            CharacterTabConfigUtils.createAll({}),
        ],
    };
};
