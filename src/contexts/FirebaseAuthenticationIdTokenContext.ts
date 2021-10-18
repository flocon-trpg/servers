import React from 'react';

// この値がnull ⇔ ApolloClientにおけるAuthorizationヘッダーなどが空（= API serverにおいて、Firebase Authenticationでログインしていないと判断される）
export const FirebaseAuthenticationIdTokenContext = React.createContext<
    (() => Promise<string>) | null
>(null);
