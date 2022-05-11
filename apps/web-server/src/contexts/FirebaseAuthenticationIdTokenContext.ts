import React from 'react';

// CONSIDER: Contextをやめてjotaiに移行するべきか？

// この値がnull ⇔ ApolloClientにおけるAuthorizationヘッダーなどが空（= API serverにおいて、Firebase Authenticationでログインしていないと判断される）
export const FirebaseAuthenticationIdTokenContext = React.createContext<
    (() => Promise<string | null>) | null
>(null);
