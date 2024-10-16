import { State, characterTemplate } from '@flocon-trpg/core';
import { Alert, Select } from 'antd';
import React from 'react';
import { useMyCharacters } from '../../hooks/useMyCharacters';

type CharacterState = State<typeof characterTemplate>;

type Value = { id: string; state: CharacterState };

type Props = {
    onSelect: (value: Value | undefined) => void;

    selectedCharacterId?: string;

    readOnly: boolean;

    showAlert: boolean;
};

export const MyCharactersSelect: React.FC<Props> = ({
    onSelect,
    selectedCharacterId,
    readOnly,
    showAlert,
}) => {
    const myCharacters = useMyCharacters();
    const selectedCharacter = React.useMemo(() => {
        return selectedCharacterId == null ? undefined : myCharacters?.get(selectedCharacterId);
    }, [myCharacters, selectedCharacterId]);
    const options = React.useMemo(() => {
        if (myCharacters == null) {
            return [];
        }
        return [...myCharacters].map(([characterKey, character]) => {
            return (
                <Select.Option key={characterKey} value={characterKey}>
                    {character.name}
                </Select.Option>
            );
        });
    }, [myCharacters]);

    if (readOnly) {
        return <span>{selectedCharacter?.name}</span>;
    }

    let alertMessage: string | undefined;
    let alertType: 'warning' | 'info' | undefined;
    if (showAlert) {
        if (selectedCharacterId == null) {
            alertType = 'warning';
            alertMessage =
                '所有者が選択されていません。リストが空の場合は、キャラクターを作成することで選択できるようになります。';
        } else if (selectedCharacter == null) {
            alertType = 'info';
            alertMessage =
                '所有者が見つかりませんでした。該当するキャラクターが削除された可能性があります。';
        }
    } else {
        alertType = undefined;
        alertMessage = undefined;
    }

    return (
        <div>
            <Select
                style={{ minWidth: 150 }}
                size='small'
                value={selectedCharacterId}
                onSelect={(value: string | undefined) => {
                    if (value == null) {
                        onSelect(undefined);
                        return;
                    }
                    if (typeof value === 'string') {
                        const selected = myCharacters?.get(value);
                        if (selected == null) {
                            onSelect(undefined);
                            return;
                        }
                        onSelect({ id: value, state: selected });
                        return;
                    }
                }}
            >
                {options}
            </Select>
            {alertMessage && <Alert type={alertType} showIcon message={alertMessage} />}
        </div>
    );
};
