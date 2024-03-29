import { ParticipantRole } from '@flocon-trpg/core';
import { ComponentMeta } from '@storybook/react';
import { useSetAtom } from 'jotai';
import React from 'react';
import { BoardEditorModal, boardEditorModalAtom } from './BoardEditorModal';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { defaultBoardId, myRichCharacterId } from '@/mocks';

export const Player: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
    const { roomClientContextValue } = useSetupStorybook({
        room: {
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
            <StorybookProvider compact roomClientContextValue={roomClientContextValue}>
                <BoardEditorModal />
            </StorybookProvider>
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
    parameters: {
        chromatic: { delay: 1000 },
    },
} as ComponentMeta<typeof Player>;
