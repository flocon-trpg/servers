import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { StringPieceEditor } from './StringPieceEditor';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { defaultBoardId, stringPieceKey1 } from '@/mocks';

export const Update: React.FC = () => {
    const { isInitialized } = useSetupStorybook();
    if (!isInitialized) {
        return <div />;
    }
    return <StringPieceEditor updateMode={{ boardId: defaultBoardId, pieceId: stringPieceKey1 }} />;
};

export default {
    title: 'models/room/Room/StringPieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
