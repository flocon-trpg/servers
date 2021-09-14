// firebaseuiは内部でwindowを使っているようで、next.jsだとpages内のどこかでimportするだけで"ReferenceError: window is not defined"というエラーがビルド時に出る。
// そこで、dynamic loadingを使うことで回避している。https://dev.to/vvo/how-to-solve-window-is-not-defined-errors-in-react-and-next-js-5f97
// dynamicはReactのComponentをimportする際にしか使えないみたいなので、signin.tsxでimport firebaseuiは不可能。そのため、ここでComponentを定義して、それをdynamic loadingするようにしている。

import React from 'react';
import firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';
import { getAuth } from '../utils/firebaseHelpers';
import ConfigContext from '../contexts/ConfigContext';
import { EmailAuthProvider } from 'firebase/auth';

const SignInCore: React.FC = () => {
    const config = React.useContext(ConfigContext);
    const auth = getAuth(config);
    const [isLoading, setIsLoading] = React.useState(true);
    const authContainerRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (auth == null || authContainerRef.current == null) {
            return;
        }

        const config: firebaseui.auth.Config = {
            callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                    // User successfully signed in.
                    // Return type determines whether we continue the redirect automatically
                    // or whether we leave that to developer to handle.
                    return true;
                },
                uiShown: function () {
                    // The widget is rendered.
                    // Hide the loader.
                    setIsLoading(false);
                },
            },
            signInSuccessUrl: '/',
            signInOptions: [EmailAuthProvider.PROVIDER_ID],
            // TODO: Terms of service url
            //tosUrl: '<your-tos-url>',
            // TODO: Privacy policy url.
            //privacyPolicyUrl: '<your-privacy-policy-url>'
        };
        const authUI = firebaseui.auth.AuthUI.getInstance() ?? new firebaseui.auth.AuthUI(auth);
        authUI.start(authContainerRef.current, config);
    }, [auth, authContainerRef]);

    return (
        <div>
            <div ref={authContainerRef} />
            <span>{isLoading ? 'loading...' : null}</span>
        </div>
    );
};

export default SignInCore;
