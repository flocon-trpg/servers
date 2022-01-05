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
import { StrIndex20, strIndex20Array } from '@flocon-trpg/core';

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

export const serializedCharactersPanelConfig = t.intersection([
    t.partial({
        isMinimized: t.boolean,
        tabs: t.array(partialCharacterTabConfig),
        rowKeysOrder: t.array(t.string),
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
