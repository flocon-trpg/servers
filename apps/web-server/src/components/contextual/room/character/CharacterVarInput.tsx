import { characterTemplate, State } from '@flocon-trpg/core';
import React from 'react';
import { TomlInput } from '../../../ui/Tomllnput';

type CharacterState = State<typeof characterTemplate>;

type Props = {
    style?: React.CSSProperties;
    classNames?: string;
    disableResize?: boolean;
    character: CharacterState | undefined;
    onChange: (newValue: string) => void;
    rows?: number;
};

export const CharacterVarInput: React.FC<Props> = ({
    style,
    classNames,
    disableResize,
    character,
    onChange,
    rows,
}: Props) => {
    return (
        <TomlInput
            style={style}
            classNames={classNames}
            disableResize={disableResize}
            size='small'
            bufferDuration='default'
            readOnly={character == null}
            value={character?.privateVarToml ?? ''}
            rows={rows}
            onChange={e => {
                if (character == null) {
                    return;
                }
                onChange(e.currentValue);
            }}
        />
    );
};
