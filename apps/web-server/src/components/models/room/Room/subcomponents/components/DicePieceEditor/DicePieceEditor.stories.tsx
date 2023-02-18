import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { useDicePieceEditor } from './DicePieceEditor';
import { RoomClientContext } from '@/contexts/RoomClientContext';
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
    const { roomClientContextValue } = useSetupStorybook();
    return (
        <RoomClientContext.Provider value={roomClientContextValue}>
            {' '}
            <Core />
        </RoomClientContext.Provider>
    );
};

export default {
    title: 'models/room/Room/DicePieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
