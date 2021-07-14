import { Howl } from 'howler';
import React from 'react';
import { FilePathFragment } from '../generated/graphql';
import { useSelector } from '../store';
import { volumeCap } from '../utils/variables';
import { useFirebaseStorageUrl } from './firebaseStorage';
import { AllRoomMessagesResult, newEvent } from './useRoomMessages';

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
    const masterVolume = useSelector(state => state.roomConfigModule?.masterVolume) ?? 0;
    const seVolume = useSelector(state => state.roomConfigModule?.seVolume) ?? 0;
    const volumeConfig = masterVolume * seVolume;

    const volumeConfigRef = React.useRef(volumeConfig);
    React.useEffect(() => {
        volumeConfigRef.current = volumeConfig;
    }, [volumeConfig]);

    const url = useFirebaseStorageUrl(value?.filePath);
    const howlsRef = React.useRef<Map<string, { howl: Howl; volume: number }>>(new Map());

    React.useEffect(() => {
        if (url == null || value?.messageId == null) {
            return;
        }

        const howl = new Howl({
            src: [url],
            loop: false,
            volume: Math.min(value.volume * volumeConfigRef.current, volumeCap),
        });
        howlsRef.current.set(value.messageId, {
            howl,
            volume: value.volume,
        });
        howl.play();
        setTimeout(() => howl.fade(howl.volume(), 0, fadeout), musicLengthLimit);
        setTimeout(() => {
            howl.stop();
            howlsRef.current.delete(value.messageId);
        }, musicLengthLimit + fadeout);
    }, [url, value?.messageId, value?.volume]);

    React.useEffect(() => {
        howlsRef.current.forEach(({ howl, volume }) => {
            howl.volume(Math.min(volume * volumeConfig, volumeCap));
        });
    }, [volumeConfig]);
}

export function usePlaySoundEffect(): void {
    const allRoomMesssagesResult = useSelector(state => state.roomModule.allRoomMessagesResult);

    let soundEffect: SoundEffect | undefined = undefined;
    if (allRoomMesssagesResult?.type === newEvent) {
        if (allRoomMesssagesResult.event.__typename === 'RoomSoundEffect') {
            soundEffect = {
                filePath: allRoomMesssagesResult.event.file,
                volume: allRoomMesssagesResult.event.volume,
                messageId: allRoomMesssagesResult.event.messageId,
            };
        }
    }

    usePlaySoundEffectCore(soundEffect);
}
