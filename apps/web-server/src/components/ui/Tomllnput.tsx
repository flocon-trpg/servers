import { isValidVarToml } from '@flocon-trpg/core';
import classNames from 'classnames';
import React from 'react';
import { flex, flex1, flexColumn } from '../../utils/className';
import { CollaborativeInput, OnSkippingParams, Props as PropsCore } from './CollaborativeInput';

type Props = Exclude<PropsCore, 'style' | 'className'>;

export const TomlInput: React.FC<Props> = (props: Props) => {
    const { ...inputProps } = props;
    const [bottomElement, setBottomElement] = React.useState<JSX.Element>();
    const onSkipping = (params: OnSkippingParams): void => {
        if (params.isSkipping) {
            setBottomElement(<div>編集中…</div>);
            return;
        }
        const result = isValidVarToml(params.currentValue);
        if (result.isError) {
            setBottomElement(<div>TOML文法エラー</div>);
            return;
        }
        setBottomElement(<div>OK</div>);
    };

    return (
        <div className={classNames(flex, flexColumn)}>
            <CollaborativeInput
                {...inputProps}
                style={undefined}
                className={classNames(flex1)}
                onSkipping={onSkipping}
            />
            {bottomElement}
        </div>
    );
};
