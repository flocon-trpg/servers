import React from 'react';
import { Howl } from 'howler';
import { useFirebaseStorageUrlArray } from './firebaseStorage';
import { volumeCap } from '../utils/variables';
import { useSelector } from '../store';
import { defaultChannelVolume, defaultMasterVolume } from '../states/RoomConfig';
import { BgmState } from '@kizahasi/flocon-core';
import _ from 'lodash';
import { analyzeUrl } from '../utils/analyzeUrl';
import { useDeepCompareEffect } from 'react-use';

type PlayBgmBehaviorCoreProps = {
    bgm: BgmState | null;
    volumeConfig: number;
};

function usePlayBgmCore({ bgm, volumeConfig }: PlayBgmBehaviorCoreProps): void {
    // bgm == null ⇔ volume == null
    // bgm == null のときはvolumeを求めようがない
    const getVolume = () => {
        if (bgm == null) {
            return null;
        }
        return bgm.volume * volumeConfig;
    };
    const volume = getVolume();
    const volumeRef = React.useRef(volume);
    React.useEffect(() => {
        volumeRef.current = volume;
    }, [volume]);

    const isPausedRef = React.useRef(bgm?.isPaused);
    React.useEffect(() => {
        isPausedRef.current = bgm?.isPaused;
    }, [bgm?.isPaused]);

    const urlArray = useFirebaseStorageUrlArray(bgm?.files);
    const howlRef = React.useRef<Howl>();

    useDeepCompareEffect(() => {
        if (urlArray == null || volumeRef.current == null) {
            return;
        }

        const src = _(urlArray).compact().value();
        if (src.length === 0) {
            return;
        }
        const howl = new Howl({
            src: src.map(s => analyzeUrl(s).directLink),
            loop: true,
            volume: Math.min(volumeRef.current, volumeCap),
        });
        howlRef.current = howl;
        if ((isPausedRef.current ?? true) === false) {
            howl.play();
        }
        return () => {
            howlRef.current = undefined;
            howl.fade(howl.volume(), 0, 1000);
            setTimeout(() => howl.stop(), 1000);
        };
    }, [urlArray]);

    React.useEffect(() => {
        if (volume == null) {
            return;
        }
        const howl = howlRef.current;
        if (howl == null) {
            return;
        }
        if (isPausedRef.current === false) {
            howl.volume(Math.min(volume, volumeCap));
        }
    }, [volume]);

    React.useEffect(() => {
        if (bgm?.isPaused == null) {
            return;
        }
        const howl = howlRef.current;
        if (howl == null) {
            return;
        }
        if (bgm.isPaused) {
            howl.fade(howl.volume(), 0, 1000);
            return;
        }
        howl.stop();
        howl.volume(Math.min(volumeRef.current ?? 0, volumeCap));
        howl.play();
    }, [bgm?.isPaused]);
}

export function usePlayBgm(): void {
    const bgms = useSelector(state => state.roomModule.roomState?.state?.bgms) ?? {};
    const masterVolume =
        useSelector(state => state.roomConfigModule?.masterVolume) ?? defaultMasterVolume;
    const channelVolumes = useSelector(state => state.roomConfigModule?.channelVolumes) ?? {};

    usePlayBgmCore({
        bgm: bgms['1'] ?? null,
        volumeConfig: masterVolume * (channelVolumes['1'] ?? defaultChannelVolume),
    });
    usePlayBgmCore({
        bgm: bgms['2'] ?? null,
        volumeConfig: masterVolume * (channelVolumes['2'] ?? defaultChannelVolume),
    });
    usePlayBgmCore({
        bgm: bgms['3'] ?? null,
        volumeConfig: masterVolume * (channelVolumes['3'] ?? defaultChannelVolume),
    });
    usePlayBgmCore({
        bgm: bgms['4'] ?? null,
        volumeConfig: masterVolume * (channelVolumes['4'] ?? defaultChannelVolume),
    });
    usePlayBgmCore({
        bgm: bgms['5'] ?? null,
        volumeConfig: masterVolume * (channelVolumes['5'] ?? defaultChannelVolume),
    });
}
