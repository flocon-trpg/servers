import * as t from 'io-ts';
import {
    deserializeDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

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

export const deserializeParticipantsPanelConfig = (
    source: SerializedParticipantPanelConfig
): ParticipantPanelConfig => {
    return {
        ...deserializeDraggablePanelConfigBase(source),
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
