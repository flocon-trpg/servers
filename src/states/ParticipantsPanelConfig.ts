import { castToBoolean } from '../utils/cast';
import isObject from '../utils/isObject';
import { castToPartialDraggablePanelConfigBase, DraggablePanelConfigBase, toCompleteDraggablePanelConfigBase } from './DraggablePanelConfigBase';

export type ParticipantsPanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase

export type PartialParticipantsPanelConfig = Partial<ParticipantsPanelConfig>;

export const castToPartialParticipantsPanelConfig = (source: unknown): PartialParticipantsPanelConfig | undefined => {
    if (!isObject<PartialParticipantsPanelConfig>(source)) {
        return;
    }
    return {
        ...castToPartialDraggablePanelConfigBase(source),
        isMinimized: castToBoolean(source.isMinimized),
    };
};

export const toCompleteParticipantsPanelConfig = (source: PartialParticipantsPanelConfig): ParticipantsPanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultParticipantsPanelConfig = (): ParticipantsPanelConfig => {
    return {
        x: 1000,
        y: 400,
        width: 300,
        height: 300,
        zIndex: 0,
        isMinimized: false,
    };
};

