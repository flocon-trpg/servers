import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { useSetAtom } from 'jotai';
import { defaultBoardId, myRichCharacterId } from '@/mocks';
import { ParticipantRole } from '@flocon-trpg/core';
import { useSetupMocks } from '@/hooks/useSetupMocks';
import { BoardEditorModal, boardEditorModalAtom } from './BoardEditorModal';

export const Player: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
    useSetupMocks({
        roomConfig: {
            myParticipantRole,
        },
    });

    const setModalState = useSetAtom(boardEditorModalAtom);
    React.useEffect(() => {
        // TODO: createモードのテストも追加する
        setModalState({ type: 'update', stateId: defaultBoardId });
    }, [setModalState]);

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
