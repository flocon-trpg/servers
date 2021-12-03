import { simpleId } from '@flocon-trpg/core';
import * as t from 'io-ts';
import { defaultMemoPanelPosition } from '../defaultPanelPositions';
import {
    deserializeDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

export type MemoPanelConfig = {
    isMinimized: boolean;
    selectedMemoId?: string;
} & DraggablePanelConfigBase;

export const serializedMemoPanelConfig = t.intersection([
    t.partial({
        isMinimized: t.boolean,
        selectedMemoId: t.string,
    }),
    serializedDraggablePanelConfigBase,
]);

export type SerializedMemoPanelConfig = t.TypeOf<typeof serializedMemoPanelConfig>;

export const deserializeMemoPanelConfig = (source: SerializedMemoPanelConfig): MemoPanelConfig => {
    return {
        ...deserializeDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
        selectedMemoId: source.selectedMemoId,
    };
};

export const defaultMemoPanelConfig = (): MemoPanelConfig => {
    return {
        ...defaultMemoPanelPosition,
    };
};

export const defaultMemoPanelsConfig = (): Record<string, MemoPanelConfig> => {
    const result: Record<string, MemoPanelConfig> = {};
    const id = simpleId();
    result[id] = defaultMemoPanelConfig();
    return result;
};
