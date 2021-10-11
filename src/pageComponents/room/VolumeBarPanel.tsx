import classNames from 'classnames';
import React from 'react';
import { useDispatch } from 'react-redux';
import { VolumeBar } from '../../components/VolumeBar';
import { roomConfigModule } from '../../modules/roomConfigModule';
import { defaultChannelVolume } from '../../states/RoomConfig';
import { useSelector } from '../../store';
import { flex, flexColumn, flexRow, itemsCenter } from '../../utils/className';

type Props = {
    roomId: string;
};

export const VolumeBarPanel: React.FC<Props> = ({ roomId }: Props) => {
    const masterVolume = useSelector(state => state.roomConfigModule?.masterVolume);
    const channelVolumes = useSelector(state => state.roomConfigModule?.channelVolumes);
    const seVolume = useSelector(state => state.roomConfigModule?.seVolume);
    const dispatch = useDispatch();

    if (masterVolume == null || channelVolumes == null || seVolume == null) {
        return null;
    }

    const textWidth = 100;

    const toRow = (child: JSX.Element, text: string) => (
        <div className={classNames(flex, flexRow, itemsCenter)}>
            <div style={{ flex: `${textWidth}px` }}>{text}</div>
            <div style={{ flex: 1, margin: '0 16px' }}>{child}</div>
        </div>
    );

    // Math.roundがないと60.000000001のような中途半端な値が表示されることがある
    const masterVolumeBar = (
        <VolumeBar
            inputNumberType='0-1'
            readonly={false}
            value={masterVolume}
            onChange={i =>
                dispatch(roomConfigModule.actions.setOtherValues({ roomId, masterVolume: i }))
            }
        />
    );
    const channel1VolumeBar = (
        <VolumeBar
            inputNumberType='0-1'
            readonly={false}
            value={channelVolumes['1'] ?? defaultChannelVolume}
            onChange={i =>
                dispatch(
                    roomConfigModule.actions.setChannelVolume({
                        roomId,
                        channelKey: '1',
                        volume: i,
                    })
                )
            }
        />
    );
    const channel2VolumeBar = (
        <VolumeBar
            inputNumberType='0-1'
            readonly={false}
            value={channelVolumes['2'] ?? defaultChannelVolume}
            onChange={i =>
                dispatch(
                    roomConfigModule.actions.setChannelVolume({
                        roomId,
                        channelKey: '2',
                        volume: i,
                    })
                )
            }
        />
    );
    const channel3VolumeBar = (
        <VolumeBar
            inputNumberType='0-1'
            readonly={false}
            value={channelVolumes['3'] ?? defaultChannelVolume}
            onChange={i =>
                dispatch(
                    roomConfigModule.actions.setChannelVolume({
                        roomId,
                        channelKey: '3',
                        volume: i,
                    })
                )
            }
        />
    );
    const channel4VolumeBar = (
        <VolumeBar
            inputNumberType='0-1'
            readonly={false}
            value={channelVolumes['4'] ?? defaultChannelVolume}
            onChange={i =>
                dispatch(
                    roomConfigModule.actions.setChannelVolume({
                        roomId,
                        channelKey: '4',
                        volume: i,
                    })
                )
            }
        />
    );
    const channel5VolumeBar = (
        <VolumeBar
            inputNumberType='0-1'
            readonly={false}
            value={channelVolumes['5'] ?? defaultChannelVolume}
            onChange={i =>
                dispatch(
                    roomConfigModule.actions.setChannelVolume({
                        roomId,
                        channelKey: '5',
                        volume: i,
                    })
                )
            }
        />
    );
    const seVolumeBar = (
        <VolumeBar
            inputNumberType='0-1'
            readonly={false}
            value={seVolume}
            onChange={i =>
                dispatch(roomConfigModule.actions.setOtherValues({ roomId, seVolume: i }))
            }
        />
    );

    return (
        <div className={classNames(flex, flexColumn)}>
            {toRow(masterVolumeBar, 'マスター音量')}
            {toRow(seVolumeBar, 'SE音量')}
            {toRow(channel1VolumeBar, 'BGMチャンネル1音量')}
            {toRow(channel2VolumeBar, 'BGMチャンネル2音量')}
            {toRow(channel3VolumeBar, 'BGMチャンネル3音量')}
            {toRow(channel4VolumeBar, 'BGMチャンネル4音量')}
            {toRow(channel5VolumeBar, 'BGMチャンネル5音量')}
        </div>
    );
};
