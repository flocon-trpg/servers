import * as React from 'react';
import { useFirebaseUser } from './useFirebaseUser';

export const useIdToken = () => {
    const user = useFirebaseUser();
    const [result, setResult] = React.useState<string>();
    React.useEffect(() => {
        console.log('user is updated: %o', user);
        if (typeof user === 'string') {
            setResult(undefined);
            return;
        }
        user.getIdToken().then(idToken => {
            console.log('idToken is updated');
            setResult(idToken);
        });
    }, [user]);
    return result;
};
