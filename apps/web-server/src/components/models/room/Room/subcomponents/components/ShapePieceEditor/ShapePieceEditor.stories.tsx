import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { useSetupMocks } from '@/hooks/useSetupMocks';
import { defaultBoardId, shapePieceKey1 } from '@/mocks';
import { ShapePieceEditor } from './ShapePieceEditor';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';

export const Update: React.FC = () => {
    useSetupMocks();

    return (
        <StorybookProvider>
            <ShapePieceEditor updateMode={{ boardId: defaultBoardId, pieceId: shapePieceKey1 }} />
        </StorybookProvider>
    );
};

export default {
    title: 'models/room/Room/ShapePieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
