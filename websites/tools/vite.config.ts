import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { Plugin, defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [TanStackRouterVite(), react(), tsconfigPaths()],

    esbuild: {
        banner: '/*! licenses: ../licenses-npm-package.txt */',
        // licenses-npm-package.txt にライセンス一覧が出力されるため、ライセンスのコメントを出力しないことで JavaScript のファイルサイズを減らしている。
        legalComments: 'none',
    },
});
