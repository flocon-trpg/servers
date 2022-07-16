import React from 'react';

export type Props = {
    children?: React.ReactNode;
    legend: string;
};

export const Fieldset: React.FC<Props> = ({ legend, children }) => {
    return (
        <fieldset
            style={{
                borderWidth: 1,
                borderColor: 'rgba(128,128,128,0.5)',
                borderStyle: 'solid',
                padding: 16,
                margin: 8,
                borderRadius: 4,
            }}
        >
            <legend
                style={{
                    padding: '0 8px',
                    // antdのcssによってlegendのwidthが100%になっているため、無効化している。
                    width: 'initial',
                    marginBottom: 'initial',
                }}
            >
                {legend}
            </legend>
            {children}
        </fieldset>
    );
};
