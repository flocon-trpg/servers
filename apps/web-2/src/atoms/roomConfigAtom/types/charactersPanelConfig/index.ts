import { StrIndex20, strIndex20Array } from '@flocon-trpg/core';
import { z } from 'zod';
import {
    CharacterTabConfig,
    deserializeCharacterTabConfig,
    partialCharacterTabConfig,
} from '../characterTabConfig';
import { CharacterTabConfigUtils } from '../characterTabConfig/utils';
import { defaultCharactersPanelPosition } from '../defaultPanelPositions';
import {
    DraggablePanelConfigBase,
    deserializeDraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

export namespace RowKeys {
    export const EditButton = 'EditButton';
    export const TogglePrivate = 'TogglePrivate';
    export const Name = 'Name';
    export const NumParam = (index: StrIndex20) => `Num${index}`;
    export const BoolParam = (index: StrIndex20) => `Bool${index}`;
    export const StrParam = (index: StrIndex20) => `Str${index}`;
    export const all = [
        EditButton,
        TogglePrivate,
        Name,
        ...strIndex20Array.map(NumParam),
        ...strIndex20Array.map(BoolParam),
        ...strIndex20Array.map(StrParam),
    ];
    export const isNumParam = (key: string) => {
        for (const index of strIndex20Array) {
            if (key === NumParam(index)) {
                return index;
            }
        }
        return null;
    };
    export const isBoolParam = (key: string) => {
        for (const index of strIndex20Array) {
            if (key === BoolParam(index)) {
                return index;
            }
        }
        return null;
    };
    export const isStrParam = (key: string) => {
        for (const index of strIndex20Array) {
            if (key === StrParam(index)) {
                return index;
            }
        }
        return null;
    };
}

export type CharactersPanelConfig = {
    isMinimized: boolean;
    tabs: CharacterTabConfig[];

    rowKeysOrder: string[];
} & DraggablePanelConfigBase;

export const serializedCharactersPanelConfig = z
    .object({
        isMinimized: z.boolean(),
        tabs: z.array(partialCharacterTabConfig),
        rowKeysOrder: z.array(z.string()),
    })
    .partial()
    .merge(serializedDraggablePanelConfigBase);

export type SerializedCharactersPanelConfig = z.TypeOf<typeof serializedCharactersPanelConfig>;

export const deserializeCharactersPanelConfig = (
    source: SerializedCharactersPanelConfig,
): CharactersPanelConfig => {
    return {
        ...deserializeDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
        tabs: (source.tabs ?? []).map(deserializeCharacterTabConfig),
        rowKeysOrder: source.rowKeysOrder ?? RowKeys.all,
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
        rowKeysOrder: RowKeys.all,
    };
};
