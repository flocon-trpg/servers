import {
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
    toCompleteDraggablePanelConfigBase,
} from './DraggablePanelConfigBase';
import * as generators from '../utils/generators';
import { BoardConfig, serializedBoardConfig, toCompleteBoardConfig } from './BoardConfig';
import { chooseRecord } from '@kizahasi/util';
import * as t from 'io-ts';
import { maybe } from '@kizahasi/flocon-core';
import { record } from '../utils/io-ts/record';

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

export const toCompleteBoardEditorPanelConfig = (
    source: SerializedBoardEditorPanelConfig
): BoardEditorPanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        activeBoardKey: source.activeBoardKey ?? null,
        boards: chooseRecord(source.boards ?? {}, toCompleteBoardConfig),
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
    const id = generators.simpleId();
    result[id] = config;
    return result;
};
