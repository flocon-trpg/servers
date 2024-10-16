import { CreateRoomDocument, CreateRoomInput } from '@flocon-trpg/typed-document-node';
import { Alert, Button, Card, Form, Input, Spin, Switch } from 'antd';
import { useAtomValue } from 'jotai';
import React from 'react';
import { useMutation } from 'urql';
import { Center } from '@/components/ui/Center/Center';
import { HelpMessageTooltip } from '@/components/ui/HelpMessageTooltip/HelpMessageTooltip';
import { Layout, loginAndEntry } from '@/components/ui/Layout/Layout';
import { firebaseUserValueAtom } from '@/hooks/useSetupApp';
import { useNavigate } from '@tanstack/react-router';

const labelCol = 10;
const wrapperCol = 24 - labelCol;

const roomName = 'roomName';
const participantName = 'userName';
const playerPassword = 'playerPassword';
const spectatorPassword = 'spectatorPassword';

export const RoomCreatePage: React.FC = () => {
    const router = useNavigate();
    const [createRoomResult, createRoom] = useMutation(CreateRoomDocument);
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
    const [isPlayerPasswordEnabled, setIsPlayerPasswordEnabled] = React.useState<boolean>(false);
    const [isSpectatorPasswordEnabled, setIsSpectatorPasswordEnabled] =
        React.useState<boolean>(false);
    const firebaseUser = useAtomValue(firebaseUserValueAtom);

    // TODO: 横幅などが足りないため、Formで表現するようなものではない気がする。Flocon の Table に置き換えたほうがよさそうか。
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
                            router({to: `/rooms/$id`, params: {id: r.data.result.id} });
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
            <Form.Item
                label={
                    <HelpMessageTooltip title='この部屋における自分の名前です。この名前は、入室したユーザー全員に公開されます。セッションに用いるキャラクターなどの名前と一致させる必要はありません。入室後も変更できます。'>
                        {'自分の名前'}
                    </HelpMessageTooltip>
                }
                name={participantName}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label={
                    <HelpMessageTooltip title='有効化すると、ユーザーが参加者として入室する際にパスワードが必要になります。'>
                        {'参加パスワードを有効化'}
                    </HelpMessageTooltip>
                }
            >
                <Switch checked={isPlayerPasswordEnabled} onChange={setIsPlayerPasswordEnabled} />
            </Form.Item>
            <Form.Item label='参加パスワード' name={playerPassword}>
                <Input.Password disabled={!isPlayerPasswordEnabled} />
            </Form.Item>
            <Form.Item
                label={
                    <HelpMessageTooltip title='有効化すると、ユーザーが観戦者として入室する際にパスワードが必要になります。'>
                        {'観戦パスワードを有効化'}
                    </HelpMessageTooltip>
                }
            >
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
                    作成
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
            <Center setPaddingY>
                <Card title='部屋の新規作成'>{form}</Card>
            </Center>
        </Layout>
    );
};
