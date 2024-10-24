import { Meta } from '@storybook/react';
import React from 'react';
import { MemosPanelContent } from './MemosPanelContent';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';

export const Default: React.FC<{ width?: number }> = ({ width }) => {
    const { roomClientContextValue } = useSetupStorybook({
        room: {
            myParticipantRole: 'Player',
            setCharacterTagNames: false,
            setPublicChannelNames: false,
            setBoards: false,
            setCharacters: false,
            setParamNames: false,
        },
    });
    const [selectedMemoId, setSelectedMemoId] = React.useState<string>('');
    return (
        <div style={{ height: 200, width }}>
            <StorybookProvider compact roomClientContextValue={roomClientContextValue}>
                <MemosPanelContent
                    selectedMemoId={selectedMemoId}
                    onSelectedMemoIdChange={setSelectedMemoId}
                />
            </StorybookProvider>
        </div>
    );
};

const meta = {
    title: 'models/room/Room/MemosPanelContent',
    component: Default,
} satisfies Meta<typeof Default>;

export default meta;
