import { FilePathFragment } from '@flocon-trpg/typed-document-node-v0.7.1';
import { loggerRef } from '@flocon-trpg/utils';
import { soundEffect } from '@flocon-trpg/web-server-utils';
import { Howl } from 'howler';
import React from 'react';
import { useLatest } from 'react-use';
import { useRoomMessages } from './useRoomMessages';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { useSrcFromFilePath } from '@/hooks/srcHooks';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { analyzeUrl } from '@/utils/analyzeUrl';
import { volumeCap } from '@/utils/variables';

// 長過ぎる曲をSEにしようとした場合、何もしないと部屋に再入室しない限りその曲を止めることができない。それを防ぐため、最大15秒までしか流れないようにしている。15秒という長さは適当。
const musicLengthLimit = 15 * 1000;
const fadeout = 1 * 1000;

type SoundEffect = {
    filePath: FilePathFragment;
    volume: number;

    // これがないと、同じSEを複数回流そうとしたとき、urlが変わらないため2回目以降のSEが流れない。これがあることでdepsの中身が変わり、SEが複数回流れるようになる。
    // depsの中身を変えられるものであればなんでもいいが、messageIdが使いやすいと思って採用している。
    messageId: string;
};

function usePlaySoundEffectCore(value?: SoundEffect): void {
    const valueRef = useLatest(value);

    const masterVolume = useAtomSelector(roomConfigAtom, state => state?.masterVolume) ?? 0;
    const seVolume = useAtomSelector(roomConfigAtom, state => state?.seVolume) ?? 0;
    const volumeConfig = masterVolume * seVolume;

    const volumeConfigRef = React.useRef(volumeConfig);
    React.useEffect(() => {
        volumeConfigRef.current = volumeConfig;
    }, [volumeConfig]);

    const url = useSrcFromFilePath(value?.filePath);

    // value?.messageIdが変わったときに音声を流すuseEffectの処理をトリガーさせるための処理。
    // url.srcが同じでも、新しいsrcObjectオブジェクトを作成することで、srcObjectへの参照を変えることでトリガーさせている。
    const [srcObject, setSrcObject] = React.useState<{ src: string | undefined }>({
        src: undefined,
    });
    React.useEffect(() => {
        setSrcObject({ src: url.src });
    }, [url.src, value?.messageId]);

    const howlsRef = React.useRef<Map<string, { howl: Howl; volume: number }>>(new Map());

    React.useEffect(() => {
        const value = valueRef.current;

        if (srcObject.src == null || value == null) {
            return;
        }

        const url = analyzeUrl(srcObject.src);
        if (url == null) {
            return;
        }

        const src = url.directLink;
        const howl = new Howl({
            src: [src],
            loop: false,
            volume: Math.min(value.volume * volumeConfigRef.current, volumeCap),
        });
        howlsRef.current.set(value.messageId, {
            howl,
            volume: value.volume,
        });
        loggerRef.value.debug({ src }, 'SE is started to play');
        howl.play();
        setTimeout(() => howl.fade(howl.volume(), 0, fadeout), musicLengthLimit);
        setTimeout(() => {
            howl.stop();
            howlsRef.current.delete(value.messageId);
        }, musicLengthLimit + fadeout);
    }, [srcObject, valueRef]);

    React.useEffect(() => {
        howlsRef.current.forEach(({ howl, volume }) => {
            howl.volume(Math.min(volume * volumeConfig, volumeCap));
        });
    }, [volumeConfig]);
}

export function usePlaySoundEffect(): void {
    const roomMessages = useRoomMessages({});
    const messageDiff = roomMessages.messages.diff;
    const [soundEffectState, setSoundEffectState] = React.useState<SoundEffect>();

    React.useEffect(() => {
        if (messageDiff == null) {
            setSoundEffectState(undefined);
            return;
        }
        if (messageDiff.prevValue != null || messageDiff.nextValue == null) {
            setSoundEffectState(undefined);
            return;
        }
        if (messageDiff.nextValue.type !== soundEffect) {
            setSoundEffectState(undefined);
            return;
        }
        setSoundEffectState({
            filePath: messageDiff.nextValue.value.file,
            volume: messageDiff.nextValue.value.volume,
            messageId: messageDiff.nextValue.value.messageId,
        });
    }, [messageDiff]);

    usePlaySoundEffectCore(soundEffectState);
}
