import { Default, State, Uploader, bgmTemplate } from '@flocon-trpg/core';
import { loggerRef } from '@flocon-trpg/utils';
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

type SrcAndFormat = {
    src: string;
    format?: string | undefined;
};

class PlaylistHowler {
    #howl;
    #playlistIndex = 0;
    srcAndFormat;
    #volume;

    constructor(srcAndFormat: readonly SrcAndFormat[], volume: number) {
        this.srcAndFormat = [...srcAndFormat];
        this.#volume = volume;

        this.#howl = this.#initializeHowl();
    }

    #createHowl(src: SrcAndFormat) {
        return new Howl({
            src: src.src,
            loop: false,
            volume: this.#volume,
            format: src.format,
            onend: () => {
                this.#onend();
            },
        });
    }

    #initializeHowl() {
        this.#playlistIndex = 0;
        const srcAndFormatElement = this.srcAndFormat[0];
        if (srcAndFormatElement == null) {
            throw new Error('srcAndFormat.length must be greater than 0.');
        }
        return this.#createHowl(srcAndFormatElement);
    }

    #onend() {
        this.#playlistIndex++;
        const nextSrcAndFormat = this.srcAndFormat[this.#playlistIndex];
        if (nextSrcAndFormat == null) {
            this.#howl = this.#initializeHowl();
            loggerRef.debug('Music ended. Starting the first music.');
        } else {
            this.#howl = this.#createHowl(nextSrcAndFormat);
            loggerRef.debug(
                { srcAndFormat: nextSrcAndFormat },
                'Music ended. Starting the next music.'
            );
        }

        this.#howl.play();
    }

    play() {
        this.#howl.play();
    }

    initialize() {
        this.#howl.stop();
        this.#howl = this.#initializeHowl();
    }

    getVolume() {
        // this.#volume でも同様
        return this.#howl.volume();
    }

    setVolume(newValue: number) {
        this.#volume = newValue;
        this.#howl.volume(newValue);
    }

    fade({
        from,
        to,
        duration,
        thenStop,
    }: {
        from: number;
        to: number;
        duration: number;
        thenStop: boolean;
    }) {
        const target = this.#howl;
        target.fade(from, to, duration);
        if (thenStop) {
            setTimeout(() => target.stop(), duration);
        }
    }
}

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
    const srcAndFormat: readonly SrcAndFormat[] | null = useMemoOne(() => {
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

    const howlRef = React.useRef<PlaylistHowler>();

    useDeepCompareEffect(() => {
        if (srcAndFormat == null || volumeRef.current == null) {
            return;
        }

        if (srcAndFormat.length === 0) {
            return;
        }

        const volume = Math.min(volumeRef.current, volumeCap);
        const howl = new PlaylistHowler(srcAndFormat, volume);
        howlRef.current = howl;
        if ((isPausedRef.current ?? true) === false) {
            loggerRef.debug({ srcAndFormat }, 'BGM is started to play');
            howl.play();
        }
        return () => {
            loggerRef.debug('BGM is stopping');
            howlRef.current = undefined;
            howl.fade({ from: howl.getVolume(), to: 0, duration: 1000, thenStop: true });
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
            howl.setVolume(Math.min(volume, volumeCap));
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
            loggerRef.debug({ srcAndFormat: howl.srcAndFormat }, 'BGM is pausing');
            howl.fade({ from: howl.getVolume(), to: 0, duration: 1000, thenStop: true });
            return;
        }
        loggerRef.debug({ srcAndFormat: howl.srcAndFormat }, 'BGM is starting');
        howl.initialize();
        howl.setVolume(Math.min(volumeRef.current ?? 0, volumeCap));
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
