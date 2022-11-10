import { Default, State, Uploader, bgmTemplate } from '@flocon-trpg/core';
import { Howl } from 'howler';
import React from 'react';
import { useDeepCompareEffect, useLatest } from 'react-use';
import { useMemoOne } from 'use-memo-one';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import {
    defaultChannelVolume,
    defaultMasterVolume,
} from '@/atoms/roomConfigAtom/types/roomConfig/resources';
import { loaded, useSrcArrayFromFilePath } from '@/hooks/srcHooks';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';
import { analyzeUrl } from '@/utils/analyzeUrl';
import { extname } from '@/utils/extname';
import { volumeCap } from '@/utils/variables';

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
    const srcAndFormat = useMemoOne(() => {
        if (urlArray.type !== loaded) {
            return null;
        }
        const result: { src: string; format: string | undefined }[] = [];
        for (const q of urlArray.queriesResult) {
            if (q.data?.src == null || !q.isSuccess) {
                return null;
            }
            const src = q.data.type === Default ? analyzeUrl(q.data.src)?.directLink : q.data.src;
            if (src == null) {
                continue;
            }

            result.push({
                src,
                format:
                    q.data.type === Uploader
                        ? extname(q.data.filename).fileExtension ?? undefined
                        : undefined,
            });
        }
        return result;
    }, [urlArray]);

    const howlRef = React.useRef<Howl>();

    useDeepCompareEffect(() => {
        if (srcAndFormat == null || volumeRef.current == null) {
            return;
        }

        // howlerではsrcに[]を渡すとエラーになるため、ここで弾いている
        if (srcAndFormat.length === 0) {
            return;
        }

        const howl = new Howl({
            src: srcAndFormat.map(x => x.src),
            loop: true,
            volume: Math.min(volumeRef.current, volumeCap),
            // 内蔵アップローダーの場合、srcはBlob URLであるがこれには拡張子がなくhowlerが「No file extension was found. Consider using the "format" property or specify an extension.」というエラーを出すためformatに拡張子などを渡す必要がある。
            // ソースコード https://github.com/goldfire/howler.js/blob/143ae442386c7b42d91a007d0b1f1695528abe64/src/howler.core.js#L675 を見る限り、formatの要素はundefinedでも問題ない。
            format: srcAndFormat.map(x => x.format) as string[],
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
    }, [isPausedRef, srcAndFormat, volumeRef]);

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
    const bgms = useRoomStateValueSelector(state => state.bgms) ?? {};
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
