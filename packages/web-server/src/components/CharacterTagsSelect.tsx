import { CharacterState, strIndex10Array } from '@flocon-trpg/core';
import { Select } from 'antd';
import React from 'react';
import { useCharacterTagNames } from '../hooks/state/useCharacterTagNames';

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
        const tagName = characterTagNames?.[`characterTag${i}Name`]
        if (tagName == null) {
            return null;
        }
        values.push(tagName);
        const hasTagPropKey = `hasTag${i}` as const;
        const hasTag = character[hasTagPropKey];
        if (!hasTag) {
            return;
        }
        children.push(
            <Select.Option key={tagKey(i)} value={tagKey(i)}>
                {tagName}
            </Select.Option>
        );
    });

    return (
        <Select
            mode='multiple'
            allowClear
            style={{ width: '100%' }}
            placeholder='Please select'
            defaultValue={['a10', 'c12']}
            value={values}
            onChange={values => {
                onChange(character => {
                    strIndex10Array.forEach(i => {
                        character[`hasTag${i}`] = values.includes(tagKey(i));
                    });
                })
            }}
        >
            {children}
        </Select>
    );
};
