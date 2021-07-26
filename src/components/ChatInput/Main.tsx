import React from 'react';
import { UpdateMessagePanelAction } from '../../modules/roomConfigModule';
import { MessagePanelConfig } from '../../states/MessagePanelConfig';
import _ from 'lodash';
import { CharacterSelector } from './CharacterSelector';
import { GameSelector } from './GameSelector';
import { TextColorSelector } from './TextColorSelector';
import { publicChannel, SelectedChannelType, SubmitMessage } from './SubmitMessage';
import { getSelectedCharacterType } from './getSelectedCharacterType';
import { useSelector } from '../../store';

const titleStyle: React.CSSProperties = {
    flexBasis: '80px',
};

type Props = {
    roomId: string;
    panelId: string;
    style?: Omit<React.CSSProperties, 'alignItems' | 'display' | 'flexDirection'>;
    onConfigUpdate: (newValue: UpdateMessagePanelAction['panel']) => void;
};

export const ChatInput: React.FC<Props> = ({ roomId, panelId, style, onConfigUpdate }: Props) => {
    const miniInputMaxWidth = 200;

    const config = useSelector(state => state.roomConfigModule?.panels.messagePanels?.[panelId]);
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
