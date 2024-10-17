import { ParticipantRole } from '@flocon-trpg/core';
import { useSetAtom } from 'jotai/react';
import React from 'react';
import { CharacterEditorModal, characterEditorModalAtom } from './CharacterEditorModal';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { anotherPlayerCharacterId1, myRichCharacterId, mySimpleCharacterId } from '@/mocks';
import { Meta, StoryObj } from '@storybook/react';

export const Player: React.FC<{ myParticipantRole: ParticipantRole; characterStateId: string }> = ({
    myParticipantRole,
    characterStateId,
}) => {
    const { roomClientContextValue } = useSetupStorybook({
        room: {
            myParticipantRole,
        },
    });

    const setModalState = useSetAtom(characterEditorModalAtom);
    React.useEffect(() => {
        // TODO: createモードのテストも追加する
        // TODO: selectedPieceTypeを変化させる
        setModalState({ type: 'update', stateId: characterStateId, selectedPieceType: null });
    }, [characterStateId, setModalState]);

    return (
        <StorybookProvider compact roomClientContextValue={roomClientContextValue}>
            <div>
                <CharacterEditorModal />
            </div>
        </StorybookProvider>
    );
};

const meta = {
    title: 'models/room/Room/CharacterEditorModal',
    component: Player,
    args: {
        myParticipantRole: 'Player',
        characterStateId: myRichCharacterId,
    },
} satisfies Meta<typeof Player>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Spectator: Story = {
    args: {
        myParticipantRole: 'Spectator',
    },
};

export const SimpleCharacter: Story = {
    args: {
        characterStateId: mySimpleCharacterId,
    },
};

export const AnotherPlayerCharacter: Story = {
    args: {
        characterStateId: anotherPlayerCharacterId1,
    },
};
