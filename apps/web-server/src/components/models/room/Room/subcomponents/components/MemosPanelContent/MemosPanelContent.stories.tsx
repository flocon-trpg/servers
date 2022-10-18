import { ComponentMeta } from '@storybook/react';
import { useSetAtom } from 'jotai';
import React from 'react';
import { MemosPanelContent } from './MemosPanelContent';
import { storybookAtom } from '@/atoms/storybookAtom/storybookAtom';
import { useMockRoom } from '@/hooks/useMockRoom';
import { createMockRoom } from '@/mocks';

const room = createMockRoom({
    myParticipantRole: 'Player',
    setCharacterTagNames: false,
    setPublicChannelNames: false,
    setBoards: false,
    setCharacters: false,
    setParamNames: false,
});

export const Default: React.FC<{ width?: number }> = ({ width }) => {
    const setStorybook = useSetAtom(storybookAtom);
    React.useEffect(() => {
        setStorybook({
            isStorybook: true,
            mock: {},
        });
    }, [setStorybook]);
    useMockRoom({ room });
    const [selectedMemoId, setSelectedMemoId] = React.useState<string>('');
    return (
        <div style={{ height: 200, width }}>
            <MemosPanelContent
                selectedMemoId={selectedMemoId}
                onSelectedMemoIdChange={setSelectedMemoId}
            />
        </div>
    );
};

export default {
    title: 'models/room/Room/MemosPanelContent',
    component: Default,
} as ComponentMeta<typeof Default>;
