import { ParticipantRole, State as S, roomTemplate } from '@flocon-trpg/core';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Board, Props } from './Board';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { defaultBoardId } from '@/mocks';
import { createMockUrqlClientForLayout } from '@/mocks/createMockUrqlClientForLayout';

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
    const { roomClientContextValue } = useSetupStorybook({
        room: {
            myParticipantRole,
            update: updateRoom,
        },
    });
    const mockUrqlClient = React.useRef(createMockUrqlClientForLayout());
    return (
        <StorybookProvider
            compact
            roomClientContextValue={roomClientContextValue}
            urqlClient={mockUrqlClient.current}
        >
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
                showCharacterPieceLabel: true,
                showDicePieceLabel: true,
                showImagePieceLabel: true,
                showPortraitPieceLabel: true,
                showShapePieceLabel: true,
                showStringPieceLabel: true,
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
            showCharacterPieceLabel: true,
            showDicePieceLabel: true,
            showImagePieceLabel: true,
            showPortraitPieceLabel: true,
            showShapePieceLabel: true,
            showStringPieceLabel: true,
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

const meta = {
    title: 'models/room/Room/Board',
    component: Default,
    args: { myParticipantRole: 'Player', boardProps: boardEditorProps, removeActiveBoard: true },
    parameters: {
        chromatic: { delay: 1000 },
    },
} satisfies Meta<typeof Default>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Spectator: Story = {
    args: {
        ...meta.args,
        myParticipantRole: 'Spectator',
    },
};

export const ActiveBoard: Story = {
    args: {
        boardProps: activeBoardProps,
    },
};

export const BackgroundActiveBoard: Story = {
    args: {
        boardProps: backgroundActiveBoardProps,
    },
};

export const ActiveBoardNotFound: Story = {
    args: {
        boardProps: activeBoardProps,
        removeActiveBoard: true,
    },
};

export const BackgroundActiveBoardNotFound: Story = {
    args: {
        boardProps: backgroundActiveBoardProps,
        removeActiveBoard: true,
    },
};
