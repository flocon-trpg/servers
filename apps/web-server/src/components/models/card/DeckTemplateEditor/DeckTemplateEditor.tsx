import { State, deckTemplateTemplate } from '@flocon-trpg/core';
import { Input } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { CardsList } from '../CardsList/CardsList';
import { FileView } from '@/components/models/file/FileView/FileView';
import { HelpMessageTooltip } from '@/components/ui/HelpMessageTooltip/HelpMessageTooltip';
import { Table, TableCombinedRow, TableHeader, TableRow } from '@/components/ui/Table/Table';
import { flex, flexColumn } from '@/styles/className';

type DeckTemplateState = State<typeof deckTemplateTemplate>;

type OnChange = (filePath: DeckTemplateState) => void;

export type Props = {
    onChange: OnChange;

    value: DeckTemplateState;
};

export const DeckTemplateEditor: React.FC<Props> = ({ value, onChange }) => {
    return (
        <div className={classNames(flex, flexColumn)}>
            <Table>
                <TableRow
                    label={
                        <HelpMessageTooltip title='このテンプレートの名前です。'>
                            {'名前'}
                        </HelpMessageTooltip>
                    }
                >
                    <Input />
                </TableRow>
                <TableRow
                    label={
                        <HelpMessageTooltip title='このテンプレートの説明文を入力できます。省略可。'>
                            {'説明文'}
                        </HelpMessageTooltip>
                    }
                >
                    <Input />
                </TableRow>
                <TableRow
                    label={
                        <HelpMessageTooltip title='このテンプレート内におけるカードの裏面の画像です。ただし、カードごとに裏面を設定することもでき、それらのカードではこの設定は無視されます。'>
                            {'裏面'}
                        </HelpMessageTooltip>
                    }
                >
                    <FileView />
                </TableRow>
                <TableHeader>カード</TableHeader>
                <TableCombinedRow>
                    <CardsList
                        cards={value.cards ?? {}}
                        onChange={newCards => {
                            onChange({ ...value, cards: newCards });
                        }}
                    />
                </TableCombinedRow>
            </Table>
        </div>
    );
};
