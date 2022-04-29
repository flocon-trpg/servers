import React, { PropsWithChildren } from 'react';
import { useRouter } from 'next/router';
import {
    Alert,
    Layout as AntdLayout,
    Button,
    Card,
    Col,
    Form,
    Input,
    Result,
    Row,
    Space,
    Spin,
} from 'antd';
import {
    AmIAdminDocument,
    EntryToServerDocument,
    EntryToServerResultType,
    IsEntryDocument,
    IsEntryQuery,
    IsEntryQueryVariables,
} from '@flocon-trpg/typed-document-node';
import { Center } from './Center';
import Link from 'next/link';
import { NotSignInResult } from './result/NotSignInResult';
import { LoadingResult } from './result/LoadingResult';
import * as Icon from '@ant-design/icons';
import { useSignOut } from '../../hooks/useSignOut';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { MyAuthContext, authNotFound, loading, notSignIn } from '../../contexts/MyAuthContext';
import { FirebaseAuthenticationIdTokenContext } from '../../contexts/FirebaseAuthenticationIdTokenContext';
const { Header, Content } = AntdLayout;

type EntryFormComponentProps = {
    // entryが成功したときに呼び出される。
    onEntry: (() => void) | undefined;
};

const EntryFormComponent: React.FC<EntryFormComponentProps> = (props: EntryFormComponentProps) => {
    const [entryToServer, entryToServerResult] = useMutation(EntryToServerDocument);
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
    const [isFinishedSuccessfully, setIsFinishedSuccessfully] = React.useState<boolean>(false);

    const passwordName = 'password';

    return (
        <Form
            name='entryPassword'
            onFinish={e => {
                if (isSubmitting || isFinishedSuccessfully) {
                    return;
                }
                const password: string = e[passwordName];
                setIsSubmitting(true);
                entryToServer({ variables: { password } }).then(r => {
                    const resultType = r.data?.result.type;
                    if (resultType == null) {
                        return;
                    }
                    if (resultType === EntryToServerResultType.WrongPassword) {
                        setIsSubmitting(false);
                        return;
                    }
                    if (props.onEntry == null) {
                        setIsSubmitting(false);
                        return;
                    }
                    setIsSubmitting(false);
                    setIsFinishedSuccessfully(true);
                    props.onEntry();
                });
            }}
        >
            <Form.Item label='password' name={passwordName}>
                <Input.Password />
            </Form.Item>

            <Form.Item>
                <Button
                    disabled={isSubmitting || isFinishedSuccessfully}
                    type='primary'
                    htmlType='submit'
                >
                    Submit
                </Button>
                {isSubmitting ? <Spin /> : null}
                {entryToServerResult?.data?.result.type ===
                EntryToServerResultType.WrongPassword ? (
                    <Alert message='wrong password' type='error' showIcon />
                ) : null}
                {entryToServerResult?.error == null ? null : (
                    <Alert message={entryToServerResult.error.message} type='error' showIcon />
                )}
                {isFinishedSuccessfully ? (
                    <Alert message='success' type='success' showIcon />
                ) : null}
            </Form.Item>
        </Form>
    );
};

export const login = 'login';
export const loginAndEntry = 'loginAndEntry';
export const always = 'always';
export const success = 'success';

type Props = {
    requires?: typeof login | typeof loginAndEntry;

    // EntryFormでのentryが成功したときに呼び出される。
    onEntry?: () => void;

    hideHeader?: typeof always | typeof success;
};

