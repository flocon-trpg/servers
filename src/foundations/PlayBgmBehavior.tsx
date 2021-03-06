import React, { PropsWithChildren } from 'react';
import { Howl } from 'howler';
import { StrIndex5 } from '../@shared/indexes';
import { useDeepCompareEffectNoCheck } from 'use-deep-compare-effect';
import { useFirebaseStorageUrlArray } from '../hooks/firebaseStorage';
import { __ } from '../@shared/collection';
import { RoomBgm } from '../stateManagers/states/roomBgm';

type PlayBgmBehaviorCoreProps = {
    bgm: RoomBgm.State | null;
}

const PlayBgmBehaviorCore: React.FC<PlayBgmBehaviorCoreProps> = ({ bgm }: PlayBgmBehaviorCoreProps) => {
    const urlArray = useFirebaseStorageUrlArray(bgm?.files);
    const volume = bgm?.volume;

    useDeepCompareEffectNoCheck(() => {
        if (urlArray == null || volume == null) {
            return;
        }

        const src = __(urlArray).compact(x => x).toArray();
        if (src.length === 0) {
            return;
        }
        const howl = new Howl({
            src,
            loop: true,
            volume,
        });
        howl.play();
        return (() => {
            howl.fade(volume, 0, 1000);
            setTimeout(() => howl.stop(), 1000);
        });
    }, [urlArray, volume]);

    return null;
};

type Props = {
    bgms: ReadonlyMap<StrIndex5, RoomBgm.State>;
}

const PlayBgmBehavior: React.FC<Props> = ({ bgms }: Props) => {
    return (
        <div>
            {[...bgms].map(([key, bgm]) => <PlayBgmBehaviorCore key={key} bgm={bgm} />)}
        </div>
    );
};

export default PlayBgmBehavior;