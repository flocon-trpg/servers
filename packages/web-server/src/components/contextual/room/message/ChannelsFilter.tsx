import React from 'react';
import { Checkbox } from 'antd';
import { RoomPrivateMessage, RoomPublicMessage } from '@flocon-trpg/typed-document-node';
import { usePublicChannelNames } from '../../../../hooks/state/usePublicChannelNames';
import classNames from 'classnames';
import { flex, flexColumn } from '../../../../utils/className';
import { $system, $free } from '@flocon-trpg/core';

export type ChannelsFilterOptions = {
    includesPublicChannel1: boolean;
    includesPublicChannel2: boolean;
    includesPublicChannel3: boolean;
    includesPublicChannel4: boolean;
    includesPublicChannel5: boolean;
    includesPublicChannel6: boolean;
    includesPublicChannel7: boolean;
    includesPublicChannel8: boolean;
    includesPublicChannel9: boolean;
    includesPublicChannel10: boolean;
    includesFreeChannel: boolean;
    includesPrivateChannels: boolean;
    includesSystem: boolean;
};

const defaultOptions: ChannelsFilterOptions = {
    includesPublicChannel1: true,
    includesPublicChannel2: true,
    includesPublicChannel3: true,
    includesPublicChannel4: true,
    includesPublicChannel5: true,
    includesPublicChannel6: true,
    includesPublicChannel7: true,
    includesPublicChannel8: true,
    includesPublicChannel9: true,
    includesPublicChannel10: true,
    includesFreeChannel: true,
    includesPrivateChannels: true,
    includesSystem: true,
};

// 現時点ではChannelsSelectorはログ生成の際にのみ使われるため、それに使われるRoomMessageFilterをここで定義している。
export type RoomMessageFilter = {
    privateMessage: (value: RoomPrivateMessage) => boolean;
    publicMessage: (value: RoomPublicMessage) => boolean;
};

export namespace ChannelsFilterOptions {
    export const toFilter = (source: ChannelsFilterOptions): RoomMessageFilter => {
        return {
            publicMessage: (msg: RoomPublicMessage): boolean => {
                switch (msg.channelKey) {
                    case '1':
                        return source.includesPublicChannel1;
                    case '2':
                        return source.includesPublicChannel2;
                    case '3':
                        return source.includesPublicChannel3;
                    case '4':
                        return source.includesPublicChannel4;
                    case '5':
                        return source.includesPublicChannel5;
                    case '6':
                        return source.includesPublicChannel6;
                    case '7':
                        return source.includesPublicChannel7;
                    case '8':
                        return source.includesPublicChannel8;
                    case '9':
                        return source.includesPublicChannel9;
                    case '10':
                        return source.includesPublicChannel10;
                    case $system:
                        return source.includesSystem;
                    case $free:
                        return source.includesFreeChannel;
                    default:
                        return true;
                }
            },
            privateMessage: () => source.includesPrivateChannels,
        };
    };

    export const defaultValue = defaultOptions;
}

type Props = {
    value: ChannelsFilterOptions;
    onChange: (newValue: ChannelsFilterOptions) => void;
    disabled: boolean;
};

export const ChannelsFilter: React.FC<Props> = ({ value, onChange, disabled }: Props) => {
    const publicChannelNames = usePublicChannelNames();

    if (publicChannelNames == null) {
        return null;
    }

    return (
        <div className={classNames(flex, flexColumn)}>
            <div>特殊チャンネル</div>
            <div>
                <Checkbox
                    checked={value.includesSystem}
                    disabled={disabled}
                    onChange={e =>
                        onChange({
                            ...value,
                            includesSystem: e.target.checked,
                        })
                    }
                >
                    システムメッセージ
                </Checkbox>
                <br />
                <Checkbox
                    checked={value.includesFreeChannel}
                    disabled={disabled}
                    onChange={e =>
                        onChange({
                            ...value,
                            includesFreeChannel: e.target.checked,
                        })
                    }
                >
                    雑談
                </Checkbox>
                <br />
                <Checkbox
                    checked={value.includesPrivateChannels}
                    disabled={disabled}
                    onChange={e =>
                        onChange({
                            ...value,
                            includesPrivateChannels: e.target.checked,
                        })
                    }
                >
                    秘話
                </Checkbox>
            </div>
            <div style={{ marginTop: 4 }}>一般チャンネル</div>
            <div>
                <Checkbox
                    checked={value.includesPublicChannel1}
                    disabled={disabled}
                    onChange={e =>
                        onChange({
                            ...value,
                            includesPublicChannel1: e.target.checked,
                        })
                    }
                >
                    {publicChannelNames.publicChannel1Name}
                </Checkbox>
                <br />
                <Checkbox
                    checked={value.includesPublicChannel2}
                    disabled={disabled}
                    onChange={e =>
                        onChange({
                            ...value,
                            includesPublicChannel2: e.target.checked,
                        })
                    }
                >
                    {publicChannelNames.publicChannel2Name}
                </Checkbox>
                <br />
                <Checkbox
                    checked={value.includesPublicChannel3}
                    disabled={disabled}
                    onChange={e =>
                        onChange({
                            ...value,
                            includesPublicChannel3: e.target.checked,
                        })
                    }
                >
                    {publicChannelNames.publicChannel3Name}
                </Checkbox>
                <br />
                <Checkbox
                    checked={value.includesPublicChannel4}
                    disabled={disabled}
                    onChange={e =>
                        onChange({
                            ...value,
                            includesPublicChannel4: e.target.checked,
                        })
                    }
                >
                    {publicChannelNames.publicChannel4Name}
                </Checkbox>
                <br />
                <Checkbox
                    checked={value.includesPublicChannel5}
                    disabled={disabled}
                    onChange={e =>
                        onChange({
                            ...value,
                            includesPublicChannel5: e.target.checked,
                        })
                    }
                >
                    {publicChannelNames.publicChannel5Name}
                </Checkbox>
                <br />
                <Checkbox
                    checked={value.includesPublicChannel6}
                    disabled={disabled}
                    onChange={e =>
                        onChange({
                            ...value,
                            includesPublicChannel6: e.target.checked,
                        })
                    }
                >
                    {publicChannelNames.publicChannel6Name}
                </Checkbox>
                <br />
                <Checkbox
                    checked={value.includesPublicChannel7}
                    disabled={disabled}
                    onChange={e =>
                        onChange({
                            ...value,
                            includesPublicChannel7: e.target.checked,
                        })
                    }
                >
                    {publicChannelNames.publicChannel7Name}
                </Checkbox>
                <br />
                <Checkbox
                    checked={value.includesPublicChannel8}
                    disabled={disabled}
                    onChange={e =>
                        onChange({
                            ...value,
                            includesPublicChannel8: e.target.checked,
                        })
                    }
                >
                    {publicChannelNames.publicChannel8Name}
                </Checkbox>
                <br />
                <Checkbox
                    checked={value.includesPublicChannel9}
                    disabled={disabled}
                    onChange={e =>
                        onChange({
                            ...value,
                            includesPublicChannel9: e.target.checked,
                        })
                    }
                >
                    {publicChannelNames.publicChannel9Name}
                </Checkbox>
                <br />
                <Checkbox
                    checked={value.includesPublicChannel10}
                    disabled={disabled}
                    onChange={e =>
                        onChange({
                            ...value,
                            includesPublicChannel10: e.target.checked,
                        })
                    }
                >
                    {publicChannelNames.publicChannel10Name}
                </Checkbox>
            </div>
        </div>
    );
};
