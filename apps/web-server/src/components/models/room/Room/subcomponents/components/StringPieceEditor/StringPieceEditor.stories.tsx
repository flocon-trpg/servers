import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { StringPieceEditor } from './StringPieceEditor';
import { useSetupMocks } from '@/hooks/useSetupMocks';
import { defaultBoardId, stringPieceKey1 } from '@/mocks';

export const Update: React.FC = () => {
    const { isInitialized } = useSetupMocks();
    if (!isInitialized) {
        return null;
    }
    return <StringPieceEditor updateMode={{ boardId: defaultBoardId, pieceId: stringPieceKey1 }} />;
};

export default {
    title: 'models/room/Room/StringPieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
