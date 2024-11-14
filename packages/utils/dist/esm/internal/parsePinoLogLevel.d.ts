import { Result } from '@kizahasi/result';
export type PinoLogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
export declare const parsePinoLogLevel: (source: string, envName: string) => Result<PinoLogLevel>;
//# sourceMappingURL=parsePinoLogLevel.d.ts.map