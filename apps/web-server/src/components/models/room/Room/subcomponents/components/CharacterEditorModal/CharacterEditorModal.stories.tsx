import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useSetAtom } from 'jotai';
import { storybookAtom } from '../../../../../../../atoms/storybookAtom/storybookAtom';
import { useMockRoom } from '../../../../../../../hooks/useMockRoom';
import { defaultRoomConfig } from '../../../../../../../atoms/roomConfigAtom/types/roomConfig';
import { roomConfigAtom } from '../../../../../../../atoms/roomConfigAtom/roomConfigAtom';
import {
    anotherPlayerCharacterId1,
    createMockRoom,
    mockAuth,
    mockStorage,
    mockUser,
    mockWebConfig,
    myRichCharacterId,
    mySimpleCharacterId,
} from '../../../../../../../mocks';
import { ParticipantRole } from '@flocon-trpg/core';
import { CharacterEditorModal, characterEditorModalAtom } from './CharacterEditorModal';
import { Result } from '@kizahasi/result';

const roomId = '';

export const Player: React.FC<{ myParticipantRole: ParticipantRole; characterStateId: string }> = ({
    myParticipantRole,
    characterStateId,
}) => {
    const setStorybook = useSetAtom(storybookAtom);
    React.useEffect(() => {
        setStorybook({
            isStorybook: true,
            mock: {
                auth: { ...mockAuth, currentUser: mockUser },
                webConfig: Result.ok(mockWebConfig),
                user: mockUser,
                storage: mockStorage,
            },
        });
    }, [setStorybook]);
    const room = React.useMemo(() => {
        return createMockRoom({
            myParticipantRole,
            setCharacterTagNames: true,
            setPublicChannelNames: true,
            setBoards: true,
            setCharacters: true,
            setParamNames: true,
        });
    }, [myParticipantRole]);
    useMockRoom({ roomId, room });
    const setRoomConfig = useSetAtom(roomConfigAtom);
    const roomConfig = React.useMemo(() => defaultRoomConfig(roomId), []);
    React.useEffect(() => {
        setRoomConfig(roomConfig);
    }, [roomConfig, setRoomConfig]);

    const setModalState = useSetAtom(characterEditorModalAtom);
    React.useEffect(() => {
        setModalState({ type: 'update', stateId: characterStateId });
    }, [characterStateId, setModalState]);

    return (
        <div>
            <CharacterEditorModal />
        </div>
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
