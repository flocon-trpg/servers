import { loggerRef } from '@flocon-trpg/utils';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { MyCharactersSelect } from './MyCharactersSelect';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { myRichCharacterId } from '@/mocks';

export const Default: React.FC<{
    characterIdMode: 'found' | 'notFound' | 'undefined';
    showAlert: boolean;
    readonly: boolean;
}> = ({ characterIdMode, showAlert, readonly }) => {
    const { roomClientContextValue } = useSetupStorybook({});

    let selectedCharacterId: string | undefined;
    switch (characterIdMode) {
        case 'found':
            selectedCharacterId = myRichCharacterId;
            break;
        case 'notFound':
            selectedCharacterId = 'character-id-not-found';
            break;
        case 'undefined':
            selectedCharacterId = undefined;
            break;
    }
    return (
        <StorybookProvider compact roomClientContextValue={roomClientContextValue}>
            <MyCharactersSelect
                selectedCharacterId={selectedCharacterId}
                showAlert={showAlert}
                readOnly={readonly}
                onSelect={value => loggerRef.info({ value }, 'onSelect')}
            />
        </StorybookProvider>
    );
};

const Template: ComponentStory<typeof Default> = args => <Default {...args} />;

export default {
    title: 'models/room/Room/MyCharactersSelect',
    component: Default,
    args: {
        characterIdMode: 'found',
        readonly: false,
        showAlert: true,
    },
} as ComponentMeta<typeof Default>;

export const Readonly = Template.bind({});
Readonly.args = {
    readonly: true,
};

export const NotFound = Template.bind({});
NotFound.args = {
    characterIdMode: 'notFound',
};

export const Undefined = Template.bind({});
Undefined.args = {
    characterIdMode: 'undefined',
};
