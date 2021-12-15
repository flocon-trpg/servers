import React from 'react';
import { ExpiryMap } from '../utils/file/expiryMap';

// ExpiryMapが操作されても、原則として常に参照は変わらないことに注意！
export const FirebaseStorageUrlCacheContext = React.createContext<ExpiryMap<string, string> | null>(
    null
);
