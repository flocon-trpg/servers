import { State, boardTemplate, deckTemplateTemplate } from '@flocon-trpg/core';
import { Input } from 'antd';
import classNames from 'classnames';
import { produce } from 'immer';
import React from 'react';
import { DeckTemplateCardListView } from '../../card/CardListView/CardListView';
import { FileView } from '@/components/models/file/FileView/FileView';
import { HelpMessageTooltip } from '@/components/ui/HelpMessageTooltip/HelpMessageTooltip';
import { Table, TableCombinedRow, TableHeader, TableRow } from '@/components/ui/Table/Table';
import { flex, flexColumn } from '@/styles/className';
import { FilePathModule } from '@/utils/file/filePath';

type DeckTemplateState = State<typeof deckTemplateTemplate>;
type BoardState = State<typeof boardTemplate>;

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
                        <HelpMessageTooltip title="このテンプレートの名前です。">
                            {'名前'}
                        </HelpMessageTooltip>
                    }
                >
                    <Input />
                </TableRow>
                <TableRow
                    label={
                        <HelpMessageTooltip title="このテンプレートの説明文を入力できます。省略可。">
                            {'説明文'}
                        </HelpMessageTooltip>
                    }
                >
                    <Input />
                </TableRow>
                <TableRow
                    label={
                        <HelpMessageTooltip title="このテンプレート内におけるカードの裏面の画像です。ただし、カードごとに個別に裏面を設定することもできます。その場合はそれらのカードにおいてこの設定は無視されます。">
                            {'裏面'}
                        </HelpMessageTooltip>
                    }
                >
                    <FileView
                        maxWidthOfLink={100}
                        uploaderFileBrowserHeight={null}
                        filePath={value.back?.filePath}
                        onPathChange={path => {
                            onChange(
                                produce(value, value => {
                                    value.back =
                                        path == null
                                            ? undefined
                                            : {
                                                  $v: 1,
                                                  $r: 1,
                                                  type: 'FilePath',
                                                  filePath: FilePathModule.toOtState(path),
                                              };
                                }),
                            );
                        }}
                        defaultFileTypeFilter="image"
                    />
                </TableRow>
                <TableHeader>カード</TableHeader>
                <TableCombinedRow>
                    <DeckTemplateCardListView
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
