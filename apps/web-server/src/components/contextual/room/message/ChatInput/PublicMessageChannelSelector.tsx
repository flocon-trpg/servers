import React from 'react';
import { Select } from 'antd';
import { usePublicChannelNames } from '../../../../../hooks/state/usePublicChannelNames';
import { $free, PublicChannelKey } from '@flocon-trpg/core';
import classNames from 'classnames';
import { flex, flexNone, flexRow, itemsCenter } from '../../../../../utils/className';
import { ChatPalettePanelConfig } from '../../../../../atoms/roomConfig/types/chatPalettePanelConfig';
import { MessagePanelConfig } from '../../../../../atoms/roomConfig/types/messagePanelConfig';
import { Draft } from 'immer';

type Props = {
    config: ChatPalettePanelConfig | MessagePanelConfig;
    onConfigUpdate: (
        recipe: (draft: Draft<ChatPalettePanelConfig> | Draft<MessagePanelConfig>) => void
    ) => void;
    titleStyle?: React.CSSProperties;
    inputMaxWidth?: number;
};

export const PublicMessageChannelSelector: React.FC<Props> = ({
    config,
    onConfigUpdate,
    titleStyle,
    inputMaxWidth,
}: Props) => {
    const publicChannelNames = usePublicChannelNames();

    let selectedPublicChannelKey: PublicChannelKey.Without$System.PublicChannelKey = $free;
    if (PublicChannelKey.Without$System.isPublicChannelKey(config.selectedPublicChannelKey)) {
        selectedPublicChannelKey = config.selectedPublicChannelKey;
    }

    return (
        <div className={classNames(flexNone, flex, flexRow, itemsCenter)}>
            <div style={titleStyle}>送信先</div>
            <Select
                style={{ flex: 1, maxWidth: inputMaxWidth }}
                value={selectedPublicChannelKey}
                onSelect={newValue =>
                    onConfigUpdate(draft => {
                        draft.selectedPublicChannelKey = newValue;
                    })
                }
            >
                <Select.Option key={$free} value={$free}>
                    雑談
                </Select.Option>
                <Select.Option key='1' value='1'>
                    {publicChannelNames?.publicChannel1Name}
                </Select.Option>
                <Select.Option key='2' value='2'>
                    {publicChannelNames?.publicChannel2Name}
                </Select.Option>
                <Select.Option key='3' value='3'>
                    {publicChannelNames?.publicChannel3Name}
                </Select.Option>
                <Select.Option key='4' value='4'>
                    {publicChannelNames?.publicChannel4Name}
                </Select.Option>
                <Select.Option key='5' value='5'>
                    {publicChannelNames?.publicChannel5Name}
                </Select.Option>
                <Select.Option key='6' value='6'>
                    {publicChannelNames?.publicChannel6Name}
                </Select.Option>
                <Select.Option key='7' value='7'>
                    {publicChannelNames?.publicChannel7Name}
                </Select.Option>
                <Select.Option key='8' value='8'>
                    {publicChannelNames?.publicChannel8Name}
                </Select.Option>
                <Select.Option key='9' value='9'>
                    {publicChannelNames?.publicChannel9Name}
                </Select.Option>
                <Select.Option key='10' value='10'>
                    {publicChannelNames?.publicChannel10Name}
                </Select.Option>
            </Select>
            <div style={{ flex: 1 }} />
        </div>
    );
};
