/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { PropsWithChildren } from 'react';
import { Row, Col, Button, Tooltip, Typography } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {
    checkedChildren: React.ReactNode;
    checkedIcon?: React.ReactNode;
    unCheckedChildren: React.ReactNode;
    unCheckedIcon?: React.ReactNode;
    tooltip?: string;
    // stringの場合、disabledが有効とみなし、さらにstringがTooltipとして出る（tooltipプロパティより優先度は高い）。
    disabled: boolean | string;
    showAsTextWhenDisabled?: boolean;
    hideWhenDisabled?: boolean;
    checked: boolean;
    onChange: (checked: boolean) => void;
    size?: SizeType;
};

const ToggleButton: React.FC<Props> = ({ checkedChildren, checkedIcon, unCheckedChildren, unCheckedIcon, tooltip, disabled: disabledCore, showAsTextWhenDisabled, hideWhenDisabled, checked, onChange, size }: Props) => {
    const disabled = typeof disabledCore === 'string' ? true : disabledCore;
    let button: JSX.Element;
    if (disabled && hideWhenDisabled) {
        return null;
    }
    if (disabled && showAsTextWhenDisabled === true) {
        button = <span css={css`padding: 0 5px;`}>{checked ? checkedChildren : unCheckedChildren}</span>;
    } else {
        button = (
            <Button
                type={disabled && showAsTextWhenDisabled === true ? 'text' : 'dashed'}
                icon={checked ? checkedIcon : unCheckedIcon}
                shape='circle'
                onClick={() => onChange(!checked)}
                disabled={disabled}
                size={size}>
                {checked ? checkedChildren : unCheckedChildren}
            </Button>
        );
    }
    if (typeof disabledCore === 'string') {
        return <Tooltip title={disabledCore}>{button}</Tooltip>;
    }
    if (tooltip != null) {
        return <Tooltip title={tooltip}>{button}</Tooltip>;
    }
    return button;
};

export default ToggleButton;