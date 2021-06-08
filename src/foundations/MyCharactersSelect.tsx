import { CharacterState } from '@kizahasi/flocon-core';
import { Select } from 'antd';
import React from 'react';
import { useMyCharacters } from '../hooks/state/useMyCharacters';

type Value = { key: string; state: CharacterState };

type Props = {
    onSelect: (value: Value | undefined) => void;

    // これがnon-nullishだと、Selectが無効化され、指定されたCharacterが表示される
    fixedCharacterId?: string;
};

export const MyCharactersSelect: React.FC<Props> = ({ onSelect, fixedCharacterId }: Props) => {
    const myCharacters = useMyCharacters();
    const [activeCharacter, setActiveCharacter] = React.useState<Value>();
    const options = React.useMemo(() => {
        if (myCharacters == null) {
            return [];
        }
        return [...myCharacters].map(([characterKey, character]) => {
            return <Select.Option key={characterKey} value={characterKey}>
                {character.name}
            </Select.Option>;
        });
    }, [myCharacters]);

    if (fixedCharacterId != null) {
        return <span>{myCharacters?.get(fixedCharacterId)?.name}</span>;
    }

    return <Select
        style={{ minWidth: 150 }}
        size='small'
        value={activeCharacter?.key}
        onSelect={value => {
            if (value == null) {
                setActiveCharacter(undefined);
                onSelect(undefined);
                return;
            }
            if (typeof value === 'string') {
                const selected = myCharacters?.get(value);
                if (selected == null) {
                    setActiveCharacter(undefined);
                    onSelect(undefined);
                    return;
                }
                setActiveCharacter({ key: value, state: selected });
                onSelect({ key: value, state: selected });
                return;
            }
        }}>
        {options}
    </Select>;
};
