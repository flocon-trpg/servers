import React from 'react';
import { useDicePieceEditor } from './DicePieceEditor';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { defaultBoardId, dicePieceKey1 } from '@/mocks';
import { Meta } from '@storybook/react';

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
        <StorybookProvider compact roomClientContextValue={roomClientContextValue}>
            <Core />
        </StorybookProvider>
    );
};

const meta = {
    title: 'models/room/Room/DicePieceEditor',
    component: Update,
} satisfies Meta<typeof Update>;

export default meta;