export const Layout: React.FC<PropsWithChildren<Props>> = ({
    children,
    onEntry,
    requires,
    hideHeader: hideHeaderProp,
}: PropsWithChildren<Props>) => {
    const router = useRouter();
    const amIAdminQueryResult = useQuery(AmIAdminDocument);
    const myAuth = React.useContext(MyAuthContext);
    const myUserUid = typeof myAuth === 'string' ? null : myAuth.uid;
    const isAnonymous = typeof myAuth === 'string' ? false : myAuth.isAnonymous;
    const apolloClient = useApolloClient();
    const signOut = useSignOut();
    const [isEntry, setIsEntry] = React.useState<
        'notRequired' | 'loading' | { type: 'error'; error: Error } | boolean
    >('loading');
    const getIdToken = React.useContext(FirebaseAuthenticationIdTokenContext);
    const hasIdToken = getIdToken != null;
    const requiresEntry = requires === loginAndEntry;
    React.useEffect(() => {
        if (requiresEntry && myUserUid != null) {
            if (!hasIdToken) {
                setIsEntry('loading');
                return;
            }
            let unsubscribed = false;
            apolloClient
                .query<IsEntryQuery, IsEntryQueryVariables>({
                    query: IsEntryDocument,
                    fetchPolicy: 'network-only',
                })
                .then(queryResult => {
                    if (unsubscribed) {
                        return;
                    }
                    setIsEntry(queryResult.data.result);
                })
                .catch(e => {
                    if (e instanceof Error) {
                        setIsEntry({ type: 'error', error: e });
                        return;
                    }
                    throw e;
                });
            return () => {
                unsubscribed = true;
            };
        }
        setIsEntry('notRequired');
    }, [requiresEntry, myUserUid, apolloClient, hasIdToken]);

    const getChildren = (): React.ReactNode => {
        if (typeof children === 'function') {
            return children();
        }
        return children;
    };

    if (myAuth === authNotFound) {
        return (
            <Result status='info' title='Firebase Authentication インスタンスが見つかりません。' />
        );
    }

    let showChildren = false;
    const content = (() => {
        if (requires == null) {
            showChildren = true;
            return getChildren();
        }
        if (myAuth === loading) {
            return <LoadingResult title='Firebase Authentication による認証を行っています…' />;
        }
        if (myAuth === notSignIn) {
            return <NotSignInResult />;
        }
        switch (isEntry) {
            case 'loading':
                return (
                    <LoadingResult
                        title='エントリーの有無を確認しています…'
                        // APIサーバーをHeroku Freeプランで運用している場合はスリープが解除されるまで待たされることがあるため、それに対応した文章としている。特に公式サーバーの利用者を念頭に置いている。
                        subTitle='完了までに十数秒程度かかることがあります。しばらくお待ちください…'
                    />
                );
            case false:
                return (
                    <Center>
                        <Card title='エントリーパスワードの入力'>
                            <EntryFormComponent
                                onEntry={() => {
                                    setIsEntry(true);
                                    if (onEntry != null) {
                                        onEntry();
                                    }
                                }}
                            />
                        </Card>
                    </Center>
                );
            case true:
            case 'notRequired':
                break;
            default:
                return <Result status='error' title='APIエラー' subTitle={isEntry.error.message} />;
        }
        showChildren = true;
        return getChildren();
    })();

    let hideHeader: boolean;
    switch (hideHeaderProp) {
        case always:
            hideHeader = true;
            break;
        case success:
            hideHeader = showChildren;
            break;
        default:
            hideHeader = false;
    }

    return (
        <AntdLayout style={{ height: '100vh' }}>
            {!hideHeader && (
                <Header>
                    <Row>
                        <Col flex={0}>
                            <Link href='/'>
                                <img
                                    style={{ cursor: 'pointer' }}
                                    src='/assets/logo.png'
                                    width={32}
                                    height={32}
                                />
                            </Link>
                        </Col>
                        <Col flex={1} />
                        <Col flex={0}>
                            <Space>
                                {/* UserOutlinedを付けている理由は、room/[id] を開いたときにヘッダーを隠して代わりにメニューにユーザーを表示する仕組みであり、そちらのユーザー名のほうにもUserOutlinedを付けることでそれがユーザー名だということが連想され、入室時の名前と区別させやすくなるようにするため。 */}
                                {typeof myAuth === 'string' ? null : <Icon.UserOutlined />}
                                {typeof myAuth === 'string' ? null : (
                                    <div style={{ color: 'white' }}>
                                        {myAuth.displayName} - {myAuth.uid}
                                        {amIAdminQueryResult.data == null ? null : ' (管理者)'}
                                    </div>
                                )}
                                {typeof myAuth === 'string' ? (
                                    <Button key='2' onClick={() => router.push('/signin')}>
                                        ログイン/ユーザー登録
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            key='1'
                                            href='/profile'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                        >
                                            ユーザー名を変更する
                                        </Button>
                                        {isAnonymous && (
                                            <Button key='2' onClick={() => router.push('/signin')}>
                                                非匿名アカウントに変換する
                                            </Button>
                                        )}
                                        <Button key='3' onClick={() => signOut()}>
                                            ログアウト
                                        </Button>
                                    </>
                                )}
                            </Space>
                        </Col>
                    </Row>
                </Header>
            )}
            <Content>{content}</Content>
        </AntdLayout>
    );
};
