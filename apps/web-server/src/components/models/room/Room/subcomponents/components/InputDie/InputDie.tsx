/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { State, dieValueTemplate } from '@flocon-trpg/core';
import { D6Value, noDie, noValue } from '../../utils/types';
import * as Icons from '@ant-design/icons';
import { Button } from 'antd';
import { replace, update } from '../../../../../../../stateManagers/states/types';
import { ToggleButton } from '../../../../../../ui/ToggleButton/ToggleButton';
import classNames from 'classnames';
import {
    flex,
    flexRow,
    itemsCenter,
    justifyItemsCenter,
} from '../../../../../../../styles/className';

type DieValueState = State<typeof dieValueTemplate>;

type AddDieProps = {
    onAdd: (dieType: DieValueState['dieType']) => void;
};

const AddDie: React.FC<AddDieProps> = ({ onAdd }: AddDieProps) => {
    return (
        <div className={classNames(flex, flexRow, itemsCenter)}>
            <Button size='small' icon={<Icons.PlusOutlined />} onClick={() => onAdd('D6')}>
                6面
            </Button>
        </div>
    );
};

namespace CSS {
    const selectedColor = '#FFFFFF70';

    export namespace Small {
        const width = 28;
        const height = 28;
        const padding = 3;

        export const imgButton = css`
            width: ${width}px;
            height: ${height}px;
            cursor: pointer;
            padding: ${padding}px;
            :hover {
                background-color: ${selectedColor};
            }
        `;

        export const selectedImgButton = css`
            width: ${width}px;
            height: ${height}px;
            cursor: pointer;
            padding: ${padding}px;
            background-color: ${selectedColor};
        `;
    }

    export namespace Middle {
        const width = 32;
        const height = 32;
        const padding = 4;

        export const imgButton = css`
            width: ${width}px;
            height: ${height}px;
            cursor: pointer;
            padding: ${padding}px;
            :hover {
                background-color: ${selectedColor};
            }
        `;

        export const selectedImgButton = css`
            width: ${width}px;
            height: ${height}px;
            cursor: pointer;
            padding: ${padding}px;
            background-color: ${selectedColor};
        `;
    }
}

type InputD6Props = {
    value: number | typeof noValue;
    onValueChange: (newValue: D6Value | typeof noDie | typeof noValue) => void;
    isValuePrivate: boolean;
    onIsValuePrivateChange: (newValue: boolean) => void;
    size: 'small' | 'middle';
};

const InputD6Die: React.FC<InputD6Props> = ({
    value,
    onValueChange,
    isValuePrivate,
    onIsValuePrivateChange,
    size,
}: InputD6Props) => {
    const imgButton = size === 'small' ? CSS.Small.imgButton : CSS.Middle.imgButton;
    const selectedImgButton =
        size === 'small' ? CSS.Small.selectedImgButton : CSS.Middle.selectedImgButton;

    return (
        <div className={classNames(flex, flexRow, itemsCenter)}>
            <img
                css={value == noValue ? selectedImgButton : imgButton}
                src='/assets/dice/0-6.png'
                onClick={() => onValueChange(noValue)}
            />
            <img
                css={value === 1 ? selectedImgButton : imgButton}
                src='/assets/dice/1-6.png'
                onClick={() => onValueChange(1)}
            />
            <img
                css={value === 2 ? selectedImgButton : imgButton}
                src='/assets/dice/2-6.png'
                onClick={() => onValueChange(2)}
            />
            <img
                css={value === 3 ? selectedImgButton : imgButton}
                src='/assets/dice/3-6.png'
                onClick={() => onValueChange(3)}
            />
            <img
                css={value === 4 ? selectedImgButton : imgButton}
                src='/assets/dice/4-6.png'
                onClick={() => onValueChange(4)}
            />
            <img
                css={value === 5 ? selectedImgButton : imgButton}
                src='/assets/dice/5-6.png'
                onClick={() => onValueChange(5)}
            />
            <img
                css={value === 6 ? selectedImgButton : imgButton}
                src='/assets/dice/6-6.png'
                onClick={() => onValueChange(6)}
            />
            <div style={{ width: size === 'small' ? 8 : 10 }} />
            <ToggleButton
                size={size}
                checked={!isValuePrivate}
                disabled={false}
                tooltip={
                    isValuePrivate ? 'このダイス目は現在非公開状態' : 'このダイス目は現在公開状態'
                }
                checkedChildren={<Icons.EyeOutlined />}
                unCheckedChildren={<Icons.EyeInvisibleOutlined />}
                onChange={e => onIsValuePrivateChange(!e)}
                shape='circle'
                defaultType='dashed'
            />
            <div
                css={imgButton}
                className={classNames(flex, itemsCenter, justifyItemsCenter)}
                onClick={() => onValueChange(noDie)}
            >
                <Icons.DeleteOutlined style={{ fontSize: size === 'small' ? 20 : 24 }} />
            </div>
        </div>
    );
};

type onChangeParams =
    | {
          type: typeof update;
          newValue: number | typeof noValue;
      }
    | {
          type: typeof replace;
          newValue:
              | {
                    dieType: DieValueState['dieType'];
                }
              | undefined;
      };

type Props = {
    state: DieValueState | null;
    onChange: (newValue: onChangeParams) => void;
    onIsValuePrivateChange: (newValue: boolean) => void;
    size: 'small' | 'middle';
};

export const InputDie: React.FC<Props> = ({
    state,
    onChange,
    onIsValuePrivateChange,
    size,
}: Props) => {
    if (state == null) {
        return <AddDie onAdd={dieType => onChange({ type: replace, newValue: { dieType } })} />;
    }
    if (state.dieType !== 'D6') {
        // TODO: D6以外もサポートする
        return null;
    }
    return (
        <InputD6Die
            value={state.value ?? noValue}
            isValuePrivate={state.isValuePrivate}
            onValueChange={newValue =>
                newValue === noDie
                    ? onChange({ type: replace, newValue: undefined })
                    : onChange({ type: update, newValue })
            }
            onIsValuePrivateChange={newValue => onIsValuePrivateChange(newValue)}
            size={size}
        />
    );
};
