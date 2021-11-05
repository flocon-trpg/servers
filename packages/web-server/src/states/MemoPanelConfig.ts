import {
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
    toCompleteDraggablePanelConfigBase,
} from './DraggablePanelConfigBase';
import * as t from 'io-ts';
import { simpleId } from '@kizahasi/flocon-core';

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

export const toCompleteMemoPanelConfig = (source: SerializedMemoPanelConfig): MemoPanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
        selectedMemoId: source.selectedMemoId,
    };
};

export const defaultMemoPanelConfig = (): MemoPanelConfig => {
    return {
        x: 0,
        y: 400,
        width: 300,
        height: 300,
        zIndex: 0,
        isMinimized: false,
    };
};

export const defaultMemoPanelsConfig = (): Record<string, MemoPanelConfig> => {
    const result: Record<string, MemoPanelConfig> = {};
    const id = simpleId();
    result[id] = defaultMemoPanelConfig();
    return result;
};
