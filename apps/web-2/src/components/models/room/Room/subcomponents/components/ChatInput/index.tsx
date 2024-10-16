import { Draft } from 'immer';
import { useAtomValue } from 'jotai/react';
import { atom } from 'jotai/vanilla';
import React from 'react';
import { TextColorPicker } from '../../../../../../ui/TextColorPicker/TextColorPicker';
import { GameSelector } from '../GameSelector/GameSelector';
import { SelectedChannelType, SubmitMessage, publicChannel } from '../SubmitMessage/SubmitMessage';
import { getSelectedCharacterType } from './getSelectedCharacterType';
import { CharacterSelector } from './subcomponents/components/CharacterSelector/CharacterSelector';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { MessagePanelConfig } from '@/atoms/roomConfigAtom/types/messagePanelConfig';

const flexBasis80: React.CSSProperties = {
    flexBasis: '80px',
};

const miniInputMaxWidth = 200;

export const row = 'row';
export const column = 'column';

type Props = {
    roomId: string;
    panelId: string;
    style?: Omit<React.CSSProperties, 'alignItems' | 'display' | 'flexDirection' | 'gap'>;
    onConfigUpdate: (recipe: (draft: Draft<MessagePanelConfig>) => void) => void;
    topElementsDirection: typeof row | typeof column;
};

export const ChatInput: React.FC<Props> = ({
    roomId,
    panelId,
    style,
    onConfigUpdate,
    topElementsDirection,
}: Props) => {
    const configAtom = React.useMemo(
        () => atom(get => get(roomConfigAtom)?.panels.messagePanels?.[panelId]),
        [panelId],
    );
    const config = useAtomValue(configAtom);
    const [selectedChannelType, setSelectedChannelType] =
        React.useState<SelectedChannelType>(publicChannel);

    if (config == null) {
        return null;
    }

    const desciptionStyle: React.CSSProperties | undefined =
        topElementsDirection === row ? undefined : flexBasis80;
    const characterSelector = (
        <CharacterSelector
            config={config}
            onConfigUpdate={onConfigUpdate}
            descriptionStyle={desciptionStyle}
            inputMaxWidth={miniInputMaxWidth}
        />
    );
    const gameSelector = (
        <GameSelector
            config={config}
            onConfigUpdate={onConfigUpdate}
            descriptionStyle={desciptionStyle}
            inputMaxWidth={miniInputMaxWidth}
        />
    );
    const textColorSelector = (
        <TextColorPicker
            config={config}
            onConfigUpdate={onConfigUpdate}
            descriptionStyle={desciptionStyle}
        />
    );
    let topElement: JSX.Element;
    if (topElementsDirection === row) {
        topElement = (
            <div style={{ ...style, display: 'flex', flexDirection: 'row', gap: '0 20px' }}>
                {characterSelector}
                {gameSelector}
                {textColorSelector}
            </div>
        );
    } else {
        topElement = (
            <>
                {characterSelector}
                {gameSelector}
                {textColorSelector}
            </>
        );
    }

    return (
        <div style={{ ...style, display: 'flex', flexDirection: 'column' }}>
            {topElement}
            <div style={{ flexBasis: 6 }} />
            <SubmitMessage
                roomId={roomId}
                selectedChannelType={selectedChannelType}
                onSelectedChannelTypeChange={setSelectedChannelType}
                config={config}
                onConfigUpdate={onConfigUpdate}
                selectedCharacterType={getSelectedCharacterType(config)}
            />
        </div>
    );
};
