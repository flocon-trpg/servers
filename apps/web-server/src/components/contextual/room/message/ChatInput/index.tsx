import React from 'react';
import { CharacterSelector } from './CharacterSelector';
import { GameSelector } from './GameSelector';
import { TextColorSelector } from './TextColorSelector';
import { publicChannel, SelectedChannelType, SubmitMessage } from './SubmitMessage';
import { getSelectedCharacterType } from './getSelectedCharacterType';
import { MessagePanelConfig } from '../../../../../atoms/roomConfig/types/messagePanelConfig';
import { atom } from 'jotai';
import { roomConfigAtom } from '../../../../../atoms/roomConfig/roomConfigAtom';
import { Draft } from 'immer';
import { useAtomValue } from 'jotai/utils';

const titleStyleBase: React.CSSProperties = {
    flexBasis: '80px',
};

const miniInputMaxWidth = 200;

type Props = {
    roomId: string;
    panelId: string;
    style?: Omit<React.CSSProperties, 'alignItems' | 'display' | 'flexDirection'>;
    onConfigUpdate: (recipe: (draft: Draft<MessagePanelConfig>) => void) => void;
    wrap: boolean;
};

export const ChatInput: React.FC<Props> = ({
    roomId,
    panelId,
    style,
    onConfigUpdate,
    wrap,
}: Props) => {
    const configAtom = React.useMemo(
        () => atom(get => get(roomConfigAtom)?.panels.messagePanels?.[panelId]),
        [panelId]
    );
    const config = useAtomValue(configAtom);
    const [selectedChannelType, setSelectedChannelType] =
        React.useState<SelectedChannelType>(publicChannel);

    if (config == null) {
        return null;
    }

    const titleStyle: React.CSSProperties | undefined = wrap ? undefined : titleStyleBase;
    const characterSelector = (
        <CharacterSelector
            config={config}
            onConfigUpdate={onConfigUpdate}
            titleStyle={titleStyle}
            inputMaxWidth={miniInputMaxWidth}
        />
    );
    const gameSelector = (
        <GameSelector
            config={config}
            onConfigUpdate={onConfigUpdate}
            titleStyle={titleStyle}
            inputMaxWidth={miniInputMaxWidth}
        />
    );
    const textColorSelector = (
        <TextColorSelector
            config={config}
            onConfigUpdate={onConfigUpdate}
            titleStyle={titleStyle}
        />
    );
    let topElement: JSX.Element;
    if (wrap) {
        topElement = (
            <div style={{ ...style, display: 'flex', flexDirection: 'row' }}>
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
