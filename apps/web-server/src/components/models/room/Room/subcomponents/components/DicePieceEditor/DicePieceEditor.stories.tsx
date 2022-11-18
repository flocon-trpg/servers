import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { DicePieceEditor } from './DicePieceEditor';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { defaultBoardId, dicePieceKey1 } from '@/mocks';

export const Update: React.FC = () => {
    const { isInitialized } = useSetupStorybook();
    if (!isInitialized) {
        return <div />;
    }
    return <DicePieceEditor updateMode={{ boardId: defaultBoardId, pieceId: dicePieceKey1 }} />;
};

export default {
    title: 'models/room/Room/DicePieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
