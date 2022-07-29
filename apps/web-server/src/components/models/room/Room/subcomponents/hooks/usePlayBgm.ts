import React from 'react';
import { Howl } from 'howler';
import { loaded, useSrcArrayFromFilePath } from '@/hooks/srcHooks';
import { volumeCap } from '@/utils/variables';
import { State, bgmTemplate } from '@flocon-trpg/core';
import { compact } from 'lodash';
import { analyzeUrl } from '@/utils/analyzeUrl';
import { useDeepCompareEffect, useLatest } from 'react-use';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import {
    defaultChannelVolume,
    defaultMasterVolume,
} from '@/atoms/roomConfigAtom/types/roomConfig/resources';

type BgmState = State<typeof bgmTemplate>;

type PlayBgmCoreProps = {
    bgm: BgmState | null;
    volumeConfig: number;
};

function usePlayBgmCore({ bgm, volumeConfig }: PlayBgmCoreProps): void {
    // bgm == null ⇔ volume == null
    // bgm == null のときはvolumeを求めようがない
    let volume: number | null;
    if (bgm == null) {
        volume = null;
    } else {
        volume = bgm.volume * volumeConfig;
    }
    const volumeRef = useLatest(volume);

    const isPausedRef = useLatest(bgm?.isPaused);

    const urlArray = useSrcArrayFromFilePath(bgm?.files);
    const howlRef = React.useRef<Howl>();

    useDeepCompareEffect(() => {
        if (urlArray.type !== loaded || volumeRef.current == null) {
            return;
        }

        const src = compact(urlArray.srcData);
        const urls = compact(src.map(s => analyzeUrl(s)));
        if (urls.length === 0) {
            return;
        }

        const howl = new Howl({
            src: urls.map(url => url.directLink),
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
    }, [volume, isPausedRef]);

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
    }, [bgm?.isPaused, volumeRef]);
}

export function usePlayBgm(): void {
    const bgms = useAtomSelector(roomAtom, state => state.roomState?.state?.bgms) ?? {};
    const masterVolume =
        useAtomSelector(roomConfigAtom, state => state?.masterVolume) ?? defaultMasterVolume;
    const channelVolumes = useAtomSelector(roomConfigAtom, state => state?.channelVolumes) ?? {};

    const createPlayBgmCoreProps = (bgmKey: string): PlayBgmCoreProps => ({
        bgm: bgms[bgmKey] ?? null,
        volumeConfig: masterVolume * (channelVolumes[bgmKey] ?? defaultChannelVolume),
    });

    usePlayBgmCore(createPlayBgmCoreProps('1'));
    usePlayBgmCore(createPlayBgmCoreProps('2'));
    usePlayBgmCore(createPlayBgmCoreProps('3'));
    usePlayBgmCore(createPlayBgmCoreProps('4'));
    usePlayBgmCore(createPlayBgmCoreProps('5'));
}
