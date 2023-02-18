import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { useStringPieceEditor } from './StringPieceEditor';
import { RoomClientContext } from '@/contexts/RoomClientContext';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { defaultBoardId, stringPieceKey1 } from '@/mocks';

const Core: React.FC = () => {
    const stringPieceEditor = useStringPieceEditor({
        updateMode: {
            boardId: defaultBoardId,
            pieceId: stringPieceKey1,
        },
    });
    return stringPieceEditor.element;
};

export const Update: React.FC = () => {
    const { roomClientContextValue } = useSetupStorybook();
    return (
        <RoomClientContext.Provider value={roomClientContextValue}>
            <Core />
        </RoomClientContext.Provider>
    );
};

export default {
    title: 'models/room/Room/StringPieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
