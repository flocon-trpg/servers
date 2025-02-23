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
    boardProps: Props;
    myParticipantRole: ParticipantRole;
    removeActiveBoardId: boolean;
}> = ({ boardProps, myParticipantRole, removeActiveBoardId }) => {
    const updateRoom = React.useMemo(() => {
        if (removeActiveBoardId) {
            return (room: RoomState) => {
                room.activeBoardId = undefined;
            };
        }
        return undefined;
    }, [removeActiveBoardId]);
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

const boardWidth = 800;
const boardHeight = 600;
const canvasWidth = boardWidth;
const canvasHeight = boardHeight;

const boardEditorProps: Props = {
    canvasWidth,
    canvasHeight,
    type: 'boardEditor',
    boardEditorPanelId: 'dummy-boardEditorPanelId',
    config: {
        activeBoardId: defaultBoardId,
        boards: {
            [defaultBoardId]: {
                offsetX: 0,
                offsetY: 0,
                zoom: 0,
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
        width: boardWidth,
        height: boardHeight,
        zIndex: 1,
    },
};

const activeBoardProps: Props = {
    canvasWidth,
    canvasHeight,
    type: 'activeBoard',
    isBackground: false,
    config: {
        board: {
            offsetX: 0,
            offsetY: 0,
            zoom: 0,
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
        width: boardWidth,
        height: boardHeight,
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
    args: { myParticipantRole: 'Player', boardProps: boardEditorProps, removeActiveBoardId: false },
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
        removeActiveBoardId: true,
    },
};

export const BackgroundActiveBoardNotFound: Story = {
    args: {
        boardProps: backgroundActiveBoardProps,
        removeActiveBoardId: true,
    },
};
