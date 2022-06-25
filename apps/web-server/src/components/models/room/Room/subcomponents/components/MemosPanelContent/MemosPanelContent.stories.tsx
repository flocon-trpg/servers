import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { MemosPanelContent } from './MemosPanelContent';
import { useMockRoom } from '@/hooks/useMockRoom';
import { storybookAtom } from '@/atoms/storybookAtom/storybookAtom';
import { useSetAtom } from 'jotai';
import { createMockRoom } from '@/mocks';
import { screen, userEvent } from '@storybook/testing-library';
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

const Template: ComponentStory<typeof Default> = args => <Default {...args} />;

const fakeNow = new Date(2020, 9, 11, 12, 13, 14);

export const Create = Template.bind({});
Create.play = async () => {
    // すぐボタンをクリックしても反応しないようなので待っている。
    await delay(500);

    const installedClock = FakeTimers.install();
    installedClock.setSystemTime(fakeNow);

    const button = screen.getByRole('button', { name: '新規作成' });
    userEvent.click(button);

    installedClock.uninstall();
};

export const Width400Create = Template.bind({});
Width400Create.args = {
    width: 400,
};
Width400Create.play = async () => {
    // すぐボタンをクリックしても反応しないようなので待っている。
    await delay(500);

    const installedClock = FakeTimers.install();
    installedClock.setSystemTime(fakeNow);

    const button = screen.getByRole('button', { name: '新規作成' });
    userEvent.click(button);

    installedClock.uninstall();
};
