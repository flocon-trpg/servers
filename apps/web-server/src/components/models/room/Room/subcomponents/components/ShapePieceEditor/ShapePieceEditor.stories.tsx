import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { useShapePieceEditor } from './ShapePieceEditor';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { defaultBoardId, shapePieceKey1 } from '@/mocks';

const Core: React.FC = () => {
    const shapePieceEditor = useShapePieceEditor({
        updateMode: {
            boardId: defaultBoardId,
            pieceId: shapePieceKey1,
        },
    });
    return shapePieceEditor.element;
};

export const Update: React.FC = () => {
    const { isInitialized } = useSetupStorybook();
    if (!isInitialized) {
        return <div />;
    }
    return (
        <StorybookProvider waitForRoomClient>
            <Core />
        </StorybookProvider>
    );
};

export default {
    title: 'models/room/Room/ShapePieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
