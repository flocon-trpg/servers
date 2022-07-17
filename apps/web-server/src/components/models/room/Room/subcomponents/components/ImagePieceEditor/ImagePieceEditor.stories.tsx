import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { useSetupMocks } from '@/hooks/useSetupMocks';
import { defaultBoardId, imagePieceKey1 } from '@/mocks';
import { ImagePieceEditor } from './ImagePieceEditor';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';

export const Update: React.FC = () => {
    useSetupMocks();

    return (
        <StorybookProvider>
            <ImagePieceEditor updateMode={{ boardId: defaultBoardId, pieceId: imagePieceKey1 }} />
        </StorybookProvider>
    );
};

export default {
    title: 'models/room/Room/ImagePieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
