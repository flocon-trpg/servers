import React from 'react';
import { PropsWithChildren } from 'react';
import { Row, Col, Button, Tooltip } from 'antd';
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
    checked: boolean;
    onChange: (checked: boolean) => void;
    size?: SizeType;
};

const ToggleButton: React.FC<Props> = ({ checkedChildren, checkedIcon, unCheckedChildren, unCheckedIcon, tooltip, disabled, checked, onChange, size }: Props) => {
    const button = (
        <Button
            type='dashed'
            icon={checked ? checkedIcon : unCheckedIcon}
            shape='circle'
            onClick={() => onChange(!checked)}
            disabled={typeof disabled === 'string' ? true : disabled}
            size={size}>
            {checked ? checkedChildren : unCheckedChildren}
        </Button>
    );
    if (typeof disabled === 'string') {
        return <Tooltip title={disabled}>{button}</Tooltip>;
    }
    if (tooltip != null) {
        return <Tooltip title={tooltip}>{button}</Tooltip>;
    }
    return button;
};

export default ToggleButton;