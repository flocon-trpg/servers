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
import { anonymous, email, facebook, github, google, phone, twitter } from '../../env';
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
                .then(async () => {
                    // ソーシャルアカウントによるログインの場合は、アカウントの利用が初めてか否かを判断できないようなので、「初めての場合のみdisplayNameをリセットする」といったことはできない。そのためリセットは行わないようにしている。
                    // なお、result.operationType、result.user.metadataを用いて判定する方法はうまくいかなかった。

                    setError(undefined);
                    await router.push('/');
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
    const onSuccess = React.useCallback(async () => {
        setError(undefined);
        setEmail('');
        setPassword('');
        setEmailMode(false);
        await router.push('/');
    }, [router, setEmailMode, setError]);

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
                    {auth.currentUser?.isAnonymous === true ? (
                        <Button
                            onClick={async () => {
                                if (auth.currentUser == null) {
                                    return;
                                }
                                const credential = EmailAuthProvider.credential(email, password);
                                setIsSubmitting(true);
                                await linkWithCredential(auth.currentUser, credential)
                                    .then(async () => {
                                        await onSuccess();
                                    })
                                    .catch((err: Error) => setError(err))
                                    .finally(() => {
                                        setPassword('');
                                        setIsSubmitting(false);
                                    });
                            }}
                        >
                            非匿名アカウントに変換
                        </Button>
                    ) : (
                        <>
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
                                            await onSuccess();
                                        })
                                        .catch((err: Error) => setError(err))
                                        .finally(() => {
                                            setPassword('');
                                            setIsSubmitting(false);
                                        });
                                }}
                            >
                                アカウント作成
                            </Button>
                            <Button
                                disabled={isSubmitting}
                                onClick={async () => {
                                    setIsSubmitting(true);

                                    const main = async () => {
                                        const signInMethods = await fetchSignInMethodsForEmail(
                                            auth,
                                            email
                                        ).catch((err: Error) => {
                                            console.error('fetchSignInMethodsForEmail', err);
                                            return null;
                                        });

                                        await signInWithEmailAndPassword(auth, email, password)
                                            .then(async () => {
                                                await onSuccess();
                                            })
                                            .catch(async (err: Error) => {
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
                                            });
                                    };

                                    await main().finally(() => {
                                        setPassword('');
                                        setIsSubmitting(false);
                                    });
                                }}
                            >
                                ログイン
                            </Button>
                        </>
                    )}
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
    const authError = useAtomValue(errorAtom);

    const googleProvider = React.useMemo(() => new GoogleAuthProvider(), []);
    const facebookProvider = React.useMemo(() => new FacebookAuthProvider(), []);
    const githubProvider = React.useMemo(() => new GithubAuthProvider(), []);
    const phoneProvider = React.useMemo(
        () => (auth == null ? undefined : new PhoneAuthProvider(auth)),
        [auth]
    );
    const twitterProvider = React.useMemo(() => new TwitterAuthProvider(), []);

    const loginWithAuthProvider = useLoginWithAuthProvider();

    const areProvidersEmptyValue = React.useMemo(() => {
        const authProviders = config?.value?.authProviders ?? [];
        return areProvidersEmpty(authProviders);
    }, [config?.value?.authProviders]);
    const authProviders = config?.value?.authProviders ?? [];

    if (config?.isError === true) {
        return <div>{config.error}</div>;
    }

    if (config?.value === undefined || auth == null) {
        return <div>Firebase のサービスを準備しています…</div>;
    }

    const suffix =
        auth.currentUser?.isAnonymous === true ? 'で非匿名アカウントに変換' : 'でログイン';

    let authUI: JSX.Element;
    if (emailMode) {
        authUI = (
            <>
                <a
                    style={{ marginBottom: 12, marginLeft: 12, alignSelf: 'start' }}
                    onClick={() => setEmailMode(false)}
                >
                    {'< 戻る'}
                </a>
                <Email />
            </>
        );
    } else {
        const margin = 4;
        authUI = (
            <>
                <a
                    style={{ marginBottom: 12, alignSelf: 'start' }}
                    onClick={() => router.push('/')}
                >
                    {'< トップページに戻る'}
                </a>
                {(areProvidersEmptyValue || authProviders.includes(email)) && (
                    <Button style={{ margin }} onClick={() => setEmailMode(true)}>
                        {`メールアドレス・パスワード${suffix}`}
                    </Button>
                )}
                {(areProvidersEmptyValue || authProviders.includes(google)) && (
                    <Button
                        style={{ margin }}
                        onClick={() => loginWithAuthProvider(googleProvider)}
                    >
                        {`Googleアカウント${suffix}`}
                    </Button>
                )}
                {(areProvidersEmptyValue || authProviders.includes(twitter)) && (
                    <Button
                        style={{ margin }}
                        onClick={() => loginWithAuthProvider(twitterProvider)}
                    >
                        {`Twitterアカウント${suffix}`}
                    </Button>
                )}
                {(areProvidersEmptyValue || authProviders.includes(facebook)) && (
                    <Button
                        style={{ margin }}
                        onClick={() => loginWithAuthProvider(facebookProvider)}
                    >
                        {`Facebookアカウント${suffix}`}
                    </Button>
                )}
                {(areProvidersEmptyValue || authProviders.includes(github)) && (
                    <Button
                        style={{ margin }}
                        onClick={() => loginWithAuthProvider(githubProvider)}
                    >
                        {`GitHubアカウント${suffix}`}
                    </Button>
                )}
                {(areProvidersEmptyValue || authProviders.includes(phone)) && (
                    <Button
                        style={{ margin }}
                        onClick={() =>
                            phoneProvider == null ? undefined : loginWithAuthProvider(phoneProvider)
                        }
                    >
                        {`電話認証${suffix}`}
                    </Button>
                )}
                {(areProvidersEmptyValue || authProviders.includes(anonymous)) && (
                    <Tooltip title='アカウントを作成せずに匿名でログインします。匿名ユーザーのデータは消失しやすいため、あくまでお試しとして使うことを推奨します。非匿名アカウントに後からアップグレードすることもできます。'>
                        <Button
                            style={{ margin }}
                            onClick={() => {
                                signInAnonymously(auth)
                                    .then(async result => {
                                        await updateProfile(result.user, {
                                            displayName,
                                            photoURL: null,
                                        });
                                        setError(undefined);
                                        await router.push('/');
                                    })
                                    .catch((error: Error) => {
                                        if (error.code === 'auth/admin-restricted-operation') {
                                            setError(
                                                '匿名認証は有効化されていないため、利用できません。'
                                            );
                                            return;
                                        }
                                        setError(error);
                                    });
                            }}
                        >
                            匿名認証でログイン
                        </Button>
                    </Tooltip>
                )}
            </>
        );
    }

    const authErrorToString = (error: Error | string) => {
        if (typeof error === 'string') {
            return error;
        }
        switch (error.code) {
            case 'auth/operation-not-allowed':
                return '選択したログインプロバイダは有効化されていないため、利用できません。';
            default:
                return error.message;
        }
    };

    return (
        <Center>
            <div style={{ padding: 24 }} className={classNames(flex, flexColumn)}>
                {authError != null && (
                    <Center>
                        <Alert
                            style={{ width: formWidth, marginBottom: 16 }}
                            type='error'
                            showIcon
                            message={authErrorToString(authError)}
                        />
                    </Center>
                )}
                {authUI}
            </div>
        </Center>
    );
};
