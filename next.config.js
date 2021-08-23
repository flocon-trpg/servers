const defaultConfig = {
    // @ltd/j-toml のコードに含まれているNullish coalescing operatorは、webpack 4では正しく認識できず、next.jsが動かなくなる。そのため5を使っている。https://github.com/vercel/next.js/issues/20363
    future: { webpack5: true },
    reactStrictMode: true,
    env: {
        customKey: 'test',
    },
};

// https://www.npmjs.com/package/@next/bundle-analyzer
// ANALYZEという環境変数にtrueが入っているときにWebpack Bundle Analyzerが実行される。
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(defaultConfig);
