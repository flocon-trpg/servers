import React from 'react';
import { Button } from 'antd';
import classNames from 'classnames';
import { flex, flexNone, flexRow, itemsCenter } from '@/styles/className';
import { rgb } from '@/utils/rgb';
import { Draft } from 'immer';
import { ChatPalettePanelConfig } from '@/atoms/roomConfigAtom/types/chatPalettePanelConfig';
import { MessagePanelConfig } from '@/atoms/roomConfigAtom/types/messagePanelConfig';
import { InputDescription } from '@/components/ui/InputDescription/InputDescription';
import { ColorPickerButton } from '../ColorPickerButton/ColorPickerButton';

type Props = {
    config: ChatPalettePanelConfig | MessagePanelConfig;
    onConfigUpdate: (
        recipe: (draft: Draft<ChatPalettePanelConfig> | Draft<MessagePanelConfig>) => void
    ) => void;
    descriptionStyle?: React.CSSProperties;
};

export const TextColorPicker: React.FC<Props> = ({
    config,
    onConfigUpdate,
    descriptionStyle: descriptionStyle,
}: Props) => {
    return (
        <div className={classNames(flexNone, flex, flexRow, itemsCenter)}>
            <InputDescription style={descriptionStyle}>文字色</InputDescription>
            <ColorPickerButton
                trigger='click'
                disableAlpha
                color={config.selectedTextColor == null ? '#FFFFFF' : config.selectedTextColor}
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
                buttonSize='small'
                buttonStyle={{ margin: '4px 4px 4px 0' }}
                buttonContent={config.selectedTextColor ?? 'デフォルト'}
            />
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
