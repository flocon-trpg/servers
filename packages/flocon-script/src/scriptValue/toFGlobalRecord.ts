import { FGlobalRecord } from './FGlobalRecord';
import { toFRecord } from './toFRecord';

// keyが'self'か'globalThis'である要素は無視されることに注意
export function toFGlobalRecord(source: Record<string, unknown>): FGlobalRecord {
    return new FGlobalRecord(toFRecord(source));
}
