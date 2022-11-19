import {
    GetRoomFailureType,
    JoinRoomAsPlayerDocument,
    JoinRoomAsSpectatorDocument,
    JoinRoomFailureType,
    OperateRoomFailureType,
    RoomAsListItemFragment,
    WritingMessageStatusInputType,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { Alert, Button, Card, Input, Result, Spin } from 'antd';
import produce from 'immer';
import { atom } from 'jotai';
import { selectAtom, useAtomValue, useUpdateAtom } from 'jotai/utils';
import { useRouter } from 'next/router';
import React from 'react';
import { useDebounce, usePrevious } from 'react-use';
import { useMutation } from 'urql';
import { hideAllOverlayActionAtom } from '@/atoms/hideAllOverlayActionAtom/hideAllOverlayActionAtom';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { RoomConfigUtils } from '@/atoms/roomConfigAtom/types/roomConfig/utils';
import { Room } from '@/components/models/room/Room/Room';
import { roomPrivateMessageInputAtom } from '@/components/models/room/Room/subcomponents/atoms/roomPrivateMessageInputAtom/roomPrivateMessageInputAtom';
import { roomPublicMessageInputAtom } from '@/components/models/room/Room/subcomponents/atoms/roomPublicMessageInputAtom/roomPublicMessageInputAtom';
import { useUpdateWritingMessageStatus } from '@/components/models/room/Room/subcomponents/hooks/useUpdateWritingMessageStatus';
import { Center } from '@/components/ui/Center/Center';
import { GraphQLErrorResult } from '@/components/ui/GraphQLErrorResult/GraphQLErrorResult';
import { Layout, loginAndEntry, success } from '@/components/ui/Layout/Layout';
import { LoadingResult } from '@/components/ui/LoadingResult/LoadingResult';
import { useInitializeRoomClient, useRoomClient, useTryRoomClient } from '@/hooks/roomClientHooks';
import { useRoomGraphQLStatus } from '@/hooks/useRoomGraphQLStatus';
import { useRoomState } from '@/hooks/useRoomState';
import { firebaseUserValueAtom } from '@/pages/_app';
import { getRoomConfig } from '@/utils/localStorage/roomConfig';

const debouncedWindowInnerWidthAtomCore = atom(0);
const debouncedWindowInnerHeightAtomCore = atom(0);

export const debouncedWindowInnerWidthAtom = selectAtom(debouncedWindowInnerWidthAtomCore, x => x);
export const debouncedWindowInnerHeightAtom = selectAtom(
    debouncedWindowInnerHeightAtomCore,
    x => x
);

const useOnResize = () => {
    const [windowInnerWidthState, setWindowInnerWidthState] = React.useState(
        debouncedWindowInnerWidthAtomCore.init
    );
    const [windowInnerHeightState, setWindowInnerHeightState] = React.useState(
        debouncedWindowInnerHeightAtomCore.init
    );

    const setWindowInnerWidthAtom = useUpdateAtom(debouncedWindowInnerWidthAtomCore);
    const setWindowInnerHeightAtom = useUpdateAtom(debouncedWindowInnerHeightAtomCore);

    React.useEffect(() => {
        const updateInnerWindowSize = () => {
            setWindowInnerWidthState(window.innerWidth);
            setWindowInnerHeightState(window.innerHeight);
        };

        // 'load'などでは初期サイズを取得できなかったので、setTimeoutで取得している
        setTimeout(() => updateInnerWindowSize(), 1000);

        window.addEventListener('resize', updateInnerWindowSize);
        return () => {
            window.removeEventListener('resize', updateInnerWindowSize);
        };
    }, [setWindowInnerHeightAtom, setWindowInnerWidthAtom]);

    const debounceTime = 500;
    useDebounce(
        () => {
            setWindowInnerWidthAtom(windowInnerWidthState);
        },
        debounceTime,
        [windowInnerWidthState]
    );
    useDebounce(
        () => {
            setWindowInnerHeightAtom(windowInnerHeightState);
        },
        debounceTime,
        [windowInnerHeightState]
    );
};

type JoinRoomFormProps = {
    roomState: RoomAsListItemFragment;
    onJoin?: () => void;
};

const JoinRoomForm: React.FC<JoinRoomFormProps> = ({ roomState, onJoin }: JoinRoomFormProps) => {
    const firebaseUser = useAtomValue(firebaseUserValueAtom);
    const [name, setName] = React.useState<string>(firebaseUser?.displayName ?? '');
    const [playerPassword, setPlayerPassword] = React.useState<string>('');
    const [spectatorPassword, setSpectatorPassword] = React.useState<string>('');
    const [joinRoomAsPlayerResult, joinRoomAsPlayer] = useMutation(JoinRoomAsPlayerDocument);
    const [joinRoomAsSpectatorResult, joinRoomAsSpectator] = useMutation(
        JoinRoomAsSpectatorDocument
    );
    const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

    const disableJoinActions =
        joinRoomAsPlayerResult.fetching || joinRoomAsSpectatorResult.fetching;

    const OnGetResult = (
        // Awaited<ReturnType<typeof joinRoomAsSpectator>> も同じ型であるためjoinRoomAsSpectatorも扱える
        result: Awaited<ReturnType<typeof joinRoomAsPlayer>>
    ) => {
        if (result.data == null) {
            setErrorMessage('Not authorized');
            return;
        }
        switch (result.data.result.__typename) {
            case 'JoinRoomSuccessResult':
                if (onJoin != null) {
                    onJoin();
                }
                return;
            case 'JoinRoomFailureResult':
                switch (result.data.result.failureType) {
                    case JoinRoomFailureType.WrongPassword: {
                        setErrorMessage('パスワードが誤っています。');
                        return;
                    }
                    case JoinRoomFailureType.NotFound: {
                        setErrorMessage('部屋が見つかりませんでした。削除された可能性があります。');
                        return;
                    }
                    case JoinRoomFailureType.AlreadyParticipant: {
                        setErrorMessage('すでに入室済みです。ブラウザを更新してください。');
                        return;
                    }
                    case JoinRoomFailureType.TransformError: {
                        setErrorMessage('TransformError');
                        return;
                    }
                }
        }
    };
    const onJoinAsPlayerButtonClick = async () => {
        if (disableJoinActions) {
            return;
        }
        const password = roomState.requiresPlayerPassword ? playerPassword : undefined;
        await joinRoomAsPlayer({ id: roomState.id, password, name }).then(OnGetResult);
    };
    const onJoinAsSpectatorButtonClick = async () => {
        if (disableJoinActions) {
            return;
        }
        const password = roomState.requiresSpectatorPassword ? spectatorPassword : undefined;
        await joinRoomAsSpectator({ id: roomState.id, password, name }).then(OnGetResult);
    };
    return (
        <Spin spinning={disableJoinActions}>
            {errorMessage == null ? null : <Alert message={errorMessage} type='error' showIcon />}
            <div
                style={{
                    display: 'grid',
                    gridTemplateRows: '42px 34px 42px 42px 42px',
                    gridTemplateColumns: '150px 280px 100px',
                    alignItems: 'center',
                }}
            >
                <div style={{ gridColumn: 1, gridRow: 1, marginRight: 8, justifySelf: 'right' }}>
                    名前
                </div>
                <Input
                    style={{ gridColumn: 2, gridRow: 1 }}
                    onChange={e => setName(e.target.value)}
                    value={name}
                    placeholder='名前'
                />
                <div style={{ gridColumn: 1, gridRow: 3, marginRight: 8, justifySelf: 'right' }}>
                    参加者として入室
                </div>
                {roomState.requiresPlayerPassword ? (
                    <Input.Password
                        style={{ gridColumn: 2, gridRow: 3 }}
                        onChange={e => setPlayerPassword(e.target.value)}
                        value={playerPassword}
                        placeholder='参加パスワード'
                    />
                ) : (
                    <div style={{ gridColumn: 2, gridRow: 3, marginLeft: 4, fontSize: 'small' }}>
                        (参加パスワードなしで入室できます)
                    </div>
                )}
                <Button
                    style={{ gridColumn: 3, gridRow: 3 }}
                    type='primary'
                    onClick={onJoinAsPlayerButtonClick}
                >
                    入室
                </Button>
                <div style={{ gridColumn: 1, gridRow: 4, marginRight: 8, justifySelf: 'right' }}>
                    観戦者として入室
                </div>
                {roomState.requiresSpectatorPassword ? (
                    <Input.Password
                        style={{ gridColumn: 2, gridRow: 4 }}
                        onChange={e => setSpectatorPassword(e.target.value)}
                        value={spectatorPassword}
                        placeholder='観戦パスワード'
                    />
                ) : (
                    <div style={{ gridColumn: 2, gridRow: 4, marginLeft: 4, fontSize: 'small' }}>
                        (観戦パスワードなしで入室できます)
                    </div>
                )}
                <Button
                    style={{ gridColumn: 3, gridRow: 4 }}
                    type='primary'
                    onClick={onJoinAsSpectatorButtonClick}
                >
                    入室
                </Button>
            </div>
        </Spin>
    );
};

// localForageを用いてRoomConfigを読み込み、atomと紐付ける。
// Roomが変わるたびに、useRoomConfigが更新される必要がある。RoomのComponentのどこか一箇所でuseRoomConfigを呼び出すだけでよい。
const useRoomConfig = (roomId: string): boolean => {
    const [result, setResult] = React.useState<boolean>(false);
    const setRoomConfig = useUpdateAtom(roomConfigAtom);

    React.useEffect(() => {
        let unmounted = false;
        const main = async () => {
            setRoomConfig(null);
            const roomConfig = await getRoomConfig(roomId);
            if (unmounted) {
                return;
            }
            // immerを使わなくても問題ないが、コード変更があったときにエンバグする可能性を減らすことを狙ってimmerを使っている
            setRoomConfig(
                produce(roomConfig, roomConfig => RoomConfigUtils.fixRoomConfig(roomConfig))
            );
            setResult(true);
        };
        main();
        return () => {
            unmounted = true;
        };
    }, [roomId, setRoomConfig]);

    return result;
};

const RoomBehavior: React.FC<{ roomId: string; children: JSX.Element }> = ({
    roomId,
    children,
}: {
    roomId: string;
    children: JSX.Element;
}) => {
    const roomClient = useRoomClient();
    const roomState = useRoomState();
    const graphQLStatus = useRoomGraphQLStatus();

    const setRoomPublicMessageInput = useUpdateAtom(roomPublicMessageInputAtom);
    const setRoomPrivateMessageInput = useUpdateAtom(roomPrivateMessageInputAtom);
    const hideAllOverlay = useUpdateAtom(hideAllOverlayActionAtom);

    useOnResize();
    useRoomConfig(roomId);

    React.useEffect(() => {
        hideAllOverlay();
        setRoomPublicMessageInput('');
        setRoomPrivateMessageInput('');
    }, [roomId, setRoomPublicMessageInput, setRoomPrivateMessageInput, hideAllOverlay]);

    const updateWritingMessageStatus = useUpdateWritingMessageStatus();
    const publicMessage = useAtomValue(roomPublicMessageInputAtom);
    const prevPublicMessage = usePrevious(publicMessage);
    React.useEffect(() => {
        if (updateWritingMessageStatus == null) {
            return;
        }
        const prevMessage = prevPublicMessage ?? '';
        const currentMessage = publicMessage;
        if (prevMessage === currentMessage) {
            return;
        }
        let newStatus: WritingMessageStatusInputType;
        if (prevMessage === '') {
            if (currentMessage === '') {
                newStatus = WritingMessageStatusInputType.KeepWriting;
            } else {
                newStatus = WritingMessageStatusInputType.StartWriting;
            }
        } else {
            if (currentMessage === '') {
                newStatus = WritingMessageStatusInputType.Cleared;
            } else {
                newStatus = WritingMessageStatusInputType.KeepWriting;
            }
        }
        updateWritingMessageStatus(newStatus);
    }, [prevPublicMessage, publicMessage, updateWritingMessageStatus]);

    if (graphQLStatus?.RoomEventSubscription.type === 'error') {
        return (
            <GraphQLErrorResult
                title='Subscription エラーが発生しました。ブラウザを更新してください。'
                error={graphQLStatus.RoomEventSubscription.error}
            />
        );
    }

    switch (roomState.type) {
        case 'fetching':
            return <LoadingResult />;
        case 'joined': {
            return children;
        }
        case 'nonJoined':
            return (
                <Center>
                    <Card title='入室'>
                        <JoinRoomForm
                            roomState={roomState.nonJoinedRoom}
                            onJoin={() => roomClient?.recreate()}
                        />
                    </Card>
                </Center>
            );
        case 'error': {
            const notFoundResult = (
                <Result
                    status='404'
                    title='該当する部屋が見つかりませんでした。'
                    subTitle='部屋が存在しているか、適切な権限があるかどうか確認してください。'
                />
            );
            switch (roomState.error.type) {
                case 'GetRoomFailure': {
                    switch (roomState.error.error) {
                        case GetRoomFailureType.NotFound:
                            return notFoundResult;
                        default:
                            throw new Error();
                    }
                }
                case 'GraphQLError': {
                    return (
                        <GraphQLErrorResult
                            title='GetRoomQuery でエラーが発生しました。ブラウザを更新してくだ   さい。'
                            error={roomState.error.error}
                        />
                    );
                }
                case 'OperateRoomFailure':
                    switch (roomState.error.error) {
                        case OperateRoomFailureType.NotFound:
                            return notFoundResult;
                        default:
                            throw new Error();
                    }
                case 'transformationError':
                    return (
                        <Result title='transformationError が発生しました。ブラウザを更新してください。' />
                    );
            }
            break;
        }
        case 'deleted':
            return <Result status='warning' title='この部屋は削除されました。' />;
    }
};

const RoomClientInitializer: React.FC<{ roomId: string }> = ({ roomId }) => {
    useInitializeRoomClient({ roomId });

    const roomClient = useTryRoomClient();
    // すぐ上で useInitializeRoomClient を実行しているが、それでも一瞬 useTryRoomClient の戻り値が null になる。
    // useTryRoomClient の戻り値が null のときにもし useRoomClient もしくはそれを使用している hooks を実行するとエラーになってしまう。<Room /> ではそれらの hooks が使われているため、エラーが出ないようにするためにここで弾いている。
    if (roomClient == null) {
        return <LoadingResult />;
    }

    return (
        <RoomBehavior roomId={roomId}>
            <Room />
        </RoomBehavior>
    );
};

export const RoomId: React.FC = () => {
    const router = useRouter();
    const id = router.query.id;

    if (Array.isArray(id) || id == null) {
        return (
            <Layout requires={loginAndEntry}>
                <Result status='error' title='パラメーターが不正です。' />
            </Layout>
        );
    }

    return (
        <Layout requires={loginAndEntry} hideHeader={success}>
            <RoomClientInitializer roomId={id} />
        </Layout>
    );
};
