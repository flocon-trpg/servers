import React from 'react';
import Linkify from 'react-linkify';

// eslint-disable-next-line @typescript-eslint/ban-types
export const NewTabLinkify: React.FC<React.PropsWithChildren<{}>> = ({ children }: React.PropsWithChildren<{}>) => {
    return <Linkify componentDecorator={(href, text, key) => {
        return <a key={key} href={href} target="_blank" rel="noopener noreferrer">
            {text}
        </a>;
    }}>
        {children}
    </Linkify>;
};