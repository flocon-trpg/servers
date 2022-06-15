import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { useSetupMocks } from '../../../../../../../hooks/useSetupMocks';
import { defaultBoardId, imagePieceKey1 } from '../../../../../../../mocks';
import { ImagePieceEditor } from './ImagePieceEditor';

export const Update: React.FC = () => {
    useSetupMocks();

    return <ImagePieceEditor updateMode={{ boardId: defaultBoardId, pieceId: imagePieceKey1 }} />;
};

export default {
    title: 'models/room/Room/ImagePieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
