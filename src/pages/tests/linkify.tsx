import React from 'react';
import Linkify from 'react-linkify';

const Main: React.FC = () => {
    return <Linkify componentDecorator={(href, text, key) => {
        return <a key={key} href={href} target="_blank" rel="noopener noreferrer">
            {text}
        </a>;
    }}>{'hoge https://google.com fuga'}</Linkify>;
};

export default Main;