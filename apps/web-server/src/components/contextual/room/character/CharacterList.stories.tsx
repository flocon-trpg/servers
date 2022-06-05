import { ParticipantRole } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import produce from 'immer';
import { useSetAtom } from 'jotai';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { roomConfigAtom } from '../../../../atoms/roomConfig/roomConfigAtom';
import { defaultRoomConfig } from '../../../../atoms/roomConfig/types/roomConfig';
import { storybookAtom } from '../../../../atoms/storybook/storybookAtom';
import { useMockRoom } from '../../../../hooks/useMockRoom';
import { useMockUserConfig } from '../../../../hooks/useMockUserConfig';
import {
    createMockRoom as createMockRoomCore,
    mockAuth,
    mockStorage,
    mockUser,
    mockWebConfig,
} from '../../../../mocks';
import { CharacterList } from './CharacterList';

type StateType = 'none' | 'default';

const setMockCharacters = (
    roomState: ReturnType<typeof createMockRoomCore>,
    stateType: StateType
) => {
    switch (stateType) {
        case 'default':
            return roomState;
        case 'none':
            return produce(roomState, roomState => {
                roomState.characters = {};
            });
    }
};

const roomId = '';

export const Default: React.FC<{ stateType: StateType; myParticipantRole: ParticipantRole }> = ({
    stateType,
    myParticipantRole,
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
        const result = createMockRoomCore({
            myParticipantRole,
            setCharacterTagNames: true,
            setPublicChannelNames: true,
            setCharacters: true,
            setParamNames: true,
        });
        return setMockCharacters(result, stateType);
    }, [myParticipantRole, stateType]);
    useMockRoom({ roomId, room });
    useMockUserConfig();
    const setRoomConfig = useSetAtom(roomConfigAtom);
    React.useEffect(() => {
        setRoomConfig(defaultRoomConfig(roomId));
    }, [setRoomConfig]);
    return (
        <DndProvider backend={HTML5Backend}>
            <CharacterList />
        </DndProvider>
    );
};

export default {
    title: 'Contextual/Room/CharacterList',
    component: Default,
    args: { myParticipantRole: 'Player', stateType: 'default' },
} as ComponentMeta<typeof Default>;

const Template: ComponentStory<typeof Default> = args => <Default {...args} />;

export const Empty = Template.bind({});
Empty.args = {
    stateType: 'none',
};
