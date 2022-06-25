/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { Button, Popover } from 'antd';
import { SketchPicker } from 'react-color';
import classNames from 'classnames';
import { cancelRnd, flex, flexNone, flexRow, itemsCenter } from '@/styles/className';
import { rgb } from '@/utils/rgb';
import { Draft } from 'immer';
import { ChatPalettePanelConfig } from '@/atoms/roomConfigAtom/types/chatPalettePanelConfig';
import { MessagePanelConfig } from '@/atoms/roomConfigAtom/types/messagePanelConfig';
import { InputDescription } from '@/components/ui/InputDescription/InputDescription';

type Props = {
    config: ChatPalettePanelConfig | MessagePanelConfig;
    onConfigUpdate: (
        recipe: (draft: Draft<ChatPalettePanelConfig> | Draft<MessagePanelConfig>) => void
    ) => void;
    descriptionStyle?: React.CSSProperties;
};

export const TextColorSelector: React.FC<Props> = ({
    config,
    onConfigUpdate,
    descriptionStyle: descriptionStyle,
}: Props) => {
    return (
        <div className={classNames(flexNone, flex, flexRow, itemsCenter)}>
            <InputDescription style={descriptionStyle}>文字色</InputDescription>
            <Popover
                trigger='click'
                content={
                    <SketchPicker
                        className={cancelRnd}
                        css={css`
                            color: black;
                        `}
                        disableAlpha
                        color={
                            config.selectedTextColor == null ? '#000000' : config.selectedTextColor
                        }
                        onChange={e =>
                            onConfigUpdate(draft => {
                                draft.selectedTextColor = rgb(e.rgb);
                            })
                        }
                        presetColors={[
                            '#F26262',
                            '#F2A962',
                            '#F1F262',
                            '#AAF262',
                            '#63F262',
                            '#62F2AB',
                            '#62F2F2',
                            '#62ABF2',
                            '#6362F2',
                            '#AA62F2',
                            '#F162F2',
                            '#F262A9',
                            '#9D9D9D',
                        ]}
                    />
                }
            >
                <Button
                    style={{
                        color: config.selectedTextColor,
                        width: 110,
                        margin: '4px 4px 4px 0',
                    }}
                    type='dashed'
                    size='small'
                >
                    {config.selectedTextColor ?? 'デフォルト'}
                </Button>
            </Popover>
            <Button
                size='small'
                onClick={() =>
                    onConfigUpdate(draft => {
                        draft.selectedTextColor = undefined;
                    })
                }
            >
                リセット
            </Button>
        </div>
    );
};
