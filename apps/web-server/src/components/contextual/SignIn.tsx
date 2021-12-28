// firebaseuiは内部でwindowを使っているようで、next.jsだとpages内のどこかでimportするだけで"ReferenceError: window is not defined"というエラーがビルド時に出る。
// そこで、dynamic loadingを使うことで回避している。https://dev.to/vvo/how-to-solve-window-is-not-defined-errors-in-react-and-next-js-5f97
// dynamicはReactのComponentをimportする際にしか使えないようなので、ここでComponentを定義して、それをdynamic loadingするようにしている。

import React from 'react';
import {
    EmailAuthProvider,
    FacebookAuthProvider,
    GithubAuthProvider,
    GoogleAuthProvider,
    PhoneAuthProvider,
    TwitterAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    AuthProvider,
    signInAnonymously,
    linkWithCredential,
    linkWithPopup,
    fetchSignInMethodsForEmail,
} from 'firebase/auth';
import {
    anonymous,
    email,
    facebook,
    github,
    google,
    NEXT_PUBLIC_AUTH_PROVIDERS,
    phone,
    twitter,
} from '../../env';
import { useWebConfig } from '../../hooks/useWebConfig';
import { Alert, Button, Form, Input, Tooltip } from 'antd';
import { Center } from '../ui/Center';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { flex, flexColumn, flexRow } from '../../utils/className';
import { useAtomValue } from 'jotai/utils';
import { firebaseAuthAtom } from '../../pages/_app';
import { atom, useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';

const displayName = 'new user';
const formWidth = 400;

type Error = {
    code: string;
    message: string;
};

const errorAtom = atom<Error | string | undefined>(undefined);
const isSubmittingAtom = atom(false);
const emailModeAtom = atom(false);

const useLoginWithAuthProvider = () => {
    const auth = useAtomValue(firebaseAuthAtom);
    const router = useRouter();
    const setError = useUpdateAtom(errorAtom);
    const result = React.useCallback(
        async (provider: AuthProvider) => {
            if (auth == null) {
                return;
            }
            if (auth.currentUser?.isAnonymous === true) {
                await linkWithPopup(auth.currentUser, provider)
                    .then(() => {
                        setError(undefined);
                        router.push('/');
                    })
                    .catch((error: Error) => {
                        setError(error);
                    });
                return;
            }
            await signInWithPopup(auth, provider)
                .then(result => {
                    updateProfile(result.user, { displayName, photoURL: null });
                    setError(undefined);
                    router.push('/');
                })
                .catch((error: Error) => {
                    setError(error);
                });
        },
        [auth, router, setError]
    );
    return result;
};

const Email: React.FC = () => {
    const labelCol = 8;
    const wrapperCol = 16;

    const router = useRouter();
    const setError = useUpdateAtom(errorAtom);
    const [isSubmitting, setIsSubmitting] = useAtom(isSubmittingAtom);
    const setEmailMode = useUpdateAtom(emailModeAtom);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const auth = useAtomValue(firebaseAuthAtom);

    if (auth == null) {
        return null;
    }

    return (
        <Form
            name='mailForm'
            labelCol={{ span: labelCol }}
            wrapperCol={{ span: wrapperCol }}
            initialValues={{ remember: true }}
            style={{ width: formWidth }}
        >
            <Form.Item label='メールアドレス' name='email'>
                <Input
                    name='emailInput'
                    value={email}
                    onChange={e => {
                        setEmail(e.target.value);
                    }}
                />
            </Form.Item>

            <Form.Item label='パスワード' name='password'>
                <Input.Password value={password} onChange={e => setPassword(e.target.value)} />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: labelCol, span: wrapperCol }}>
                <div className={classNames(flex, flexRow)}>
                    {auth.currentUser?.isAnonymous === true && (
                        <Button
                            onClick={async () => {
                                if (auth.currentUser == null) {
                                    return;
                                }
                                const credential = EmailAuthProvider.credential(email, password);
                                await linkWithCredential(auth.currentUser, credential)
                                    .then(() => {
                                        setError(undefined);
                                        router.push('/');
                                    })
                                    .catch((err: Error) => setError(err));
                            }}
                        />
                    )}
                    <Button
                        disabled={isSubmitting}
                        onClick={async () => {
                            setIsSubmitting(true);
                            await createUserWithEmailAndPassword(auth, email, password)
                                .then(async cred => {
                                    const user = cred.user;
                                    //await sendEmailVerification(user);
                                    await updateProfile(user, {
                                        displayName,
                                        photoURL: null,
                                    });
                                    setError(undefined);
                                    router.push('/');
                                })
                                .catch((err: Error) => setError(err))
                                .finally(() => setIsSubmitting(false));
                        }}
                    >
                        アカウント作成
                    </Button>
                    <Button
                        disabled={isSubmitting}
                        onClick={async () => {
                            setIsSubmitting(true);

                            const signInMethods = await fetchSignInMethodsForEmail(
                                auth,
                                email
                            ).catch((err: Error) => {
                                console.error('fetchSignInMethodsForEmail', err);
                                return null;
                            });

                            await signInWithEmailAndPassword(auth, email, password)
                                .then(() => {
                                    setError(undefined);
                                    router.push('/');
                                })
                                .catch(async (err: Error) => {
                                    setIsSubmitting(false);
                                    setError(err);

                                    if (signInMethods == null) {
                                        return;
                                    }

                                    // とあるメールアドレスxがあるとする。以下の手順を踏んだ際、xを用いてsignInWithEmailAndPasswordを実行してもauth/wrong-passwordが常に返されてログインできなくなる。https://github.com/firebase/firebaseui-web/issues/122
                                    // 1. メールアドレス・パスワード方式でxのアカウントを作成
                                    // 2. xをverifyしない（Floconでは現時点ではverifyする手段はないため、2の条件は常に満たされる）
                                    // 3. xを用いてGoogleアカウントでログイン
                                    // もし2でverifyしていればxはメールアドレス・パスワードとGoogleアカウントの2つがリンクされたアカウントとなるが、verifyしない場合は3の時点でGoogleアカウントのみがリンクされた状態になる。
                                    // firebaseuiはこの場合に自動的にGoogleアカウントでログインするのでユーザーフレンドリーである。そのためFloconでもなるべく再現するようにしている。
                                    if (
                                        signInMethods.every(
                                            method =>
                                                method !==
                                                EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD
                                        )
                                    ) {
                                        if (
                                            signInMethods.includes(
                                                GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD
                                            )
                                        ) {
                                            setError(
                                                '指定されたメールアドレスは「メールアドレス・パスワード」でログインすることはできません。代わりに「Googleアカウント」でログインしてください。'
                                            );
                                            setEmailMode(false);
                                            return;
                                        }
                                    }
                                })
                                .finally(() => setIsSubmitting(false));
                        }}
                    >
                        ログイン
                    </Button>
                </div>
            </Form.Item>
        </Form>
    );
};

