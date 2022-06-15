import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { useSetupMocks } from '../../../../../../../hooks/useSetupMocks';
import { defaultBoardId, stringPieceKey1 } from '../../../../../../../mocks';
import { StringPieceEditor } from './StringPieceEditor';

export const Update: React.FC = () => {
    useSetupMocks();
    return <StringPieceEditor updateMode={{ boardId: defaultBoardId, pieceId: stringPieceKey1 }} />;
};

export default {
    title: 'models/room/Room/StringPieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
