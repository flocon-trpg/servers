import { castToBoolean } from '../utils/cast';
import isObject from '../utils/isObject';
import {
    castToPartialDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    toCompleteDraggablePanelConfigBase,
} from './DraggablePanelConfigBase';

export type ParticipantPanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export type PartialParticipantPanelConfig = Partial<ParticipantPanelConfig>;

export const castToPartialParticipantPanelConfig = (
    source: unknown
): PartialParticipantPanelConfig | undefined => {
    if (!isObject<PartialParticipantPanelConfig>(source)) {
        return;
    }
    return {
        ...castToPartialDraggablePanelConfigBase(source),
        isMinimized: castToBoolean(source.isMinimized),
    };
};

export const toCompleteParticipantsPanelConfig = (
    source: PartialParticipantPanelConfig
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
