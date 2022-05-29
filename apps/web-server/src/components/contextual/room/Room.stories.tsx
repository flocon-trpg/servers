import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useSetAtom } from 'jotai';
import { Result } from '@kizahasi/result';
import { Room } from './Room';
import { WebConfig } from '../../../configType';
import { storybookAtom } from '../../../atoms/storybook/storybookAtom';
import { useRoomStub } from '../../../hooks/useRoomStub';
import { useUpdateAtom } from 'jotai/utils';
import { roomConfigAtom } from '../../../atoms/roomConfig/roomConfigAtom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { defaultRoomConfig } from '../../../atoms/roomConfig/types/roomConfig';
import {
    authData,
    generateRoomData,
    generateRoomMessagesData,
    storageData,
    userData,
    webConfigData,
} from '../../../stubObject';
import { ParticipantRole } from '@flocon-trpg/core';
import { useRoomMessagesStub } from '../../../hooks/useRoomMessages';
import { useUserConfigStub } from '../../../hooks/useUserConfigStub';

const roomId = '';

export const Player: React.FC<WebConfig & { myParticipantRole: ParticipantRole }> = ({
    isUnlistedFirebaseStorageEnabled,
    isPublicFirebaseStorageEnabled,
    myParticipantRole,
}) => {
    const setStorybook = useSetAtom(storybookAtom);
    React.useEffect(() => {
        setStorybook({
            isStorybook: true,
            stub: {
                auth: { ...authData, currentUser: userData },
                webConfig: Result.ok({
                    ...webConfigData,
                    isUnlistedFirebaseStorageEnabled,
                    isPublicFirebaseStorageEnabled,
                }),
                user: userData,
                storage: storageData,
            },
        });
    }, [isPublicFirebaseStorageEnabled, isUnlistedFirebaseStorageEnabled, setStorybook]);
    const room = React.useMemo(() => {
        return generateRoomData({
            myParticipantRole,
            setCharacterTagNames: true,
            setPublicChannelNames: true,
            setCharacters: true,
            setParamNames: true,
        });
    }, [myParticipantRole]);
    useRoomStub({ roomId, room });
    useUserConfigStub();
    const { onQuery, setToNotFetch } = useRoomMessagesStub();
    React.useEffect(() => {
        setToNotFetch();
        onQuery(generateRoomMessagesData({ setGeneralMessages: true }));
    }, [onQuery, setToNotFetch]);
    const setRoomConfig = useUpdateAtom(roomConfigAtom);
    React.useEffect(() => {
        setRoomConfig(defaultRoomConfig(roomId));
    }, [setRoomConfig]);
    return (
        <DndProvider backend={HTML5Backend}>
            <Room />
        </DndProvider>
    );
};

export default {
    title: 'Contextual/Room/Room',
    component: Player,
    args: { myParticipantRole: 'Player' },
} as ComponentMeta<typeof Player>;

const Template: ComponentStory<typeof Player> = args => <Player {...args} />;

export const Master = Template.bind({});
Master.args = {
    myParticipantRole: 'Master',
};

export const Spectator = Template.bind({});
Spectator.args = {
    myParticipantRole: 'Spectator',
};
