import { getOpenRollCall } from '@flocon-trpg/core';
import { FilePathFragment } from '@flocon-trpg/typed-document-node';
import { loggerRef } from '@flocon-trpg/utils';
import { soundEffect } from '@flocon-trpg/web-server-utils';
import { Howl } from 'howler';
import React from 'react';
import { useLatest, usePrevious } from 'react-use';
import { useRoomId } from './useRoomId';
import { useRoomMessages } from './useRoomMessages';
import { roomConfigAtomFamily } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { useSrcFromFilePath } from '@/hooks/srcHooks';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { useRoomStateValue } from '@/hooks/useRoomStateValue';
import { analyzeUrl } from '@/utils/analyzeUrl';
import { FilePathModule } from '@/utils/file/filePath';
import { volumeCap } from '@/utils/variables';

// 長過ぎる曲をSEにしようとした場合、何もしないと部屋に再入室しない限りその曲を止めることができない。それを防ぐため、最大15秒までしか流れないようにしている。15秒という長さは適当。
const musicLengthLimit = 15 * 1000;
const fadeout = 1 * 1000;

type SoundEffect = {
    filePath: Pick<FilePathFragment, 'sourceType' | 'path'>;
    volume: number;

    // これがないと、同じSEを複数回流そうとしたとき、urlが変わらないため2回目以降のSEが流れない。それを防ぐため、これを毎回変えることでSEが複数回流れるようになる。
    key: string;
};

function usePlaySoundEffectCore(value?: SoundEffect): void {
    const valueRef = useLatest(value);

    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const masterVolume = useAtomSelector(roomConfigAtom, state => state.masterVolume);
    const seVolume = useAtomSelector(roomConfigAtom, state => state.seVolume);
    const volumeConfig = masterVolume * seVolume;

    const volumeConfigRef = React.useRef(volumeConfig);
    React.useEffect(() => {
        volumeConfigRef.current = volumeConfig;
    }, [volumeConfig]);

    const url = useSrcFromFilePath(value?.filePath);

    // value?.keyが変わったときに音声を流すuseEffectの処理をトリガーさせるための処理。
    // url.srcが同じでも、新しいsrcObjectオブジェクトを作成してsrcObjectへの参照を変えることでトリガーさせている。
    const [srcObject, setSrcObject] = React.useState<{ src: string | undefined }>({
        src: undefined,
    });
    React.useEffect(() => {
        setSrcObject({ src: url.src });
    }, [url.src, value?.key]);

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
        howlsRef.current.set(value.key, {
            howl,
            volume: value.volume,
        });
        loggerRef.debug({ src }, 'SE is started to play');
        howl.play();
        setTimeout(() => howl.fade(howl.volume(), 0, fadeout), musicLengthLimit);
        setTimeout(() => {
            howl.stop();
            howlsRef.current.delete(value.key);
        }, musicLengthLimit + fadeout);
    }, [srcObject, valueRef]);

    React.useEffect(() => {
        howlsRef.current.forEach(({ howl, volume }) => {
            howl.volume(Math.min(volume * volumeConfig, volumeCap));
        });
    }, [volumeConfig]);
}

function usePlaySoundEffectMessage(): void {
    const roomMessages = useRoomMessages({});
    const messageDiff = roomMessages.diff;
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
            key: messageDiff.nextValue.value.messageId,
        });
    }, [messageDiff]);

    usePlaySoundEffectCore(soundEffectState);
}

function usePlayRollCallSoundEffect(): void {
    const myUserUid = useMyUserUid();
    const myUserUidRef = useLatest(myUserUid);
    const roomState = useRoomStateValue();
    const prevRoomState = usePrevious(roomState);
    const [soundEffectState, setSoundEffectState] = React.useState<SoundEffect>();
    React.useEffect(() => {
        if (prevRoomState == null || roomState == null) {
            return;
        }
        if (myUserUidRef.current == null) {
            return;
        }

        const prevOpenRollCall = getOpenRollCall(prevRoomState.rollCalls ?? {});
        const currentOpenRollCall = getOpenRollCall(roomState.rollCalls ?? {});
        if (currentOpenRollCall == null) {
            return;
        }
        if (prevOpenRollCall?.key === currentOpenRollCall.key) {
            return;
        }
        if (currentOpenRollCall.value.soundEffect == null) {
            return;
        }
        if (currentOpenRollCall.value.createdBy === myUserUidRef.current) {
            return;
        }
        setSoundEffectState({
            filePath: FilePathModule.toGraphQL(currentOpenRollCall.value.soundEffect.file),
            volume: currentOpenRollCall.value.soundEffect.volume,
            key: currentOpenRollCall.key,
        });
    }, [myUserUidRef, prevRoomState, roomState]);
    usePlaySoundEffectCore(soundEffectState);
}

export function usePlaySoundEffect() {
    usePlaySoundEffectMessage();
    usePlayRollCallSoundEffect();
}
