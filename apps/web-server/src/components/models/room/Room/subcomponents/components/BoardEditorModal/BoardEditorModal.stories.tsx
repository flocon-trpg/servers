import { ParticipantRole } from '@flocon-trpg/core';
import { ComponentMeta } from '@storybook/react';
import { useSetAtom } from 'jotai';
import React from 'react';
import { BoardEditorModal, boardEditorModalAtom } from './BoardEditorModal';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { defaultBoardId, myRichCharacterId } from '@/mocks';

export const Player: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
    const { isInitialized } = useSetupStorybook({
        roomConfig: {
            myParticipantRole,
        },
    });

    const setModalState = useSetAtom(boardEditorModalAtom);
    React.useEffect(() => {
        // TODO: createモードのテストも追加する
        setModalState({ type: 'update', stateId: defaultBoardId });
    }, [setModalState]);

    if (!isInitialized) {
        return <div />;
    }

    return (
        <div>
            <BoardEditorModal />
        </div>
    );
};

export default {
    title: 'models/room/Room/BoardEditorModal',
    component: Player,
    args: {
        myParticipantRole: 'Player',
        characterStateId: myRichCharacterId,
    },
} as ComponentMeta<typeof Player>;
