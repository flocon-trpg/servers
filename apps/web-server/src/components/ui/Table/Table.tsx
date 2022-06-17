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

export const Table: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
    children,
    style,
}) => {
    return (
        <table css={tableCss} style={style}>
            <tbody>{children}</tbody>
        </table>
    );
};

export const TableRow: React.FC<{ children: React.ReactNode; label?: React.ReactNode }> = ({
    children,
    label,
}) => {
    return (
        <tr>
            <td className='label' align='right'>
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

export const TableDivider: React.FC<{ dashed?: boolean }> = ({ dashed }) => {
    return (
        <tr>
            <td colSpan={2}>
                <Divider dashed={dashed} />
            </td>
        </tr>
    );
};
