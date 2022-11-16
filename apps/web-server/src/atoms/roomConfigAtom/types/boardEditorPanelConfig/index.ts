import { maybe, simpleId } from '@flocon-trpg/core';
import { chooseRecord } from '@flocon-trpg/utils';
import { z } from 'zod';
import { BoardConfig, deserializeBoardConfig, serializedBoardConfig } from '../boardConfig';
import { defaultBoardEditorPanelPosition } from '../defaultPanelPositions';
import {
    DraggablePanelConfigBase,
    deserializeDraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';
import { record } from '@/utils/zod/record';

export type BoardEditorPanelConfig = {
    activeBoardId: string | undefined;
    boards: Record<string, BoardConfig | undefined>;
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedBoardEditorPanelConfig = z
    .object({
        activeBoardId: maybe(z.string()),
        boards: record(serializedBoardConfig),
        isMinimized: z.boolean(),
    })
    .partial()
    .merge(serializedDraggablePanelConfigBase);

export type SerializedBoardEditorPanelConfig = z.TypeOf<typeof serializedBoardEditorPanelConfig>;

export const deserializeBoardEditorPanelConfig = (
    source: SerializedBoardEditorPanelConfig
): BoardEditorPanelConfig => {
    return {
        ...deserializeDraggablePanelConfigBase(source),
        activeBoardId: source.activeBoardId ?? undefined,
        boards: chooseRecord(source.boards ?? {}, deserializeBoardConfig),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultBoardEditorPanelsConfig = (): Record<string, BoardEditorPanelConfig> => {
    const config: BoardEditorPanelConfig = {
        ...defaultBoardEditorPanelPosition,
        activeBoardId: undefined,
        boards: {},
    };
    const result: Record<string, BoardEditorPanelConfig> = {};
    const id = simpleId();
    result[id] = config;
    return result;
};
