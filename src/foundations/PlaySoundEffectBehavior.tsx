import React from 'react';
import { Howl } from 'howler';
import { useDeepCompareEffectNoCheck } from 'use-deep-compare-effect';
import { useFirebaseStorageUrl } from '../hooks/firebaseStorage';
import { FilePathFragment } from '../generated/graphql';
import { useSelector } from '../store';

// 長過ぎる曲をSEにしようとした場合、何もしないと部屋に再入室しない限りその曲を止めることができない。それを防ぐため、最大15秒までしか流れないようにしている。15秒という長さは適当。
const musicLengthLimit = 15 * 1000;
const fadeout = 1 * 1000;

type PlaySoundEffectProps = {
    value?: {
        filePath: FilePathFragment;
        volume: number;

        // これがないと、同じSEを複数回流そうとしたとき、urlが変わらないため2回目以降のSEが流れない。これがあることでdepsの中身が変わり、SEが複数回流れるようになる。
        // depsの中身を変えるだけであればなんでもいいが、messageIdが使いやすいと思って採用している。
        messageId: string;
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
    }, [url, value?.messageId]);

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