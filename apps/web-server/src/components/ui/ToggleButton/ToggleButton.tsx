/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { Button, ButtonProps, Tooltip } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {
    checkedChildren?: React.ReactNode;
    checkedIcon?: React.ReactNode;
    unCheckedChildren?: React.ReactNode;
    unCheckedIcon?: React.ReactNode;
    tooltip?: string;
    // stringの場合、disabledが有効とみなし、さらにstringがTooltipとして出る（tooltipプロパティより優先度は高い）。
    disabled?: boolean | string;
    loading?: boolean;
    showAsTextWhenDisabled?: boolean;
    hideWhenDisabled?: boolean;
    checked: boolean;
    onChange: (checked: boolean) => void;
    size?: SizeType;
    shape?: ButtonProps['shape'];
    defaultType?: ButtonProps['type'];
};

export const ToggleButton: React.FC<Props> = ({
    checkedChildren,
    checkedIcon,
    unCheckedChildren,
    unCheckedIcon,
    tooltip,
    disabled: disabledCore,
    loading,
    showAsTextWhenDisabled,
    hideWhenDisabled,
    checked,
    onChange,
    size,
    shape,
    defaultType,
}: Props) => {
    const disabled = typeof disabledCore === 'string' ? true : disabledCore;
    let button: JSX.Element;
    if (disabled && hideWhenDisabled) {
        return null;
    }
    if (disabled && showAsTextWhenDisabled === true) {
        button = (
            <span
                css={css`
                    padding: 0 5px;
                `}
            >
                {checked ? checkedChildren : unCheckedChildren}
            </span>
        );
    } else {
        button = (
            <Button
                type={disabled && showAsTextWhenDisabled === true ? 'text' : defaultType}
                icon={checked ? checkedIcon : unCheckedIcon}
                shape={shape}
                onClick={() => onChange(!checked)}
                disabled={disabled}
                loading={loading}
                size={size}
            >
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
