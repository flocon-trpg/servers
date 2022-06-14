import React from 'react';
import { Input, Select } from 'antd';
import { useMyCharacters } from '../../../../../hooks/useMyCharacters';
import * as Icon from '@ant-design/icons';
import { custom, getSelectedCharacterType, none, some } from '../../../getSelectedCharacterType';
import classNames from 'classnames';
import {
    flex,
    flexNone,
    flexRow,
    itemsCenter,
} from '../../../../../../../../../../styles/className';
import { MessagePanelConfig } from '../../../../../../../../../../atoms/roomConfigAtom/types/messagePanelConfig';
import { Draft } from 'immer';
import { InputDescription } from '../../../../../../../../../ui/InputDescription/InputDescription';

type Props = {
    config: MessagePanelConfig;
    onConfigUpdate: (recipe: (draft: Draft<MessagePanelConfig>) => void) => void;
    inputMaxWidth?: number;
    descriptionStyle?: React.CSSProperties;
};

export const CharacterSelector: React.FC<Props> = ({
    inputMaxWidth,
    config,
    onConfigUpdate,
    descriptionStyle,
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
        <div className={classNames(flexNone, flex, flexRow, itemsCenter)}>
            <InputDescription style={descriptionStyle}>キャラクター</InputDescription>
            <Select
                style={{ flex: 1, maxWidth: inputMaxWidth }}
                value={selectedCharacterType}
                onChange={newValue =>
                    onConfigUpdate(draft => {
                        draft.selectedCharacterType = newValue;
                    })
                }
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
                    placeholder='キャラクター'
                    value={config.selectedCharacterId}
                    onChange={value => {
                        if (value == null) {
                            return;
                        }
                        onConfigUpdate(draft => {
                            draft.selectedCharacterId = value;
                        });
                    }}
                >
                    {myCharactersOptions}
                </Select>
            )}
            {selectedCharacterType === custom && (
                <Input
                    style={{ flex: 1, maxWidth: inputMaxWidth }}
                    placeholder='名前'
                    value={config.customCharacterName}
                    onChange={e =>
                        onConfigUpdate(draft => {
                            draft.customCharacterName = e.target.value;
                        })
                    }
                />
            )}
            <div style={{ flex: 1 }} />
        </div>
    );
};
