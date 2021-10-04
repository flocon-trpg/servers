import {
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
    toCompleteDraggablePanelConfigBase,
} from './DraggablePanelConfigBase';
import * as t from 'io-ts';

export type GameEffectPanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedGameEffectPanelConfig = t.intersection([
    t.partial({
        isMinimized: t.boolean,
    }),
    serializedDraggablePanelConfigBase,
]);

export type SerializedGameEffectPanelConfig = t.TypeOf<typeof serializedGameEffectPanelConfig>;

export const toCompleteGameEffectPanelConfig = (
    source: SerializedGameEffectPanelConfig
): GameEffectPanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultGameEffectPanelConfig = (): GameEffectPanelConfig => {
    return {
        x: 600,
        y: 400,
        width: 300,
        height: 300,
        zIndex: 0,
        isMinimized: false,
    };
};
