import React, { PropsWithChildren } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

export const EditorGroupHeader: React.FC<PropsWithChildren<Props>> = ({
    children,
}: PropsWithChildren<Props>) => {
    return (
        <div style={{ padding: '0.4em 0 0.2em 0', fontWeight: 600, fontSize: '16px' }}>
            {children}
        </div>
    );
};
