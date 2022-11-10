import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { ImagePieceEditor } from './ImagePieceEditor';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupMocks } from '@/hooks/useSetupMocks';
import { defaultBoardId, imagePieceKey1 } from '@/mocks';

export const Update: React.FC = () => {
    useSetupMocks();

    return (
        <StorybookProvider waitForRoomClient>
            <ImagePieceEditor updateMode={{ boardId: defaultBoardId, pieceId: imagePieceKey1 }} />
        </StorybookProvider>
    );
};

export default {
    title: 'models/room/Room/ImagePieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
