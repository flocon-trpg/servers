import { Result } from '@kizahasi/result';
import { initializeLogger } from '../src/logger';

// Loggerが必要なテストは import './beforeAllGlobal' としてloggerをinitializeする必要がある。

let isInitialized = false;

if (!isInitialized) {
    initializeLogger(Result.ok({ logFormat: 'json', logLevel: 'error' }));
    isInitialized = true;
}
