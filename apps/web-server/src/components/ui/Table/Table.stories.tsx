import { Meta } from '@storybook/react';
import React from 'react';
import { Table, TableCombinedRow, TableHeader, TableRow } from './Table';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';

export const Default: React.FC = () => {
    return (
        <StorybookProvider compact roomClientContextValue={null}>
            <Table>
                <TableHeader>短いtitle</TableHeader>
                <TableRow label="ラベルlabel">labelあり</TableRow>
                <TableRow>labelなし</TableRow>
                <TableCombinedRow>結合されたRow</TableCombinedRow>
                <TableHeader>長いtitle長いtitle</TableHeader>
                <TableRow label="ラベル1">この文章は1行です。</TableRow>
                <TableRow label="ラベル2">
                    この文章は
                    <br />
                    2行です。
                </TableRow>
            </Table>
        </StorybookProvider>
    );
};

const meta = {
    title: 'UI/Table',
    component: Default,
} satisfies Meta<typeof Default>;

export default meta;
