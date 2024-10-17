import { simpleId } from '@flocon-trpg/core';
import { z } from 'zod';
import { defaultMemoPanelPosition } from '../defaultPanelPositions';
import {
    DraggablePanelConfigBase,
    deserializeDraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

export type MemoPanelConfig = {
    isMinimized: boolean;
    selectedMemoId?: string;
} & DraggablePanelConfigBase;

export const serializedMemoPanelConfig = z
    .object({
        isMinimized: z.boolean(),
        selectedMemoId: z.string(),
    })
    .partial()
    .merge(serializedDraggablePanelConfigBase);

export type SerializedMemoPanelConfig = z.TypeOf<typeof serializedMemoPanelConfig>;

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
