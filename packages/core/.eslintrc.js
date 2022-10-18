module.exports = {
    extends: ['@flocon-trpg/eslint-config'],
    parserOptions: {
        project: './tsconfig.json',
        // vscodeのeslintが正常に動くようにtsconfigRootDirを設定している
        tsconfigRootDir: __dirname,
        // vscodeのeslintが正常に動くようにtsconfigRootDirを設定している
        tsconfigRootDir: __dirname,
    },
};
