export type DraggablePanelConfigBase = {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
};
import { z } from 'zod';

export const serializedDraggablePanelConfigBase = z
    .object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        zIndex: z.number(),
    })
    .partial();

export type SerializedDraggablePanelConfigBase = z.TypeOf<
    typeof serializedDraggablePanelConfigBase
>;

export const deserializeDraggablePanelConfigBase = (
    source: SerializedDraggablePanelConfigBase
): DraggablePanelConfigBase => {
    return {
        x: source.x ?? 0,
        y: source.y ?? 0,
        width: source.width ?? 300,
        height: source.height ?? 300,
        zIndex: source.zIndex ?? 0,
    };
};
