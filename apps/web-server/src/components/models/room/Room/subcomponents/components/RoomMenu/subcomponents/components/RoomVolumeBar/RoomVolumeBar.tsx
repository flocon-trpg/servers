import classNames from 'classnames';
import { useAtom } from 'jotai';
import React from 'react';
import { useRoomId } from '../../../../../hooks/useRoomId';
import { manual, roomConfigAtomFamily } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { defaultChannelVolume } from '@/atoms/roomConfigAtom/types/roomConfig/resources';
import { VolumeBar } from '@/components/ui/VolumeBar/VolumeBar';
import { flex, flexColumn, flexRow, itemsCenter } from '@/styles/className';

const useMasterVolume = (roomId: string) => {
    const [roomConfig, reduceRoomConfig] = useAtom(roomConfigAtomFamily(roomId));
    const setMasterVolume = React.useCallback(
        (newValue: number) => {
            reduceRoomConfig({
                type: manual,
                action: roomConfig => {
                    roomConfig.masterVolume = newValue;
                },
            });
        },
        [reduceRoomConfig],
    );
    return [roomConfig.masterVolume, setMasterVolume] as const;
};

const useChannelVolumes = (roomId: string) => {
    const [roomConfig, reduceRoomConfig] = useAtom(roomConfigAtomFamily(roomId));
    const setChannelVolume = React.useCallback(
        (action: { channelKey: string; newVolume: number }) => {
            reduceRoomConfig({
                type: manual,
                action: roomConfig => {
                    roomConfig.channelVolumes[action.channelKey] = action.newVolume;
                },
            });
        },
        [reduceRoomConfig],
    );
    return [roomConfig.channelVolumes, setChannelVolume] as const;
};

const useSeVolume = (roomId: string) => {
    const [roomConfig, reduceRoomConfig] = useAtom(roomConfigAtomFamily(roomId));
    const setSeVolume = React.useCallback(
        (newValue: number) => {
            reduceRoomConfig({
                type: manual,
                action: roomConfig => {
                    roomConfig.seVolume = newValue;
                },
            });
        },
        [reduceRoomConfig],
    );
    return [roomConfig.seVolume, setSeVolume] as const;
};

export const RoomVolumeBar: React.FC = () => {
    const roomId = useRoomId();
    const [masterVolume, setMasterVolume] = useMasterVolume(roomId);
    const [channelVolumes, setChannelVolume] = useChannelVolumes(roomId);
    const [seVolume, setSeVolume] = useSeVolume(roomId);

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
            inputNumberType="0-1"
            readonly={false}
            value={masterVolume}
            onChange={i => setMasterVolume(i)}
        />
    );
    const channel1VolumeBar = (
        <VolumeBar
            inputNumberType="0-1"
            readonly={false}
            value={channelVolumes['1'] ?? defaultChannelVolume}
            onChange={i => setChannelVolume({ channelKey: '1', newVolume: i })}
        />
    );
    const channel2VolumeBar = (
        <VolumeBar
            inputNumberType="0-1"
            readonly={false}
            value={channelVolumes['2'] ?? defaultChannelVolume}
            onChange={i => setChannelVolume({ channelKey: '2', newVolume: i })}
        />
    );
    const channel3VolumeBar = (
        <VolumeBar
            inputNumberType="0-1"
            readonly={false}
            value={channelVolumes['3'] ?? defaultChannelVolume}
            onChange={i => setChannelVolume({ channelKey: '3', newVolume: i })}
        />
    );
    const channel4VolumeBar = (
        <VolumeBar
            inputNumberType="0-1"
            readonly={false}
            value={channelVolumes['4'] ?? defaultChannelVolume}
            onChange={i => setChannelVolume({ channelKey: '4', newVolume: i })}
        />
    );
    const channel5VolumeBar = (
        <VolumeBar
            inputNumberType="0-1"
            readonly={false}
            value={channelVolumes['5'] ?? defaultChannelVolume}
            onChange={i => setChannelVolume({ channelKey: '5', newVolume: i })}
        />
    );
    const seVolumeBar = (
        <VolumeBar
            inputNumberType="0-1"
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
