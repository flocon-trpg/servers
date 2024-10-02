import { State, characterTemplate, strIndex10Array } from '@flocon-trpg/core';
import { Select } from 'antd';
import React from 'react';
import { useCharacterTagNames } from '../../../../../hooks/useCharacterTagNames';

type CharacterState = State<typeof characterTemplate>;

const tagKey = (i: string) => `character-tag-${i}`;

type Props = {
    character: CharacterState;
    onChange: (immerRecipe: (character: CharacterState) => void) => void;
};

export const CharacterTagsSelect: React.FC<Props> = ({ character, onChange }: Props) => {
    const characterTagNames = useCharacterTagNames();

    const values: string[] = [];
    const children: React.ReactNode[] = [];
    strIndex10Array.forEach(i => {
        const tagName = characterTagNames?.[`characterTag${i}Name`];
        if (tagName == null) {
            return null;
        }
        children.push(
            <Select.Option key={tagKey(i)} value={tagKey(i)}>
                {tagName.trim() === '' ? '(空)' : tagName}
            </Select.Option>,
        );
        const hasTagPropKey = `hasTag${i}` as const;
        const hasTag = character[hasTagPropKey];
        if (!hasTag) {
            return;
        }
        values.push(tagKey(i));
    });

    return (
        <Select
            mode='multiple'
            style={{ width: '100%' }}
            value={values}
            onChange={value => {
                onChange(character => {
                    strIndex10Array.forEach(i => {
                        character[`hasTag${i}`] = value.includes(tagKey(i));
                    });
                });
            }}
        >
            {children}
        </Select>
    );
};
