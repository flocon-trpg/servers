import { maybe, simpleId } from '@flocon-trpg/core';
import { chooseRecord } from '@flocon-trpg/utils';
import * as t from 'io-ts';
import { record } from '../../../../utils/io-ts/record';
import { BoardConfig, deserializeBoardConfig, serializedBoardConfig } from '../boardConfig';
import {
    deserializeDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

export type BoardEditorPanelConfig = {
    activeBoardKey: string | null;
    boards: Record<string, BoardConfig | undefined>;
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedBoardEditorPanelConfig = t.intersection([
    t.partial({
        activeBoardKey: maybe(t.string),
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
        activeBoardKey: source.activeBoardKey ?? null,
        boards: chooseRecord(source.boards ?? {}, deserializeBoardConfig),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultBoardEditorPanelsConfig = (): Record<string, BoardEditorPanelConfig> => {
    const config: BoardEditorPanelConfig = {
        x: 50,
        y: 50,
        width: 400,
        height: 400,
        zIndex: 0,
        activeBoardKey: null,
        boards: {},
        isMinimized: false,
    };
    const result: Record<string, BoardEditorPanelConfig> = {};
    const id = simpleId();
    result[id] = config;
    return result;
};
