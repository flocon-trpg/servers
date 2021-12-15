export type BoardType =
    | { type: 'boardEditor'; boardEditorPanelId: string }
    | { type: 'activeBoardViewer'; isBackground: boolean };
