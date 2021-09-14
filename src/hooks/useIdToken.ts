import * as React from 'react';
import { useFirebaseUser } from './useFirebaseUser';

export const useIdToken = () => {
    const user = useFirebaseUser();
    const [result, setResult] = React.useState<string>();
    React.useEffect(() => {
        if (typeof user === 'string') {
            setResult(undefined);
            return;
        }
        user.getIdToken().then(uid => setResult(uid));
    }, [user]);
    return result;
};
