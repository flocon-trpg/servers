import { updateProfile } from '@firebase/auth';
import { Alert, Button, Card, Form, Input, Spin } from 'antd';
import { useAtomValue } from 'jotai';
import React from 'react';
import { Center } from '../../ui/Center/Center';
import { Layout, login } from '../../ui/Layout/Layout';
import { HelpMessageTooltip } from '@/components/ui/HelpMessageTooltip/HelpMessageTooltip';
import { firebaseUserValueAtom } from '@/hooks/useSetupApp';

const labelCol = 10;
const wrapperCol = 24 - labelCol;

export const ProfilePage: React.FC = () => {
    const firebaseUser = useAtomValue(firebaseUserValueAtom);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitErrorMessage, setSubmitErrorMessage] = React.useState<string>();
    // undefined ならば User を取得中。null ならば User.displayName === null。
    const [displayName, setDisplayName] = React.useState<string | null>();
    React.useEffect(() => {
        if (firebaseUser == null) {
            return;
        }
        setDisplayName(firebaseUser.displayName);
    }, [firebaseUser]);

    if (firebaseUser == null) {
        return null;
    }

    const form = (
        <Form
            name='createRoom'
            labelCol={{ span: labelCol }}
            wrapperCol={{ span: wrapperCol }}
            style={{ width: 600 }}
            onFinish={() => {
                setIsSubmitting(true);
                updateProfile(firebaseUser, { displayName })
                    .catch((err: unknown) => {
                        if (err instanceof Error) {
                            setSubmitErrorMessage(err.message);
                            return;
                        }
                        setSubmitErrorMessage('不明なエラーが発生しました。');
                    })
                    .finally(() => setIsSubmitting(false));
            }}
        >
            <Form.Item
                label={
                    <HelpMessageTooltip
                        title={
                            <div>
                                <p>{'アカウントのユーザー名を変更できます。'}</p>
                                <p>
                                    {
                                        'Flocon ではユーザー名が使われる場面は少ないため、適当でも構いません。'
                                    }
                                </p>
                                <p></p>
                                {
                                    'ただし、自分のユーザー名は他のユーザーに見られる可能性があるため、ユーザー名には個人情報などに関わる情報を含めないことを推奨します。'
                                }
                            </div>
                        }
                    >
                        {'ユーザー名'}
                    </HelpMessageTooltip>
                }
            >
                <Input
                    disabled={displayName === undefined}
                    value={displayName ?? ''}
                    onChange={e => {
                        setDisplayName(e.target.value);
                    }}
                />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: labelCol, span: wrapperCol }}>
                <Button disabled={isSubmitting} type='primary' htmlType='submit'>
                    更新
                </Button>
                {isSubmitting ? <Spin /> : null}
                {submitErrorMessage == null ? null : (
                    <Alert message={submitErrorMessage} type='error' showIcon />
                )}
            </Form.Item>
        </Form>
    );

    return (
        <Layout requires={login}>
            <Center setPaddingY>
                <Card title='ユーザー情報の変更'>{form}</Card>
            </Center>
        </Layout>
    );
};
