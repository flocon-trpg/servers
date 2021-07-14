import React, { PropsWithChildren } from 'react';
import MyAuthContext from '../contexts/MyAuthContext';
import { useRouter } from 'next/router';
import {
    Button,
    Layout as AntdLayout,
    Row,
    Col,
    Space,
    Form,
    Input,
    Spin,
    Card,
    Alert,
    Result,
} from 'antd';
import { EntryToServerResultType, useEntryToServerMutation } from '../generated/graphql';
import Center from '../components/Center';
import { getAuth } from '../utils/firebaseHelpers';
import Link from 'next/link';
import ConfigContext from '../contexts/ConfigContext';
import NotSignInResult from '../components/Result/NotSignInResult';
import { authNotFound, loading, notSignIn } from '../hooks/useFirebaseUser';
import LoadingResult from '../components/Result/LoadingResult';
import { useDispatch } from 'react-redux';
import roomModule from '../modules/roomModule';
import { fileModule } from '../modules/fileModule';
import { roomDrawerAndPopoverModule } from '../modules/roomDrawerAndPopoverModule';
import * as Icon from '@ant-design/icons';
import { useSignOut } from '../hooks/useSignOut';
const { Header, Content } = AntdLayout;

type EntryFormComponentProps = {
    // entryが成功したときに呼び出される。
    onEntry: (() => void) | undefined;
};

const EntryFormComponent: React.FC<EntryFormComponentProps> = (props: EntryFormComponentProps) => {
    const [entryToServer, entryToServerResult] = useEntryToServerMutation();
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
    const [isFinishedSuccessfully, setIsFinishedSuccessfully] = React.useState<boolean>(false);

    const phraseName = 'phrase';

    return (
        <Form
            name="entryPhrase"
            onFinish={e => {
                if (isSubmitting || isFinishedSuccessfully) {
                    return;
                }
                const phrase: string = e[phraseName];
                setIsSubmitting(true);
                entryToServer({ variables: { phrase } }).then(r => {
                    const resultType = r.data?.result.type;
                    if (resultType == null) {
                        return;
                    }
                    if (resultType === EntryToServerResultType.WrongPhrase) {
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
            <Form.Item label="Phrase" name={phraseName}>
                <Input />
            </Form.Item>

            <Form.Item>
                <Button
                    disabled={isSubmitting || isFinishedSuccessfully}
                    type="primary"
                    htmlType="submit"
                >
                    Submit
                </Button>
                {isSubmitting ? <Spin /> : null}
                {entryToServerResult?.data?.result.type === EntryToServerResultType.WrongPhrase ? (
                    <Alert message="wrong phrase" type="error" showIcon />
                ) : null}
                {entryToServerResult?.error == null ? null : (
                    <Alert message={entryToServerResult.error.message} type="error" showIcon />
                )}
                {isFinishedSuccessfully ? (
                    <Alert message="success" type="success" showIcon />
                ) : null}
            </Form.Item>
        </Form>
    );
};

type Props = {
    requiresLogin: boolean;

    // EntryFormを表示させたいときにtrueを渡す。Entryの有無や必要性はここではチェックされない。
    showEntryForm: boolean;

    // EntryFormでのentryが成功したときに呼び出される。
    onEntry?: () => void;

    hideHeader?: boolean;
};

const Layout: React.FC<PropsWithChildren<Props>> = ({
    children,
    showEntryForm,
    onEntry,
    requiresLogin,
    hideHeader,
}: PropsWithChildren<Props>) => {
    const router = useRouter();
    const myAuth = React.useContext(MyAuthContext);
    const signOut = useSignOut();

    if (myAuth === authNotFound) {
        return (
            <Result status="info" title="Firebase Authentication インスタンスが見つかりません。" />
        );
    }

    const content = (() => {
        if (myAuth === loading) {
            return <LoadingResult title="Firebase Authentication による認証を行っています…" />;
        }
        if (requiresLogin && myAuth === notSignIn) {
            return <NotSignInResult />;
        }
        if (showEntryForm) {
            return (
                <Center>
                    <Card title="サーバーのパスフレーズ入力">
                        <EntryFormComponent onEntry={onEntry} />
                    </Card>
                </Center>
            );
        }
        return children;
    })();

    return (
        <AntdLayout style={{ height: '100vh' }}>
            {!hideHeader && (
                <Header>
                    <Row>
                        <Col flex={0}>
                            <Link href="/">
                                <img
                                    style={{ cursor: 'pointer' }}
                                    src="/logo.png"
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
                                    </div>
                                )}
                                {typeof myAuth === 'string' ? (
                                    <Button key="2" onClick={() => router.push('/signin')}>
                                        Log in
                                    </Button>
                                ) : (
                                    <Button key="2" onClick={() => signOut()}>
                                        Logout
                                    </Button>
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

export default Layout;
