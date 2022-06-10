import classNames from 'classnames';
import React from 'react';
import { VolumeBar } from '../../../../../../../ui/VolumeBar/VolumeBar';
import { defaultChannelVolume } from '../../../../../../../../atoms/roomConfig/types/roomConfig/resources';
import { flex, flexColumn, flexRow, itemsCenter } from '../../../../../../../../utils/className';
import { atom, useAtom } from 'jotai';
import { roomConfigAtom } from '../../../../../../../../atoms/roomConfig/roomConfigAtom';
import produce from 'immer';

const masterVolumeAtom = atom(
    get => get(roomConfigAtom)?.masterVolume,
    (get, set, newValue: number) => {
        set(roomConfigAtom, roomConfig => {
            if (roomConfig == null) {
                return roomConfig;
            }
            return produce(roomConfig, roomConfig => {
                roomConfig.masterVolume = newValue;
            });
        });
    }
);
const channelVolumesAtom = atom(
    get => get(roomConfigAtom)?.channelVolumes,
    (get, set, action: { channelKey: string; newVolume: number }) => {
        set(roomConfigAtom, roomConfig => {
            if (roomConfig == null) {
                return roomConfig;
            }
            return produce(roomConfig, roomConfig => {
                roomConfig.channelVolumes[action.channelKey] = action.newVolume;
            });
        });
    }
);
const seVolumeAtom = atom(
    get => get(roomConfigAtom)?.seVolume,
    (get, set, newValue: number) => {
        set(roomConfigAtom, roomConfig => {
            if (roomConfig == null) {
                return roomConfig;
            }
            return produce(roomConfig, roomConfig => {
                roomConfig.seVolume = newValue;
            });
        });
    }
);

export const RoomVolumeBar: React.FC = () => {
    const [masterVolume, setMasterVolume] = useAtom(masterVolumeAtom);
    const [channelVolumes, setChannelVolume] = useAtom(channelVolumesAtom);
    const [seVolume, setSeVolume] = useAtom(seVolumeAtom);

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

    const masterVolumeBar = (
        <VolumeBar
            inputNumberType='0-1'
            readonly={false}
            value={masterVolume}
            onChange={i => setMasterVolume(i)}
        />
    );
    const channel1VolumeBar = (
        <VolumeBar
            inputNumberType='0-1'
            readonly={false}
            value={channelVolumes['1'] ?? defaultChannelVolume}
            onChange={i => setChannelVolume({ channelKey: '1', newVolume: i })}
        />
    );
    const channel2VolumeBar = (
        <VolumeBar
            inputNumberType='0-1'
            readonly={false}
            value={channelVolumes['2'] ?? defaultChannelVolume}
            onChange={i => setChannelVolume({ channelKey: '2', newVolume: i })}
        />
    );
    const channel3VolumeBar = (
        <VolumeBar
            inputNumberType='0-1'
            readonly={false}
            value={channelVolumes['3'] ?? defaultChannelVolume}
            onChange={i => setChannelVolume({ channelKey: '3', newVolume: i })}
        />
    );
    const channel4VolumeBar = (
        <VolumeBar
            inputNumberType='0-1'
            readonly={false}
            value={channelVolumes['4'] ?? defaultChannelVolume}
            onChange={i => setChannelVolume({ channelKey: '4', newVolume: i })}
        />
    );
    const channel5VolumeBar = (
        <VolumeBar
            inputNumberType='0-1'
            readonly={false}
            value={channelVolumes['5'] ?? defaultChannelVolume}
            onChange={i => setChannelVolume({ channelKey: '5', newVolume: i })}
        />
    );
    const seVolumeBar = (
        <VolumeBar
            inputNumberType='0-1'
            readonly={false}
            value={seVolume}
            onChange={i => setSeVolume(i)}
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
            <div style={{ paddingTop: 8, color: 'gray' }}>
                これらの設定は個人設定です。
                <br />
                他のユーザーには影響しません。
            </div>
        </div>
    );
};
