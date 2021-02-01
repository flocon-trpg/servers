// https://github.com/konvajs/use-image からsizeが欲しいのでfork。
// sizeがないと画像が最大の大きさで読み込まれてしまい、react-konvaのImageでwidthやheightを設定しても画像が拡大/縮小されないため。
// それとこれはTypescriptで書いているので型が付いているというメリットもある。
//
// どうもFirefoxではCSSにwidthとheightが指定されていないとSVG画像が表示されないバグがある模様なので要注意!
// 普通に<img/>から表示するぶんには問題ないが、useImageの関数内のような呼び方だと表示されない。

import React from 'react';
import { FilePathFragment, FileSourceType } from '../generated/graphql';
import firebase from 'firebase/app';
import { getStorage, getStorageForce } from '../utils/firebaseHelpers';
import ConfigContext from '../contexts/ConfigContext';
import { useFirebaseStorageUrl } from './firebaseStorage';

type Size = {
    w: number;
    h: number;
}

export const loading = 'loading';
export const success = 'success';
export const failed = 'failed';
export const argNull = 'argNull';

type LoadingState = {
    type: typeof loading;
}

type SuccessState = {
    type: typeof success;
    image: HTMLImageElement;
}

type FailedState = {
    type: typeof failed;
    errorMessage: string;
}

type ArgNullState = {
    type: typeof argNull;
}

type State = LoadingState | SuccessState | FailedState | ArgNullState;

export function useImage(src: string | null, size?: Size, crossOrigin?: string): State {
    const [state, setState] = React.useState(null as State | null);

    React.useEffect(
        function () {
            if (src == null) {
                setState({type: argNull});
                return;
            }
            const img = document.createElement('img');
            if (size != null) {
                img.width = size.w;
                img.height = size.h;
            }

            function onload() {
                setState({ type: success, image: img });
            }

            function onerror(ev: ErrorEvent) {
                setState({ type: failed, errorMessage: ev.message });
            }

            setState({ type: loading });
            img.addEventListener('load', onload);
            img.addEventListener('error', onerror);
            crossOrigin && (img.crossOrigin = crossOrigin);
            img.src = src;

            return function cleanup() {
                img.removeEventListener('load', onload);
                img.removeEventListener('error', onerror);
                setState(null);
            };
        },

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [src, crossOrigin, size?.w, size?.h]
    );

    return state ?? { type: loading };
}

export function useImageFromGraphQL(filePath: FilePathFragment | null | undefined, crossOrigin?: string): State {
    const src = useFirebaseStorageUrl(filePath);

    return useImage(src, undefined, crossOrigin);
}