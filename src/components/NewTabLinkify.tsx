import React from 'react';
import Linkify from 'react-linkify';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

export const NewTabLinkify: React.FC<React.PropsWithChildren<Props>> = ({
    children,
}: React.PropsWithChildren<Props>) => {
    return (
        <Linkify
            componentDecorator={(href, text, key) => {
                return (
                    <a key={key} href={href} target='_blank' rel='noopener noreferrer'>
                        {text}
                    </a>
                );
            }}
        >
            {children}
        </Linkify>
    );
};
