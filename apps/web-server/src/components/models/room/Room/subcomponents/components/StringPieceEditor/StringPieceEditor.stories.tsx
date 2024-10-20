import { Meta } from '@storybook/react';
import React from 'react';
import { useStringPieceEditor } from './StringPieceEditor';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
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
        <StorybookProvider compact roomClientContextValue={roomClientContextValue}>
            <Core />
        </StorybookProvider>
    );
};

const meta = {
    title: 'models/room/Room/StringPieceEditor',
    component: Update,
} satisfies Meta<typeof Update>;

export default meta;
