import {
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
    toCompleteDraggablePanelConfigBase,
} from './DraggablePanelConfigBase';
import * as t from 'io-ts';

export type ParticipantPanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedParticipantPanelConfig = t.intersection([
    t.partial({
        isMinimized: t.boolean,
    }),
    serializedDraggablePanelConfigBase,
]);

export type SerializedParticipantPanelConfig = t.TypeOf<typeof serializedParticipantPanelConfig>;

export const toCompleteParticipantsPanelConfig = (
    source: SerializedParticipantPanelConfig
): ParticipantPanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultParticipantPanelConfig = (): ParticipantPanelConfig => {
    return {
        x: 1000,
        y: 400,
        width: 300,
        height: 300,
        zIndex: 0,
        isMinimized: false,
    };
};
