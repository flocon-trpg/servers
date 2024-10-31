import classNames from 'classnames';
import { produce } from 'immer';
import { atom, useAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import React from 'react';
import { useRoomId } from '../../../../../hooks/useRoomId';
import { manual, roomConfigAtomFamily } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { defaultChannelVolume } from '@/atoms/roomConfigAtom/types/roomConfig/resources';
import { VolumeBar } from '@/components/ui/VolumeBar/VolumeBar';
import { flex, flexColumn, flexRow, itemsCenter } from '@/styles/className';

const createMasterVolumeAtom = atomFamily((roomId: string) =>
    atom(
        async get => (await get(roomConfigAtomFamily(roomId))).masterVolume,
        (get, set, newValue: number) => {
            set(roomConfigAtomFamily(roomId), {
                type: manual,
                action: roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    roomConfig.masterVolume = newValue;
                },
            });
        },
    ),
);
const createChannelVolumesAtom = atomFamily((roomId: string) =>
    atom(
        async get => (await get(roomConfigAtomFamily(roomId))).channelVolumes,
        (get, set, action: { channelKey: string; newVolume: number }) => {
            set(roomConfigAtomFamily(roomId), {
                type: manual,
                action: roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    roomConfig.channelVolumes[action.channelKey] = action.newVolume;
                },
            });
        },
    ),
);
const createSeVolumeAtom = atomFamily((roomId: string) =>
    atom(
        async get => (await get(roomConfigAtomFamily(roomId))).seVolume,
        (get, set, newValue: number) => {
            set(roomConfigAtomFamily(roomId), {
                type: manual,
                action: roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    roomConfig.seVolume = newValue;
                },
            });
        },
    ),
);

export const RoomVolumeBar: React.FC = () => {
    const roomId = useRoomId();
    const masterVolumeAtom = React.useMemo(() => createMasterVolumeAtom(roomId), [roomId]);
    const [masterVolume, setMasterVolume] = useAtom(masterVolumeAtom);
    const channelVolumesAtom = React.useMemo(() => createChannelVolumesAtom(roomId), [roomId]);
    const [channelVolumes, setChannelVolume] = useAtom(channelVolumesAtom);
    const seVolumeAtom = React.useMemo(() => createSeVolumeAtom(roomId), [roomId]);
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
