import React from 'react';
import { Howl } from 'howler';
import { useDeepCompareEffectNoCheck } from 'use-deep-compare-effect';
import { useFirebaseStorageUrl } from '../hooks/firebaseStorage';
import { FilePathFragment } from '../generated/graphql';
import { useSelector } from '../store';

// 暫定的な措置として、長過ぎる曲をSEにしようとした場合でも最大10秒までしか流れない。
const musicLengthLimit = 10 * 1000;
const fadeout = 1 * 1000;

type PlaySoundEffectProps = {
    value?: {
        filePath: FilePathFragment;
        volume: number;
    };
}

const PlaySoundEffectBehavior: React.FC<PlaySoundEffectProps> = ({ value }: PlaySoundEffectProps) => {
    const masterVolume = useSelector(state => state.roomConfigModule?.masterVolume) ?? 0;
    const seVolume = useSelector(state => state.roomConfigModule?.seVolume) ?? 0;
    const volumeConfig = masterVolume * seVolume;

    const getVolume = () => {
        return (value?.volume ?? 1) * volumeConfig;
    };
    const volume = getVolume();
    const volumeRef = React.useRef(volume);
    React.useEffect(() => {
        volumeRef.current = volume;
    }, [volume]);

    const url = useFirebaseStorageUrl(value?.filePath);
    const howlRef = React.useRef<Howl>();

    React.useEffect(() => {
        if (url == null) {
            return;
        }

        const howl = new Howl({
            src: [url],
            loop: false,
            volume: volumeRef.current,
        });
        howlRef.current = howl;
        howl.play();
        setTimeout(() => howl.fade(howl.volume(), 0, fadeout), musicLengthLimit);
        setTimeout(() => howl.stop(), musicLengthLimit + fadeout);
        return (() => {
            howl.fade(howl.volume(), 0, fadeout);
            setTimeout(() => howl.stop(), fadeout);
        });
    }, [url]);

    React.useEffect(() => {
        const howl = howlRef.current;
        if (howl == null) {
            return;
        }
        howl.volume(volume);
    }, [volume]);

    return null;
};

export default PlaySoundEffectBehavior;