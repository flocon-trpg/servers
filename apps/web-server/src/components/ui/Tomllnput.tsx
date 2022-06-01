import { isValidVarToml } from '@flocon-trpg/core';
import classNames from 'classnames';
import React from 'react';
import { flex, flex1, flexColumn } from '../../utils/className';
import { CollaborativeInput, Props as PropsCore } from './CollaborativeInput';

export type CreateBottomElementParams =
    | {
          isSkipping: false;
          currentValue: string;
      }
    | {
          isSkipping: true;
          currentValue?: undefined;
      };

const createBottomElement = (params: CreateBottomElementParams) => {
    if (params.isSkipping) {
        return <div>編集中…</div>;
    }
    const result = isValidVarToml(params.currentValue);
    if (result.isError) {
        return <div>TOML文法エラー</div>;
    }
    if (params.currentValue.trim() === '') {
        return null;
    }
    return <div>OK</div>;
};

type Props = Exclude<PropsCore, 'className' | 'onSkipping'>;

export const TomlInput: React.FC<Props> = (props: Props) => {
    const { ...inputProps } = props;
    const [bottomElement, setBottomElement] = React.useState<JSX.Element | null>(
        createBottomElement({ isSkipping: false, currentValue: props.value })
    );
    const onSkipping = (params: CreateBottomElementParams): void => {
        setBottomElement(createBottomElement(params));
    };

    return (
        <div className={classNames(flex, flexColumn, props.className)} style={props.style}>
            <CollaborativeInput
                {...inputProps}
                style={{ overflow: 'auto' }}
                className={classNames(flex1)}
                multiline
                onSkipping={onSkipping}
            />
            {bottomElement}
        </div>
    );
};
