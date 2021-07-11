module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',

    // これがないとテストした際に@testing-library/reactなどが正常に動かない
    // https://zenn.dev/garypippi/articles/c79cb002e001681a73cd
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.jest.json'
        }
    }
};