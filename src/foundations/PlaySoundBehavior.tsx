import React, { PropsWithChildren } from 'react';
import { ApolloError } from '@apollo/client';
import { Alert } from 'antd';
import AlertDialog from './AlertDialog';
import Loading from '../components/alerts/Loading';
import ApolloErrorDialog from '../components/alerts/ApolloError';
import { Howl } from 'howler';
import * as Bgm from '../stateManagers/states/roomBgm';
import { StrIndex5 } from '../@shared/indexes';
import { useDeepCompareEffectNoCheck } from 'use-deep-compare-effect';
import { useFirebaseStorageUrlArray } from '../hooks/firebaseStorage';
import { __ } from '../@shared/collection';

type PlayBgmBehaviorProps = {
    bgm: Bgm.State | null;
}

const PlayBgmBehavior: React.FC<PlayBgmBehaviorProps> = ({ bgm }: PlayBgmBehaviorProps) => {
    const urlArray = useFirebaseStorageUrlArray(bgm?.files);
    const volume = bgm?.volume;

    useDeepCompareEffectNoCheck(() => {
        if (urlArray == null || volume == null) {
            return;
        }

        const howl = new Howl({
            src: __(urlArray).compact(x => x).toArray(),
            loop: true,
        });
        howl.play();
        return (() => {
            howl.stop();
        });
    }, [urlArray, volume]);

    return null;
};

type Props = {
    bgms: ReadonlyMap<StrIndex5, Bgm.State>;
}

const PlaySoundBehavior: React.FC<Props> = ({ bgms }: Props) => {
    return (
        <div>
            {[...bgms].map(([key, bgm]) => <PlayBgmBehavior key={key} bgm={bgm} />)}
        </div>
    );
};

export default PlaySoundBehavior;