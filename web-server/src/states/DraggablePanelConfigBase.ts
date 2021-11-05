import * as t from 'io-ts';

export type DraggablePanelConfigBase = {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
};

export const serializedDraggablePanelConfigBase = t.partial({
    x: t.number,
    y: t.number,
    width: t.number,
    height: t.number,
    zIndex: t.number,
});

export type SerializedDraggablePanelConfigBase = t.TypeOf<
    typeof serializedDraggablePanelConfigBase
>;

export const toCompleteDraggablePanelConfigBase = (
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
