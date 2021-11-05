import React from 'react';
import { DicePieceValueState, DieValueState } from '@flocon-trpg/core';

export namespace DicePieceValue {
    export const privateValueOpacity = 0.5;

    type ImageProps = {
        state: DicePieceValueState;
        size: number;
        padding?: number | string;
    };

    export const images: React.FC<ImageProps> = ({ state, size, padding }: ImageProps) => {
        const img = (state: DieValueState | undefined) => {
            if (state == null) {
                return null;
            }
            let src: string;
            if (state.value == null) {
                src = '/dice/0-6.png';
            } else {
                src = `/dice/${state.value}-6.png`;
            }
            return (
                <img
                    width={size}
                    height={size}
                    style={{ opacity: state.isValuePrivate ? privateValueOpacity : undefined }}
                    src={src}
                />
            );
        };
        return (
            <div style={{ display: 'flex', flexDirection: 'row', padding }}>
                {img(state.dice[1])}
                {img(state.dice[2])}
                {img(state.dice[3])}
                {img(state.dice[4])}
            </div>
        );
    };
}
