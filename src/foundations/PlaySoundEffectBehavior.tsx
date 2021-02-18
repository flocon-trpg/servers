import React from 'react';
import { Howl } from 'howler';
import { useDeepCompareEffectNoCheck } from 'use-deep-compare-effect';
import { useFirebaseStorageUrl } from '../hooks/firebaseStorage';
import { FilePathFragment } from '../generated/graphql';

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
    const url = useFirebaseStorageUrl(value?.filePath);

    useDeepCompareEffectNoCheck(() => {
        if (url == null || value?.volume == null) {
            return;
        }

        const howl = new Howl({
            src: [url],
            loop: false,
            volume: value.volume,
        });
        howl.play();
        setTimeout(() => howl.fade(value.volume, 0, fadeout), musicLengthLimit);
        setTimeout(() => howl.stop(), musicLengthLimit + fadeout);
        return (() => {
            howl.fade(value.volume, 0, fadeout);
            setTimeout(() => howl.stop(), fadeout);
        });
    }, [url, value?.volume]);

    return null;
};

export default PlaySoundEffectBehavior;