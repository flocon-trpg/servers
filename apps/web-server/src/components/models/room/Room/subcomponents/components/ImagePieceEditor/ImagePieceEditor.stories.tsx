import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { useImagePieceEditor } from './ImagePieceEditor';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { defaultBoardId, imagePieceKey1 } from '@/mocks';

const Core: React.FC = () => {
    const imagePieceEditor = useImagePieceEditor({
        updateMode: {
            boardId: defaultBoardId,
            pieceId: imagePieceKey1,
        },
    });
    return imagePieceEditor.element;
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
    title: 'models/room/Room/ImagePieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
