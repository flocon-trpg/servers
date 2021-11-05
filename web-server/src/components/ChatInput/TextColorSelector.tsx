/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { Popover, Button } from 'antd';
import { SketchPicker } from 'react-color';
import { ChatPalettePanelConfig } from '../../states/ChatPalettePanelConfig';
import { MessagePanelConfig } from '../../states/MessagePanelConfig';
import { reset } from '../../utils/types';
import classNames from 'classnames';
import {
    UpdateChatPalettePanelAction,
    UpdateMessagePanelAction,
} from '../../modules/roomConfigModule';
import { cancelRnd, flex, flexNone, flexRow, itemsCenter } from '../../utils/className';
import { rgb } from '../../utils/rgb';

type Props = {
    config: ChatPalettePanelConfig | MessagePanelConfig;
    onConfigUpdate: (
        newValue: UpdateChatPalettePanelAction['panel'] & UpdateMessagePanelAction['panel']
    ) => void;
    titleStyle?: React.CSSProperties;
};

export const TextColorSelector: React.FC<Props> = ({
    config,
    onConfigUpdate,
    titleStyle,
}: Props) => {
    return (
        <div className={classNames(flexNone, flex, flexRow, itemsCenter)}>
            <div style={titleStyle}>文字色</div>
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
                        onChange={e => onConfigUpdate({ selectedTextColor: rgb(e.rgb) })}
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
                onClick={() => onConfigUpdate({ selectedTextColor: { type: reset } })}
            >
                リセット
            </Button>
        </div>
    );
};
