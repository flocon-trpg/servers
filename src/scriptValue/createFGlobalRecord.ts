import { createFRecord } from './createFRecord';
import { FGlobalRecord } from './FGlobalRecord';

// keyが'self'か'globalThis'である要素は無視されることに注意
export function createFGlobalRecord(source: Record<string, unknown>): FGlobalRecord {
    return new FGlobalRecord(createFRecord(source));
}
