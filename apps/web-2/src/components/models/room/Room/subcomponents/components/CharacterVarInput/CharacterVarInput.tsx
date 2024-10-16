import { State, characterTemplate } from '@flocon-trpg/core';
import React from 'react';
import { TomlInput } from '@/components/ui/TomlInput/Tomllnput';

type CharacterState = State<typeof characterTemplate>;

type Props = {
    style?: React.CSSProperties;
    className?: string;
    character: CharacterState | undefined;
    onChange: (newValue: string) => void;
};

export const CharacterVarInput: React.FC<Props> = ({
    style,
    className,
    character,
    onChange,
}: Props) => {
    return (
        <TomlInput
            style={style}
            className={className}
            size="small"
            bufferDuration="default"
            disabled={character == null}
            value={character?.privateVarToml ?? ''}
            onChange={e => {
                if (character == null) {
                    return;
                }
                onChange(e.currentValue);
            }}
        />
    );
};
