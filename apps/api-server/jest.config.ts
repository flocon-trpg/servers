import jest from 'jest';

module.exports = async (): Promise<jest.Config> => {
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
