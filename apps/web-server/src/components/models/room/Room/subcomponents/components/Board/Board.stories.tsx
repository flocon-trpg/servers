import { ParticipantRole, State as S, roomTemplate } from '@flocon-trpg/core';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { Board, Props } from './Board';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { defaultBoardId } from '@/mocks';

type RoomState = S<typeof roomTemplate>;

export const Default: React.FC<{
    myParticipantRole: ParticipantRole;
    boardProps: Props;
    removeActiveBoard: boolean;
}> = ({ boardProps, myParticipantRole, removeActiveBoard }) => {
    const updateRoom = React.useMemo(() => {
        if (removeActiveBoard) {
            return (room: RoomState) => {
                room.activeBoardId = undefined;
            };
        }
        return undefined;
    }, [removeActiveBoard]);
    useSetupStorybook({
        roomConfig: {
            myParticipantRole,
            update: updateRoom,
        },
    });
    return (
        <StorybookProvider waitForRoomClient>
            <Board {...boardProps} />
        </StorybookProvider>
    );
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
