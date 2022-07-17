/*
This file includes a modified copy of https://github.com/konvajs/use-image , whose author is lavrton.
The license of https://github.com/konvajs/use-image is as follows:


MIT License

Copyright (c) 2019

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// https://github.com/konvajs/use-image からsizeが欲しかったので改変。
// sizeがないと画像が最大の大きさで読み込まれてしまい、react-konvaのImageでwidthやheightを設定しても画像が拡大/縮小されないため。
// それとこれはTypescriptで書いているので型が付いているというメリットもある。
//
// どうもFirefoxではCSSにwidthとheightが指定されていないとSVG画像が表示されないバグがある模様なので要注意!
// 普通に<img/>から表示するぶんには問題ないが、useImageの関数内のような呼び方だと表示されない。

import { State as S, filePathTemplate } from '@flocon-trpg/core';
import React from 'react';
import { FilePathFragment } from '@flocon-trpg/typed-document-node-v0.7.1';
import { analyzeUrl } from '../utils/analyzeUrl';
import { useSrcFromGraphQL } from './srcHooks';

type Size = {
    w: number;
    h: number;
};

export const loading = 'loading';
export const success = 'success';
export const failure = 'failure';
export const argNull = 'argNull';

type LoadingState = {
    type: typeof loading;
};

type SuccessState = {
    type: typeof success;
    image: HTMLImageElement;
};

type FailedState = {
    type: typeof failure;
    errorMessage: string;
};

type ArgNullState = {
    type: typeof argNull;
};

type State = LoadingState | SuccessState | FailedState | ArgNullState;

export function useImage(
    src: string | null,
    options?: { skipAnalyzeUrl?: boolean; size?: Size; crossOrigin?: string }
): State {
    const [state, setState] = React.useState(null as State | null);
    const skipAnalyzeUrl = options?.skipAnalyzeUrl ?? false;
    const size = options?.size;
    const crossOrigin = options?.crossOrigin;

    React.useEffect(
        function () {
            if (src == null) {
                setState({ type: argNull });
                return;
            }
            const img = document.createElement('img');
            if (size?.w != null) {
                img.width = size.w;
            }
            if (size?.h != null) {
                img.height = size.h;
            }

            function onload() {
                setState({ type: success, image: img });
            }

            function onerror(ev: ErrorEvent) {
                setState({ type: failure, errorMessage: ev.message });
            }

            setState({ type: loading });
            img.addEventListener('load', onload);
            img.addEventListener('error', onerror);
            crossOrigin && (img.crossOrigin = crossOrigin);
            if (skipAnalyzeUrl) {
                img.src = src;
            } else {
                const url = analyzeUrl(src);
                if (url != null) {
                    img.src = url.directLink;
                }
            }

            return function cleanup() {
                img.removeEventListener('load', onload);
                img.removeEventListener('error', onerror);
                setState(null);
            };
        },
        [src, crossOrigin, size?.w, size?.h, skipAnalyzeUrl]
    );

    return state ?? { type: loading };
}

export function useImageFromGraphQL(
    filePath: FilePathFragment | S<typeof filePathTemplate> | null | undefined,
    crossOrigin?: string
): State {
    const { src } = useSrcFromGraphQL(filePath);

    return useImage(src ?? null, { crossOrigin });
}
