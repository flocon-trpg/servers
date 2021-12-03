import React, { PropsWithChildren } from 'react';
import copy from 'clipboard-copy';
import { Button, ButtonProps, Tooltip } from 'antd';
import { simpleId } from '@flocon-trpg/core';

type Props = Omit<ButtonProps, 'onClick'> & {
    clipboardText: () => Promise<string>;
};

const tooltipLifespan = 3000;

export const CopyToClipboardButton: React.FC<React.PropsWithChildren<Props>> = (
    props: PropsWithChildren<Props>
) => {
    const { clipboardText, ...restProps } = props;

    const [currentSubscriptionId, setCurrentSubscriptionId] = React.useState<string>();
    const [subscriptionCount, setSubscriptionCount] = React.useState(0);
    React.useEffect(() => {
        if (currentSubscriptionId == null) {
            return;
        }
        setSubscriptionCount(count => count + 1);
        setTimeout(() => {
            setSubscriptionCount(count => count - 1);
        }, tooltipLifespan);
    }, [currentSubscriptionId]);

    const button = (
        <Button
            onClick={async () => {
                const id = simpleId();
                const text = await clipboardText();
                await copy(text);
                setCurrentSubscriptionId(id);
            }}
            {...restProps}
        />
    );
    return (
        <Tooltip title='コピーしました!' visible={subscriptionCount >= 1}>
            {button}
        </Tooltip>
    );
};
