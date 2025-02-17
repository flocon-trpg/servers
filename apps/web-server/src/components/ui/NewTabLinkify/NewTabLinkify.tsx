import Linkify from 'linkify-react';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Props = {};

export const NewTabLinkify: React.FC<React.PropsWithChildren<Props>> = ({
    children,
}: React.PropsWithChildren<Props>) => {
    return (
        <Linkify
            options={{
                target: '_blank',
                rel: 'noopener noreferrer',
                validate(value, type) {
                    // emailはリンク化せず、urlだけリンク化している
                    return type === 'url';
                },
            }}
        >
            {children}
        </Linkify>
    );
};
