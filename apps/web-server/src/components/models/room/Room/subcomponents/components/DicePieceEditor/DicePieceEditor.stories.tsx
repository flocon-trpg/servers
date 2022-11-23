import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { useDicePieceEditor } from './DicePieceEditor';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { defaultBoardId, dicePieceKey1 } from '@/mocks';

const Core: React.FC = () => {
    const dicePieceEditor = useDicePieceEditor({
        updateMode: {
            boardId: defaultBoardId,
            pieceId: dicePieceKey1,
        },
    });
    return dicePieceEditor.element;
};

export const Update: React.FC = () => {
    const { isInitialized } = useSetupStorybook();
    if (!isInitialized) {
        return <div />;
    }
    return <Core />;
};

export default {
    title: 'models/room/Room/DicePieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
