/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Divider } from 'antd';
import React from 'react';

const tableCss = css`
    .label {
        padding-right: 12px;
        white-space: nowrap;
    }

    .header {
        font-weight: 600;
        font-size: 18px;
    }

    .header:not(:first-child) > td {
        padding: 16px 0 0 0;
    }
`;

const LabelStyleContext = React.createContext<React.CSSProperties | undefined>(undefined);

export const Table: React.FC<{
    children: React.ReactNode;
    style?: React.CSSProperties;
    labelStyle?: React.CSSProperties;
}> = ({ children, style, labelStyle }) => {
    return (
        <LabelStyleContext.Provider value={labelStyle}>
            <table css={tableCss} style={style}>
                <tbody>{children}</tbody>
            </table>
        </LabelStyleContext.Provider>
    );
};

export const TableRow: React.FC<{ children: React.ReactNode; label?: React.ReactNode }> = ({
    children,
    label,
}) => {
    const labelStyle = React.useContext(LabelStyleContext);
    return (
        <tr>
            <td className='label' align='right' style={labelStyle}>
                {label}
            </td>
            <td>{children}</td>
        </tr>
    );
};

export const TableCombinedRow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <tr>
            <td colSpan={2}>{children}</td>
        </tr>
    );
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <tr className='header'>
            <td colSpan={2}>{children}</td>
        </tr>
    );
};

const dividerStyle: React.CSSProperties = { margin: '12px 0' };

export const TableDivider: React.FC<{ dashed?: boolean }> = ({ dashed }) => {
    return (
        <tr>
            <td colSpan={2}>
                <Divider style={dividerStyle} dashed={dashed} />
            </td>
        </tr>
    );
};
