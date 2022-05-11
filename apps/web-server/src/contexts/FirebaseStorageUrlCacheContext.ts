import React from 'react';
import { ExpiryMap } from '../utils/file/expiryMap';

// CONSIDER: Contextをやめてjotaiに移行するべきか？

// ExpiryMapが操作されても、原則として常に参照は変わらないことに注意！
export const FirebaseStorageUrlCacheContext = React.createContext<ExpiryMap<string, string> | null>(
    null
);
