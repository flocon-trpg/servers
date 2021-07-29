import React from 'react';
import { Input, Select } from 'antd';
import { useMyCharacters } from '../../hooks/state/useMyCharacters';
import { MessagePanelConfig } from '../../states/MessagePanelConfig';
import * as Icon from '@ant-design/icons';
import { UpdateMessagePanelAction } from '../../modules/roomConfigModule';
import { custom, getSelectedCharacterType, none, some } from './getSelectedCharacterType';

type Props = {
    config: MessagePanelConfig;
    onConfigUpdate: (newValue: UpdateMessagePanelAction['panel']) => void;
    titleStyle?: React.CSSProperties;
    inputMaxWidth?: number;
};

export const CharacterSelector: React.FC<Props> = ({
    titleStyle,
    inputMaxWidth,
    config,
    onConfigUpdate,
}: Props) => {
    const myCharacters = useMyCharacters();

    const myCharactersOptions = React.useMemo(() => {
        if (myCharacters == null) {
            return [];
        }
        return [...(myCharacters ?? [])]
            .sort(([, x], [, y]) => x.name.localeCompare(y.name))
            .map(([key, value]) => {
                return (
                    <Select.Option key={key} value={key}>
                        {value.name}
                    </Select.Option>
                );
            });
    }, [myCharacters]);

    const selectedCharacterType = getSelectedCharacterType(config);

    return (
        <div
            style={{
                flex: '0 0 auto',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <div style={titleStyle}>キャラクター</div>
            <Select
                style={{ flex: 1, maxWidth: inputMaxWidth }}
                value={selectedCharacterType}
                onSelect={newValue => onConfigUpdate({ selectedCharacterType: newValue })}
            >
                <Select.Option value={none}>なし</Select.Option>
                <Select.Option value={some}>あり</Select.Option>
                <Select.Option value={custom}>カスタム</Select.Option>
            </Select>
            {selectedCharacterType === none ? (
                <div style={{ flex: 1 }} />
            ) : (
                <div style={{ flex: '0 0 auto', margin: '3px 0' }}>
                    <Icon.RightOutlined />
                </div>
            )}
            {selectedCharacterType === some && (
                <Select
                    style={{ flex: 1, maxWidth: inputMaxWidth }}
                    placeholder="キャラクター"
                    value={config.selectedCharacterStateId}
                    onSelect={(value, option) => {
                        if (typeof option.key !== 'string') {
                            return;
                        }
                        onConfigUpdate({
                            selectedCharacterStateId: option.key,
                        });
                    }}
                >
                    {myCharactersOptions}
                </Select>
            )}
            {selectedCharacterType === custom && (
                <Input
                    style={{ flex: 1, maxWidth: inputMaxWidth }}
                    placeholder="名前"
                    value={config.customCharacterName}
                    onChange={e => onConfigUpdate({ customCharacterName: e.target.value })}
                />
            )}
            <div style={{ flex: 1 }} />
        </div>
    );
};
