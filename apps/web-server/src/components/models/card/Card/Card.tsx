/** @jsxImportSource @emotion/react */
import { State, deckTemplateTemplate } from '@flocon-trpg/core';
import { FilePath } from '@flocon-trpg/core';
import classNames from 'classnames';
import React from 'react';
import { ValueOf } from 'type-fest';
import { image } from '../../file/FileBrowser/FileBrowser';
import { ImageView } from '../../file/ImageView/ImageView';
import { FileView } from '@/components/models/file/FileView/FileView';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { HelpMessageTooltip } from '@/components/ui/HelpMessageTooltip/HelpMessageTooltip';
import { Table, TableRow } from '@/components/ui/Table/Table';
import { flex, flexColumn } from '@/styles/className';
import { FilePathModule } from '@/utils/file/filePath';

type DeckTemplateState = State<typeof deckTemplateTemplate>;
type CardsState = NonNullable<DeckTemplateState['cards']>;
type CardState = NonNullable<ValueOf<CardsState>>;

type OnChange = (newValue: CardState) => void;

export type Props = {
    card: CardState;
    /** nullishの場合は読み取り専用モードになります。 */
    onChange?: OnChange;
};

export const Card: React.FC<Props> = ({ card, onChange }) => {
    return (
        <div className={classNames(flex, flexColumn)}>
            <ImageView filePath={card.face} size={150} link />
            {onChange && (
                <FileView
                    showImage={false}
                    maxWidthOfLink={100}
                    uploaderFileBrowserHeight={null}
                    defaultFileTypeFilter={image}
                    onPathChange={newValue => {
                        onChange &&
                            onChange({
                                ...card,
                                face:
                                    newValue == null
                                        ? undefined
                                        : {
                                              type: FilePath,
                                              filePath: FilePathModule.toOtState(newValue),
                                          },
                            });
                    }}
                />
            )}

            <Table>
                <TableRow
                    label={
                        <HelpMessageTooltip title='カードの名前を設定できます（例: 「ハートの3」）。省略可。'>
                            {'名前'}
                        </HelpMessageTooltip>
                    }
                >
                    <CollaborativeInput
                        bufferDuration='default'
                        value={card.name ?? ''}
                        disabled={onChange == null}
                        onChange={({ currentValue }) => {
                            onChange &&
                                onChange({
                                    ...card,
                                    name: currentValue,
                                });
                        }}
                    />
                </TableRow>
                <TableRow
                    label={
                        <HelpMessageTooltip title='カードの説明文を入力できます。省略可。'>
                            {'説明文'}
                        </HelpMessageTooltip>
                    }
                >
                    <CollaborativeInput
                        bufferDuration='default'
                        value={card.description ?? ''}
                        disabled={onChange == null}
                        multiline
                        onChange={({ currentValue }) => {
                            onChange &&
                                onChange({
                                    ...card,
                                    description: currentValue,
                                });
                        }}
                    />
                </TableRow>
            </Table>
        </div>
    );
};
