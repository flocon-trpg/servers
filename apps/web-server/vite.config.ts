// @ts-check

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [TanStackRouterVite(), react(), tsconfigPaths()],

    // 以前は vite の代わりに Next.js を採用しており、vite での VITE_ に相当するプレフィックスは Next.js では NEXT_PUBLIC_ であったため、例えば Firebase の設定は VITE_FIREBASE_CONFIG ではなく NEXT_PUBLIC_FIREBASE_CONFIG という名前となっていた。このため、Vite でも同じ名前で設定できるように envPrefix を NEXT_PUBLIC_ としている。
    // CONSIDER: 次の改善案がある。
    // 1. NEXT_PUBLIC_ より VITE_ のほうが短いのと、vite が採用されているのにも関わらず環境変数は Next.js 風なのは、人によっては混乱を招き、意図しない環境変数の流出も起こる恐れがあるので、VITE_ にも対応させる。NEXT_PUBLIC_ を将来廃止するかどうかも決める。
    // 2. define (https://vite.dev/config/shared-options.html#envprefix の SECURITY NOTES)を使い、NEXT_PUBLIC_ も VITE_ もない状態でも書けるようにする。ただしその場合は意図しない環境変数の流出を防ぐために FLOCON_ などの独自のプレフィックスを使うほうがよさそうか。
    envPrefix: 'NEXT_PUBLIC_',

    // https://stackoverflow.com/questions/77421447/how-to-solve-require-is-not-defined-in-vite
    build: {
        // これがないとビルドされたファイルを用いて rooms/$id を開いたときに 'require is not defined' というエラーが出る（yarn dev では問題ない）。以前 Next.js を採用していたときに konva が canvas を参照しておりそこに 'const Canvas = require("canvas")' というコードがあってそこで `Error occurred prerendering page "/rooms/[id]". Read more: https://nextjs.org/docs/messages/prerender-error`、`Error: Cannot find module 'canvas'` というエラーが出ていたため、next/dynamic を使うことで回避していた過去がある。Vite の 'require is not defined' のエラーの原因もおそらく同様だと思われるため、transformMixedEsModules で解決できていると考えられる。
        commonjsOptions: { transformMixedEsModules: true },
    },
});
