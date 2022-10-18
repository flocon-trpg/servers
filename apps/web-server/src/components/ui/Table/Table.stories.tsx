import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { Table, TableCombinedRow, TableHeader, TableRow } from './Table';

export const Default: React.FC = () => {
    return (
        <Table>
            <TableHeader>短いtitle</TableHeader>
            <TableRow label='ラベルlabel'>labelあり</TableRow>
            <TableRow>labelなし</TableRow>
            <TableCombinedRow>結合されたRow</TableCombinedRow>
            <TableHeader>長いtitle長いtitle</TableHeader>
            <TableRow label='ラベル1'>この文章は1行です。</TableRow>
            <TableRow label='ラベル2'>
                この文章は
                <br />
                2行です。
            </TableRow>
        </Table>
    );
};

export default {
    title: 'UI/Table',
    component: Default,
} as ComponentMeta<typeof Default>;
