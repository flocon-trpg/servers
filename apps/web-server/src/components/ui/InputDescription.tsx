import React from 'react';

const defaultStyle: React.CSSProperties = {
    paddingRight: 4,
};

type Props = {
    style?: React.CSSProperties;
};

export const InputDescription: React.FC<React.PropsWithChildren<Props>> = ({
    children,
    style,
}: React.PropsWithChildren<Props>) => {
    return <div style={style == null ? defaultStyle : style}>{children}</div>;
};
