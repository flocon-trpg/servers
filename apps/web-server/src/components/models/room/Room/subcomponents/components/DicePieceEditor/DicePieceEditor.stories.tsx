import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { useSetupMocks } from '../../../../../../../hooks/useSetupMocks';
import { defaultBoardId, dicePieceKey1 } from '../../../../../../../mocks';
import { DicePieceEditor } from './DicePieceEditor';

export const Update: React.FC = () => {
    useSetupMocks();
    return <DicePieceEditor updateMode={{ boardId: defaultBoardId, pieceId: dicePieceKey1 }} />;
};

export default {
    title: 'models/room/Room/DicePieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
