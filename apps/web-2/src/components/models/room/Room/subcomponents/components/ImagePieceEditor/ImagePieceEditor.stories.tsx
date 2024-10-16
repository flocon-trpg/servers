import React from 'react';
import { useImagePieceEditor } from './ImagePieceEditor';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { defaultBoardId, imagePieceKey1 } from '@/mocks';
import { Meta } from '@storybook/react';

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
    const { roomClientContextValue } = useSetupStorybook();
    return (
        <StorybookProvider compact roomClientContextValue={roomClientContextValue}>
            <Core />
        </StorybookProvider>
    );
};

const meta = {
    title: 'models/room/Room/ImagePieceEditor',
    component: Update,
} satisfies Meta<typeof Update>;

export default meta;