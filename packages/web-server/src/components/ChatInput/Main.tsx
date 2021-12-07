import React from 'react';
import { CharacterSelector } from './CharacterSelector';
import { GameSelector } from './GameSelector';
import { TextColorSelector } from './TextColorSelector';
import { publicChannel, SelectedChannelType, SubmitMessage } from './SubmitMessage';
import { getSelectedCharacterType } from './getSelectedCharacterType';
import { MessagePanelConfig } from '../../atoms/roomConfig/types/messagePanelConfig';
import { atom } from 'jotai';
import { roomConfigAtom } from '../../atoms/roomConfig/roomConfigAtom';
import { Draft } from 'immer';
import { useAtomValue } from 'jotai/utils';

const titleStyle: React.CSSProperties = {
    flexBasis: '80px',
};

type Props = {
    roomId: string;
    panelId: string;
    style?: Omit<React.CSSProperties, 'alignItems' | 'display' | 'flexDirection'>;
    onConfigUpdate: (recipe: (draft: Draft<MessagePanelConfig>) => void) => void;
};

export const ChatInput: React.FC<Props> = ({ roomId, panelId, style, onConfigUpdate }: Props) => {
    const miniInputMaxWidth = 200;

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

    return (
        <div style={{ ...style, display: 'flex', flexDirection: 'column' }}>
            <CharacterSelector
                config={config}
                onConfigUpdate={onConfigUpdate}
                titleStyle={titleStyle}
                inputMaxWidth={miniInputMaxWidth}
            />
            <GameSelector
                config={config}
                onConfigUpdate={onConfigUpdate}
                titleStyle={titleStyle}
                inputMaxWidth={miniInputMaxWidth}
            />
            <TextColorSelector
                config={config}
                onConfigUpdate={onConfigUpdate}
                titleStyle={titleStyle}
            />
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
