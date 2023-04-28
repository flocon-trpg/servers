const defaultConfig = {
    reactStrictMode: true,
    env: {
        customKey: 'test',
    },
    experimental: {
        // （現時点ではコメントのみしか書かれていないが）.babelrc などといったファイルがあると Next.js が SWC を無効化してしまうため、それを防いでいる。
        // https://nextjs.org/docs/messages/swc-disabled
        forceSwcTransforms: true,
    },
};

// https://www.npmjs.com/package/@next/bundle-analyzer
// ANALYZEという環境変数に1もしくはtrueが入っているときにWebpack Bundle Analyzerが実行される。
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: ['true', '1'].includes(process.env.ANALYZE),
});

module.exports = withBundleAnalyzer(defaultConfig);
