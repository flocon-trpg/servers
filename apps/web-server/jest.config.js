module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.ts'],

    globals: {
        'ts-jest': {
            useESM: true,

            // これがないとテストした際に@testing-library/reactなどが正常に動かない
            // https://zenn.dev/garypippi/articles/c79cb002e001681a73cd
            tsconfig: './tsconfig.jest.json',
        },
    },
};
