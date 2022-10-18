import { maybe, simpleId } from '@flocon-trpg/core';
import { chooseRecord } from '@flocon-trpg/utils';
import * as t from 'io-ts';
import { BoardConfig, deserializeBoardConfig, serializedBoardConfig } from '../boardConfig';
import { defaultBoardEditorPanelPosition } from '../defaultPanelPositions';
import {
    DraggablePanelConfigBase,
    deserializeDraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';
import { record } from '@/utils/io-ts/record';

export type BoardEditorPanelConfig = {
    activeBoardId: string | undefined;
    boards: Record<string, BoardConfig | undefined>;
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedBoardEditorPanelConfig = t.intersection([
    t.partial({
        activeBoardId: maybe(t.string),
        boards: record(t.string, serializedBoardConfig),
        isMinimized: t.boolean,
    }),
    serializedDraggablePanelConfigBase,
]);

export type SerializedBoardEditorPanelConfig = t.TypeOf<typeof serializedBoardEditorPanelConfig>;

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
