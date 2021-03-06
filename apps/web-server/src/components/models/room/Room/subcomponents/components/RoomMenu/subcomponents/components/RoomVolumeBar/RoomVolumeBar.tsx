import classNames from 'classnames';
import React from 'react';
import { VolumeBar } from '@/components/ui/VolumeBar/VolumeBar';
import { defaultChannelVolume } from '@/atoms/roomConfigAtom/types/roomConfig/resources';
import { flex, flexColumn, flexRow, itemsCenter } from '@/styles/className';
import { atom, useAtom } from 'jotai';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
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
            {toRow(masterVolumeBar, '??????????????????')}
            {toRow(seVolumeBar, 'SE??????')}
            {toRow(channel1VolumeBar, 'BGM???????????????1??????')}
            {toRow(channel2VolumeBar, 'BGM???????????????2??????')}
            {toRow(channel3VolumeBar, 'BGM???????????????3??????')}
            {toRow(channel4VolumeBar, 'BGM???????????????4??????')}
            {toRow(channel5VolumeBar, 'BGM???????????????5??????')}
            <div style={{ paddingTop: 8, color: 'gray' }}>
                ??????????????????????????????????????????
                <br />
                ?????????????????????????????????????????????
            </div>
        </div>
    );
};
