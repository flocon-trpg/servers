import { ParticipantRole } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import produce from 'immer';
import { useSetAtom } from 'jotai';
import React from 'react';
import { roomConfigAtom } from '../../../../../../atoms/roomConfig/roomConfigAtom';
import { defaultRoomConfig } from '../../../../../../atoms/roomConfig/types/roomConfig';
import { storybookAtom } from '../../../../../../atoms/storybook/storybookAtom';
import { useMockRoom } from '../../../../../../hooks/useMockRoom';
import { useMockUserConfig } from '../../../../../../hooks/useMockUserConfig';
import {
    createMockRoom,
    defaultBoardId,
    mockAuth,
    mockStorage,
    mockUser,
    mockWebConfig,
} from '../../../../../../mocks';
import { Board, Props } from './Board';

const roomId = '';

export const Default: React.FC<{
    myParticipantRole: ParticipantRole;
    boardProps: Props;
    removeActiveBoard: boolean;
}> = ({ boardProps, myParticipantRole, removeActiveBoard }) => {
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
        const result = createMockRoom({
            myParticipantRole,
            setCharacterTagNames: true,
            setPublicChannelNames: true,
            setBoards: true,
            setCharacters: true,
            setParamNames: true,
        });
        if (removeActiveBoard) {
            return produce(result, result => {
                result.activeBoardId = undefined;
            });
        }
        return result;
    }, [myParticipantRole, removeActiveBoard]);
    useMockRoom({ roomId, room });
    useMockUserConfig();
    const setRoomConfig = useSetAtom(roomConfigAtom);
    React.useEffect(() => {
        setRoomConfig(defaultRoomConfig(roomId));
    }, [setRoomConfig]);
    return <Board {...boardProps} />;
};

const boardEditorProps: Props = {
    canvasWidth: 500,
    canvasHeight: 400,
    type: 'boardEditor',
    boardEditorPanelId: 'dummy-boardEditorPanelId',
    config: {
        activeBoardId: defaultBoardId,
        boards: {
            [defaultBoardId]: {
                offsetX: 0,
                offsetY: 0,
                zoom: 1,
                showGrid: true,
                gridLineTension: 1,
                gridLineColor: 'red',
            },
        },
        isMinimized: false,
        x: 0,
        y: 0,
        width: 500,
        height: 400,
        zIndex: 1,
    },
};

const activeBoardProps: Props = {
    canvasWidth: 500,
    canvasHeight: 400,
    type: 'activeBoard',
    isBackground: false,
    config: {
        board: {
            offsetX: 0,
            offsetY: 0,
            zoom: 1,
            showGrid: true,
            gridLineTension: 1,
            gridLineColor: 'red',
        },
        isMinimized: false,
        x: 0,
        y: 0,
        width: 500,
        height: 400,
        zIndex: 1,
    },
};

const backgroundActiveBoardProps: Props = {
    ...activeBoardProps,
    isBackground: true,
};

export default {
    title: 'models/room/Room/Board',
    component: Default,
    args: { myParticipantRole: 'Player', boardProps: boardEditorProps, setActiveBoard: false },
} as ComponentMeta<typeof Default>;

const Template: ComponentStory<typeof Default> = args => <Default {...args} />;

export const Spectator = Template.bind({});
Spectator.args = {
    myParticipantRole: 'Spectator',
};

export const ActiveBoard = Template.bind({});
ActiveBoard.args = {
    boardProps: activeBoardProps,
};

export const BackgroundActiveBoard = Template.bind({});
BackgroundActiveBoard.args = {
    boardProps: backgroundActiveBoardProps,
};

export const ActiveBoardNotFound = Template.bind({});
ActiveBoardNotFound.args = {
    boardProps: activeBoardProps,
    removeActiveBoard: true,
};

export const BackgroundActiveBoardNotFound = Template.bind({});
BackgroundActiveBoardNotFound.args = {
    boardProps: backgroundActiveBoardProps,
    removeActiveBoard: true,
};
