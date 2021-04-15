import React from 'react';
import { Howl } from 'howler';
import { StrIndex5 } from '../@shared/indexes';
import { useDeepCompareEffectNoCheck } from 'use-deep-compare-effect';
import { useFirebaseStorageUrlArray } from '../hooks/firebaseStorage';
import { __ } from '../@shared/collection';
import { RoomBgm } from '../stateManagers/states/roomBgm';
import { useSelector } from '../store';
import { defaultChannelVolume, defaultMasterVolume } from '../states/RoomConfig';
import { volumeCap } from '../utils/variables';

type PlayBgmBehaviorCoreProps = {
    bgm: RoomBgm.State | null;
    volumeConfig: number;
}

const PlayBgmBehaviorCore: React.FC<PlayBgmBehaviorCoreProps> = ({ bgm, volumeConfig }: PlayBgmBehaviorCoreProps) => {
    const getVolume = () => {
        return (bgm?.volume ?? 1) * volumeConfig;
    };
    const volume = getVolume();
    const volumeRef = React.useRef(volume);
    React.useEffect(() => {
        volumeRef.current = volume;
    }, [volume]);

    const urlArray = useFirebaseStorageUrlArray(bgm?.files);
    const howlRef = React.useRef<Howl>();

    useDeepCompareEffectNoCheck(() => {
        if (urlArray == null || volumeRef == null) {
            return;
        }

        const src = __(urlArray).compact(x => x).toArray();
        if (src.length === 0) {
            return;
        }
        const howl = new Howl({
            src,
            loop: true,
            volume: Math.max(volumeRef.current, volumeCap),
        });
        howlRef.current = howl;
        howl.play();
        return (() => {
            howl.fade(howl.volume(), 0, 1000);
            setTimeout(() => howl.stop(), 1000);
        });
    }, [urlArray, volumeRef]);

    React.useEffect(() => {
        const howl = howlRef.current;
        if (howl == null) {
            return;
        }
        howl.volume(Math.max(volume, volumeCap));
    }, [volume]);

    return null;
};

type Props = {
    bgms: ReadonlyMap<StrIndex5, RoomBgm.State>;
}

const PlayBgmBehavior: React.FC<Props> = ({ bgms }: Props) => {
    const masterVolume = useSelector(state => state.roomConfigModule?.masterVolume) ?? defaultMasterVolume;
    const channelVolumes = useSelector(state => state.roomConfigModule?.channelVolumes) ?? {};

    return (
        <div>
            {[...bgms].map(([key, bgm]) => <PlayBgmBehaviorCore key={key} bgm={bgm} volumeConfig={masterVolume * (channelVolumes[key] ?? defaultChannelVolume)} />)}
        </div>
    );
};

export default PlayBgmBehavior;