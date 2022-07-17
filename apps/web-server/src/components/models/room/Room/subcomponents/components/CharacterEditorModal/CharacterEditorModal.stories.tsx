import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useSetAtom } from 'jotai';
import { anotherPlayerCharacterId1, myRichCharacterId, mySimpleCharacterId } from '@/mocks';
import { ParticipantRole } from '@flocon-trpg/core';
import { CharacterEditorModal, characterEditorModalAtom } from './CharacterEditorModal';
import { useSetupMocks } from '@/hooks/useSetupMocks';
import { QueryClient, QueryClientProvider } from 'react-query';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';

export const Player: React.FC<{ myParticipantRole: ParticipantRole; characterStateId: string }> = ({
    myParticipantRole,
    characterStateId,
}) => {
    useSetupMocks({
        roomConfig: {
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
        <StorybookProvider>
            <div>
                <CharacterEditorModal />
            </div>
        </StorybookProvider>
    );
};

export default {
    title: 'models/room/Room/CharacterEditorModal',
    component: Player,
    args: {
        myParticipantRole: 'Player',
        characterStateId: myRichCharacterId,
    },
} as ComponentMeta<typeof Player>;

const Template: ComponentStory<typeof Player> = args => <Player {...args} />;

export const Spectator = Template.bind({});
Spectator.args = {
    myParticipantRole: 'Spectator',
};

export const SimpleCharacter = Template.bind({});
SimpleCharacter.args = {
    characterStateId: mySimpleCharacterId,
};

export const AnotherPlayerCharacter = Template.bind({});
AnotherPlayerCharacter.args = {
    characterStateId: anotherPlayerCharacterId1,
};
