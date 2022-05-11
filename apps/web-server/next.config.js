const defaultConfig = {
    reactStrictMode: true,
    env: {
        customKey: 'test',
    },
};

// https://www.npmjs.com/package/@next/bundle-analyzer
// ANALYZEという環境変数に1もしくはtrueが入っているときにWebpack Bundle Analyzerが実行される。
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: ['true', '1'].includes(process.env.ANALYZE),
});

module.exports = withBundleAnalyzer(defaultConfig);
