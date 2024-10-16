import { z } from 'zod';

export type BoardConfig = {
    offsetX: number;
    offsetY: number;
    // ズーム倍率 = 2^zoom
    zoom: number;
    showGrid: boolean;
    gridLineTension: number;
    gridLineColor: string;
    showCharacterPieceLabel: boolean;
    showDicePieceLabel: boolean;
    showImagePieceLabel: boolean;
    showPortraitPieceLabel: boolean;
    showShapePieceLabel: boolean;
    showStringPieceLabel: boolean;
};

export const serializedBoardConfig = z
    .object({
        offsetX: z.number(),
        offsetY: z.number(),
        zoom: z.number(),
        showGrid: z.boolean(),
        gridLineTension: z.number(),
        gridLineColor: z.string(),
        showCharacterPieceLabel: z.boolean(),
        showDicePieceLabel: z.boolean(),
        showImagePieceLabel: z.boolean(),
        showPortraitPieceLabel: z.boolean(),
        showShapePieceLabel: z.boolean(),
        showStringPieceLabel: z.boolean(),
    })
    .partial();

export type SerializedBoardConfig = z.TypeOf<typeof serializedBoardConfig>;

export const deserializeBoardConfig = (source: SerializedBoardConfig): BoardConfig => {
    return {
        offsetX: source.offsetX ?? 0,
        offsetY: source.offsetY ?? 0,
        zoom: source.zoom ?? 1,
        showGrid: source.showGrid ?? false,
        gridLineTension: source.gridLineTension ?? 1,
        gridLineColor: source.gridLineColor ?? 'rgba(0, 0, 0, 1)',
        showCharacterPieceLabel: source.showCharacterPieceLabel ?? true,
        showDicePieceLabel: source.showDicePieceLabel ?? true,
        showImagePieceLabel: source.showImagePieceLabel ?? true,
        showPortraitPieceLabel: source.showPortraitPieceLabel ?? true,
        showShapePieceLabel: source.showShapePieceLabel ?? true,
        showStringPieceLabel: source.showStringPieceLabel ?? true,
    };
};

export const defaultBoardConfig = (): BoardConfig => ({
    offsetX: 0,
    offsetY: 0,
    zoom: 0,
    showGrid: false,
    gridLineTension: 1,
    gridLineColor: 'rgba(0, 0, 0, 1)',
    showCharacterPieceLabel: true,
    showDicePieceLabel: true,
    showImagePieceLabel: true,
    showPortraitPieceLabel: true,
    showShapePieceLabel: true,
    showStringPieceLabel: true,
});
