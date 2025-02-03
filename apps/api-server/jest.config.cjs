// もともとは cjs ではなく ts だったが、ts-node を install したのにも関わらず `Jest: 'ts-node' is required for the TypeScript configuration files. Make sure it is installed` というエラーが出たので、原因が特定されるまで cjs を使うことにした

module.exports = async () => {
    return {
        collectCoverageFrom: ['**/*.(t|j)s'],
        coverageDirectory: '../coverage',
        moduleFileExtensions: ['js', 'json', 'ts'],
        rootDir: 'src',
        testEnvironment: 'node',
        testRegex: '.*\\.(test|spec)\\.ts$',
        transform: {
            '^.+\\.ts$': 'ts-jest',
        },
        setupFilesAfterEnv: ['jest-extended/all'],
    };
};
