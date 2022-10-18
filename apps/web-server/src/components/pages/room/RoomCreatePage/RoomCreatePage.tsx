import { CreateRoomDocument, CreateRoomInput } from '@flocon-trpg/typed-document-node-v0.7.1';
import { Alert, Button, Card, Form, Input, Spin, Switch } from 'antd';
import { useAtomValue } from 'jotai';
import { useRouter } from 'next/router';
import React from 'react';
import { useMutation } from 'urql';
import { Center } from '@/components/ui/Center/Center';
import { Layout, loginAndEntry } from '@/components/ui/Layout/Layout';
import { firebaseUserValueAtom } from '@/pages/_app';

const labelCol = 10;
const wrapperCol = 24 - labelCol;

const roomName = 'roomName';
const participantName = 'userName';
const playerPassword = 'playerPassword';
const spectatorPassword = 'spectatorPassword';

export const RoomCreatePage: React.FC = () => {
    const router = useRouter();
    const [createRoomResult, createRoom] = useMutation(CreateRoomDocument);
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
    const [isPlayerPasswordEnabled, setIsPlayerPasswordEnabled] = React.useState<boolean>(false);
    const [isSpectatorPasswordEnabled, setIsSpectatorPasswordEnabled] =
        React.useState<boolean>(false);
    const firebaseUser = useAtomValue(firebaseUserValueAtom);

    // TODO: 横幅などが足りないため、Formで表現するようなものではない気がする。
    const form = (
        <Form
            name='createRoom'
            labelCol={{ span: labelCol }}
            wrapperCol={{ span: wrapperCol }}
            style={{ width: 600 }}
            initialValues={{
                [participantName]: firebaseUser?.displayName ?? undefined,
            }}
            onFinish={e => {
                if (isSubmitting) {
                    return;
                }
                const roomNameValue: string = e[roomName] ?? '';
                const participantNameValue: string = e[participantName] ?? '';
                const playerPasswordValue: string = e[playerPassword] ?? '';
                const spectatorPasswordValue: string = e[spectatorPassword] ?? '';
                const input: CreateRoomInput = {
                    roomName: roomNameValue,
                    participantName: participantNameValue,
                    playerPassword: isPlayerPasswordEnabled ? playerPasswordValue : undefined,
                    spectatorPassword: isSpectatorPasswordEnabled
                        ? spectatorPasswordValue
                        : undefined,
                };
                setIsSubmitting(true);
                createRoom({ input }).then(r => {
                    switch (r.data?.result.__typename) {
                        case 'CreateRoomSuccessResult': {
                            router.push(`/rooms/${r.data?.result.id}`);
                            return;
                        }
                        case 'CreateRoomFailureResult': {
                            // 現状、ここには来ない
                            setIsSubmitting(false);
                            return;
                        }
                        default:
                            setIsSubmitting(false);
                            return;
                    }
                });
            }}
        >
            <Form.Item label='部屋の名前' name={roomName}>
                <Input />
            </Form.Item>
            <Form.Item label='自分の名前' name={participantName}>
                <Input />
            </Form.Item>
            <Form.Item label='参加パスワードを有効化'>
                <Switch checked={isPlayerPasswordEnabled} onChange={setIsPlayerPasswordEnabled} />
            </Form.Item>
            <Form.Item label='参加パスワード' name={playerPassword}>
                <Input.Password disabled={!isPlayerPasswordEnabled} />
            </Form.Item>
            <Form.Item label='観戦パスワードを有効化'>
                <Switch
                    checked={isSpectatorPasswordEnabled}
                    onChange={setIsSpectatorPasswordEnabled}
                />
            </Form.Item>
            <Form.Item label='観戦パスワード' name={spectatorPassword}>
                <Input.Password disabled={!isSpectatorPasswordEnabled} />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: labelCol, span: wrapperCol }}>
                <Button disabled={isSubmitting} type='primary' htmlType='submit'>
                    OK
                </Button>
                {isSubmitting ? <Spin /> : null}
                {createRoomResult.error == null ? null : (
                    <Alert message={createRoomResult.error.message} type='error' showIcon />
                )}
            </Form.Item>
        </Form>
    );

    return (
        <Layout requires={loginAndEntry}>
            <Center>
                <Card title='部屋の新規作成'>{form}</Card>
            </Center>
        </Layout>
    );
};
