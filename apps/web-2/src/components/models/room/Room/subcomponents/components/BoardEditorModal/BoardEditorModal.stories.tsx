import { ParticipantRole } from '@flocon-trpg/core';
import { useSetAtom } from 'jotai';
import React from 'react';
import { BoardEditorModal, boardEditorModalAtom } from './BoardEditorModal';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { defaultBoardId } from '@/mocks';
import { Meta } from '@storybook/react';

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

const meta = {
    title: 'models/room/Room/BoardEditorModal',
    component: Player,
    args: {
        myParticipantRole: 'Player',
    },
    parameters: {
        chromatic: { delay: 1000 },
    },
} satisfies Meta<typeof Player>;

export default meta;
