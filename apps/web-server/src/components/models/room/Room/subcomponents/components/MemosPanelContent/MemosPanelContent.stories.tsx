import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { MemosPanelContent } from './MemosPanelContent';
import { useMockRoom } from '@/hooks/useMockRoom';
import { storybookAtom } from '@/atoms/storybookAtom/storybookAtom';
import { useSetAtom } from 'jotai';
import { createMockRoom } from '@/mocks';
import { screen, userEvent, within } from '@storybook/testing-library';
import { delay } from '@flocon-trpg/utils';
import FakeTimers from '@sinonjs/fake-timers';

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