const areProvidersEmpty = (providers: string[]): boolean => {
    if (providers.includes(anonymous)) {
        return false;
    }
    if (providers.includes(email)) {
        return false;
    }
    if (providers.includes(facebook)) {
        return false;
    }
    if (providers.includes(github)) {
        return false;
    }
    if (providers.includes(google)) {
        return false;
    }
    if (providers.includes(phone)) {
        return false;
    }
    if (providers.includes(twitter)) {
        return false;
    }
    return true;
};

export const SignIn: React.FC = () => {
    const setIsSubmitting = useUpdateAtom(isSubmittingAtom);
    React.useEffect(() => {
        setIsSubmitting(false);
    }, [setIsSubmitting]);

    const config = useWebConfig();
    const router = useRouter();
    const setError = useUpdateAtom(errorAtom);
    const auth = useAtomValue(firebaseAuthAtom);
    const [emailMode, setEmailMode] = useAtom(emailModeAtom);
    let authError: Error | string | undefined = useAtomValue(errorAtom);

    const googleProvider = React.useMemo(() => new GoogleAuthProvider(), []);
    const facebookProvider = React.useMemo(() => new FacebookAuthProvider(), []);
    const githubProvider = React.useMemo(() => new GithubAuthProvider(), []);
    const phoneProvider = React.useMemo(
        () => (auth == null ? undefined : new PhoneAuthProvider(auth)),
        [auth]
    );
    const twitterProvider = React.useMemo(() => new TwitterAuthProvider(), []);

    const loginWithAuthProvider = useLoginWithAuthProvider();

    if (config?.isError === true) {
        return <div>{config.error}</div>;
    }

    if (config?.value === undefined || auth == null) {
        return <div>Firebase のサービスを準備しています…</div>;
    }

    if (areProvidersEmpty(config.value.authProviders)) {
        authError = `エラー: config 内の ${NEXT_PUBLIC_AUTH_PROVIDERS} でログインプロバイダが1つも指定されていないため、ログインできません。この問題を解決するには、サーバー管理者に問い合わせてください。`;
    }

    let authUI: JSX.Element;
    if (emailMode) {
        authUI = <Email />;
    } else {
        authUI = (
            <>
                <Button onClick={() => setEmailMode(true)}>メールアドレス・パスワード</Button>
                <Button onClick={() => loginWithAuthProvider(googleProvider)}>
                    Googleアカウント
                </Button>
                <Button onClick={() => loginWithAuthProvider(twitterProvider)}>
                    Twitterアカウント
                </Button>
                <Button onClick={() => loginWithAuthProvider(facebookProvider)}>
                    Facebookアカウント
                </Button>
                <Button onClick={() => loginWithAuthProvider(githubProvider)}>
                    GitHubアカウント
                </Button>
                <Button
                    onClick={() =>
                        phoneProvider == null ? undefined : loginWithAuthProvider(phoneProvider)
                    }
                >
                    電話認証
                </Button>
                <Tooltip title='アカウントを作成せずに匿名でログインします。匿名ユーザーのデータは消失しやすいため、あくまでお試しとして使うことを推奨します。非匿名アカウントに後からアップグレードすることもできます。'>
                    <Button
                        onClick={() => {
                            signInAnonymously(auth)
                                .then(result => {
                                    updateProfile(result.user, { displayName, photoURL: null });
                                    setError(undefined);
                                    router.push('/');
                                })
                                .catch((error: Error) => {
                                    setError(error);
                                });
                        }}
                    >
                        匿名認証
                    </Button>
                </Tooltip>
            </>
        );
    }

    return (
        <Center>
            <div style={{ padding: 24 }} className={classNames(flex, flexColumn)}>
                {authError != null && (
                    <Center>
                        <Alert
                            style={{ width: formWidth, marginBottom: 16 }}
                            type='error'
                            showIcon
                            message={
                                typeof authError === 'string'
                                    ? authError
                                    : `${authError.code}: ${authError.message}`
                            }
                        />
                    </Center>
                )}
                {authUI}
            </div>
        </Center>
    );
};
