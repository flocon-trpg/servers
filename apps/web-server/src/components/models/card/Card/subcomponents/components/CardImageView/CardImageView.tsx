import { State, cardImageValue, deckPieceCardTemplate } from '@flocon-trpg/core';
import classNames from 'classnames';
import React from 'react';
import { z } from 'zod';
import { FileView } from '@/components/models/file/FileView/FileView';
import { ImageView } from '@/components/models/file/ImageView/ImageView';
import { flex, flexColumn } from '@/styles/className';
import { FilePathModule } from '@/utils/file/filePath';

type CardImage = z.TypeOf<typeof cardImageValue>;

export type Props =
    | {
          type: 'template';
          image: CardImage | undefined;
          /** nullish のときは読み取り専用モードになります。 */
          onChange: ((newValue: CardImage | undefined) => void) | null;
      }
    | {
          type: 'piece';
          image: CardImage | undefined;
          /** nullish のときは読み取り専用モードになります。 */
          onChange: ((newValue: CardImage) => void) | null;
      };

export const CardImageView: React.FC<Props> = props => {
    const onChange = props.onChange;
    return (
        <div className={classNames(flex, flexColumn)}>
            {props.image == null ? (
                <div style={{ width: 150, height: 150 }}>
                    {props.type === 'piece' ? '(未公開)' : '(なし)'}
                </div>
            ) : (
                <ImageView filePath={props.image.filePath} size={150} link />
            )}
            <FileView
                showImage={false}
                maxWidthOfLink={100}
                uploaderFileBrowserHeight={null}
                defaultFileTypeFilter="image"
                hideClear
                onPathChange={
                    props.onChange == null
                        ? null
                        : newValue => {
                              if (props.onChange == null) {
                                  throw new Error(
                                      'props.onChange is null. This should not happen.',
                                  );
                              }
                              const newState: CardImage | undefined =
                                  newValue == null
                                      ? undefined
                                      : {
                                            $v: 1,
                                            $r: 1,
                                            type: 'FilePath',
                                            filePath: FilePathModule.toOtState(newValue),
                                        };
                              if (newState == null) {
                                  if (props.type === 'template') {
                                      props.onChange(undefined);
                                  }
                                  return;
                              }
                              props.onChange(newState);
                          }
                }
            />
        </div>
    );
};
