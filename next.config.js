const defaultConfig = {
    reactStrictMode: true,
    env: {
        customKey: 'test',
    }
};

// https://www.npmjs.com/package/@next/bundle-analyzer
// ANALYZEという環境変数にtrueが入っているときにWebpack Bundle Analyzerが実行される。
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(defaultConfig);