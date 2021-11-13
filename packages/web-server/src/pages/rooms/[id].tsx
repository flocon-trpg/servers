import { useRouter } from 'next/router';
import React from 'react';
import { Room as RoomComponent } from '../../pageComponents/room/Room';
import {
    GetRoomFailureType,
    JoinRoomAsPlayerDocument,
    JoinRoomAsPlayerMutation,
    JoinRoomAsSpectatorDocument,
    JoinRoomFailureType,
    RoomAsListItemFragment,
    UpdateWritingMessageStatusDocument,
    WritingMessageStatusInputType,
} from '@flocon-trpg/typed-document-node';
import { Alert, Button, Card, Input, Result, Spin, notification as antdNotification } from 'antd';
import { Layout, loginAndEntry, success } from '../../layouts/Layout';
import { FetchResult, useMutation } from '@apollo/client';
import {
    deleted,
    getRoomFailure,
    joined,
    loading,
    mutationFailure,
    myAuthIsUnavailable,
    nonJoined,
    useRoomState,
} from '../../hooks/useRoomState';
import { Center } from '../../components/Center';
import { LoadingResult } from '../../components/Result/LoadingResult';
import { usePublishRoomEventSubscription } from '../../hooks/usePublishRoomEventSubscription';
import { useAllRoomMessages } from '../../hooks/useRoomMessages';
import { roomDrawerAndPopoverAndModalModule } from '../../modules/roomDrawerAndPopoverAndModalModule';
import { useReadonlyRef } from '../../hooks/useReadonlyRef';
import { usePrevious } from 'react-use';
import { getRoomConfig } from '../../utils/localStorage/roomConfig';
import { MyAuthContext } from '../../contexts/MyAuthContext';
import { bufferTime, Subject } from 'rxjs';
import { Ref } from '../../utils/ref';
import { atom, useAtom } from 'jotai';
import { roomConfigAtom } from '../../atoms/roomConfig/roomConfigAtom';
import { useDispatch } from 'react-redux';
import { roomAtom } from '../../atoms/room/roomAtom';
import { writeonlyAtom } from '../../atoms/writeonlyAtom';
import produce from 'immer';
import { RoomConfigUtils } from '../../atoms/roomConfig/types/roomConfig/utils';
import { roomPublicMessageInputAtom } from '../../atoms/inputs/roomPublicMessageInputAtom';
import { roomPrivateMessageInputAtom } from '../../atoms/inputs/roomPrivateMessageInputAtom';
import { useUpdateAtom } from 'jotai/utils';

type JoinRoomFormProps = {
    roomState: RoomAsListItemFragment;
    onJoin?: () => void;
};

const JoinRoomForm: React.FC<JoinRoomFormProps> = ({ roomState, onJoin }: JoinRoomFormProps) => {
    const myAuth = React.useContext(MyAuthContext);
    const [name, setName] = React.useState<string>(
        typeof myAuth === 'string' ? '' : myAuth.displayName ?? ''
    );
    const [playerPhrase, setPlayerPhrase] = React.useState<string>('');
    const [spectatorPhrase, setSpectatorPhrase] = React.useState<string>('');
    const [joinRoomAsPlayer, joinRoomAsPlayerResult] = useMutation(JoinRoomAsPlayerDocument);
    const [joinRoomAsSpectator, joinRoomAsSpectatorResult] = useMutation(
        JoinRoomAsSpectatorDocument
    );
    const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

    const disableJoinActions = joinRoomAsPlayerResult.loading || joinRoomAsSpectatorResult.loading;

    const OnGetResult = (
        result: FetchResult<JoinRoomAsPlayerMutation, Record<string, any>, Record<string, any>>
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
                    case JoinRoomFailureType.WrongPhrase: {
                        setErrorMessage('Wrong phrase');
                        return;
                    }
                    case JoinRoomFailureType.NotFound: {
                        setErrorMessage('Not found. Deleted?');
                        return;
                    }
                }
        }
    };
    const onJoinAsPlayerButtonClick = async () => {
        if (disableJoinActions) {
            return;
        }
        const phrase = roomState.requiresPhraseToJoinAsPlayer ? playerPhrase : undefined;
        await joinRoomAsPlayer({ variables: { id: roomState.id, phrase, name } }).then(OnGetResult);
    };
    const onJoinAsSpectatorButtonClick = async () => {
        if (disableJoinActions) {
            return;
        }
        const phrase = roomState.requiresPhraseToJoinAsSpectator ? spectatorPhrase : undefined;
        await joinRoomAsSpectator({ variables: { id: roomState.id, phrase, name } }).then(
            OnGetResult
        );
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
                {roomState.requiresPhraseToJoinAsPlayer ? (
                    <Input
                        style={{ gridColumn: 2, gridRow: 3 }}
                        onChange={e => setPlayerPhrase(e.target.value)}
                        value={playerPhrase}
                        placeholder='参加フレーズ'
                    />
                ) : (
                    <div style={{ gridColumn: 2, gridRow: 3, marginLeft: 4, fontSize: 'small' }}>
                        (参加フレーズなしで入室できます)
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
                {roomState.requiresPhraseToJoinAsSpectator ? (
                    <Input
                        style={{ gridColumn: 2, gridRow: 4 }}
                        onChange={e => setSpectatorPhrase(e.target.value)}
                        value={spectatorPhrase}
                        placeholder='観戦フレーズ'
                    />
                ) : (
                    <div style={{ gridColumn: 2, gridRow: 4, marginLeft: 4, fontSize: 'small' }}>
                        (観戦フレーズなしで入室できます)
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

function useBufferedWritingMessageStatusInputType() {
    const timeSpan = 1500;
    const subjectRef = React.useRef(new Subject<WritingMessageStatusInputType>());
    // WritingMessageStatusInputTypeの値が変わらないときでもuseEffectをトリガーさせたいので、WritingMessageStatusInputTypeではなくRef<WritingMessageStatusInputType>を使っている
    const [result, setResult] = React.useState<Ref<WritingMessageStatusInputType>>();
    const onNext = React.useCallback((item: WritingMessageStatusInputType) => {
        subjectRef.current.next(item);
    }, []);
    React.useEffect(() => {
        subjectRef.current.pipe(bufferTime(timeSpan)).subscribe({
            next: items => {
                const lastElement = items[items.length - 1];
                if (lastElement === undefined) {
                    return;
                }
                setResult({ value: lastElement });
            },
        });
    }, []);
    return [result, onNext] as const;
}

const writeonlyRoomConfigAtom = writeonlyAtom(roomConfigAtom)

// localForageを用いてRoomConfigを読み込み、ReduxのStateと紐付ける。
// Roomが変わるたびに、useRoomConfigが更新される必要がある。RoomのComponentのどこか一箇所でuseRoomConfigを呼び出すだけでよい。
const useRoomConfig = (roomId: string): boolean => {
    const [result, setResult] = React.useState<boolean>(false);
    const [, setRoomConfig] = useAtom(writeonlyRoomConfigAtom);

    React.useEffect(() => {
        let unmounted = false;
        const main = async () => {
            setRoomConfig(null);
            const roomConfig = await getRoomConfig(roomId);
            if (unmounted) {
                return;
            }
            // immerを使わなくても問題ないが、コード変更があったときにエンバグする可能性を減らすことを狙ってimmerを使っている
            setRoomConfig(produce(roomConfig, roomConfig => RoomConfigUtils.fixRoomConfig(roomConfig)));
            setResult(true);
        };
        main();
        return () => {
            unmounted = true;
        };
    }, [roomId, setRoomConfig]);

    return result;
};

const writeonlyRoomAtom = writeonlyAtom(roomAtom);
const newNotificationAtom = atom(get => get(roomAtom).notifications.newValue)

const RoomBehavior: React.FC<{ roomId: string; children: JSX.Element }> = ({
    roomId,
    children,
}: {
    roomId: string;
    children: JSX.Element;
}) => {
    const roomIdRef = useReadonlyRef(roomId);
    const [, setRoomAtomValue] = useAtom(writeonlyRoomAtom);
    const dispatch = useDispatch();
    const setRoomPublicMessageInput = useUpdateAtom(roomPublicMessageInputAtom);
    const setRoomPrivateMessageInput = useUpdateAtom(roomPrivateMessageInputAtom);

    useRoomConfig(roomId);

    const [updateWritingMessageStatus] = useMutation(UpdateWritingMessageStatusDocument);

    React.useEffect(() => {
        dispatch(roomDrawerAndPopoverAndModalModule.actions.reset());
        setRoomPublicMessageInput('');
        setRoomPrivateMessageInput('');
    }, [roomId, dispatch, setRoomPublicMessageInput, setRoomPrivateMessageInput]);

    const {
        observable,
        data: roomEventSubscription,
        error,
    } = usePublishRoomEventSubscription(roomId);
    const { state: roomState, refetch: refetchRoomState } = useRoomState(roomId, observable);
    const allRoomMessages = useAllRoomMessages({
        roomId,
        roomEventSubscription,
        beginFetch: roomState.type === 'joined',
    });

    React.useEffect(() => {
        setRoomAtomValue({...roomAtom.init, roomId})
    }, [roomId, setRoomAtomValue]);
    React.useEffect(() => {
        setRoomAtomValue(roomAtomValue => ({...roomAtomValue, roomState}))
    }, [roomState, setRoomAtomValue]);
    React.useEffect(() => {
        setRoomAtomValue(roomAtomValue => ({...roomAtomValue, roomEventSubscription}))
    }, [roomEventSubscription, setRoomAtomValue]);
    React.useEffect(() => {
        setRoomAtomValue(roomAtomValue => ({...roomAtomValue, allRoomMessagesResult: allRoomMessages}))
    }, [allRoomMessages, setRoomAtomValue]);

    const [newNotification] = useAtom(newNotificationAtom);
    React.useEffect(() => {
        if (newNotification == null) {
            return;
        }
        antdNotification[newNotification.type]({
            message: newNotification.message,
            description: newNotification.description,
            placement: 'bottomRight',
        });
    }, [newNotification]);

    const [writingMessageStatusInputType, onWritingMessageStatusInputTypeChange] =
        useBufferedWritingMessageStatusInputType();
    React.useEffect(() => {
        if (writingMessageStatusInputType == null) {
            return;
        }
        updateWritingMessageStatus({
            variables: {
                roomId: roomIdRef.current,
                newStatus: writingMessageStatusInputType.value,
            },
        });
    }, [roomIdRef, updateWritingMessageStatus, writingMessageStatusInputType]);

    const [publicMessage] = useAtom(roomPublicMessageInputAtom);
    const prevPublicMessage = usePrevious(publicMessage);
    React.useEffect(() => {
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
        onWritingMessageStatusInputTypeChange(newStatus);
    }, [publicMessage, prevPublicMessage, onWritingMessageStatusInputTypeChange]);

    if (error != null) {
        return (
            <Result
                status='error'
                title={`Apollo subscription エラー: ${error.message}`}
                subTitle='ブラウザを更新してください。'
            />
        );
    }

    switch (roomState.type) {
        case joined: {
            if (roomState.setStateByApply == null) {
                // TODO: Buttonなどを用いたreloadに対応させる。
                return (
                    <Result
                        status='error'
                        title='サーバーから応答を受け取ることができませんでした。'
                        subTitle='ブラウザを更新してください。'
                    />
                );
            }
            return children;
        }
        case nonJoined:
            return (
                <Center>
                    <Card title='入室'>
                        <JoinRoomForm
                            roomState={roomState.nonJoinedRoom}
                            onJoin={() => refetchRoomState()}
                        />
                    </Card>
                </Center>
            );
        case getRoomFailure: {
            switch (roomState.getRoomFailureType) {
                case GetRoomFailureType.NotFound:
                    return (
                        <Result
                            status='404'
                            title='該当する部屋が見つかりませんでした。'
                            subTitle='部屋が存在しているか、適切な権限があるかどうか確認してください。'
                        />
                    );
            }
            break;
        }
        case loading:
            return <LoadingResult />;
        case myAuthIsUnavailable:
            return null;
        case mutationFailure:
            // TODO: mutationFailureが細分化されたら、こちらも細分化する。
            return (
                <Result
                    status='error'
                    title='mutationに失敗しました。'
                    subTitle='ログイン、エントリーしていることと、ネットワークに問題がないことを確認してください。'
                />
            );
        case deleted:
            return <Result status='warning' title='この部屋は削除されました。' />;
    }
};

const RoomCore: React.FC<{ children: JSX.Element }> = ({ children }: { children: JSX.Element }) => {
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
            <RoomBehavior roomId={id}>{children}</RoomBehavior>
        </Layout>
    );
};

const Room: React.FC = () => {
    return <RoomCore>{<RoomComponent />}</RoomCore>;
};

export default Room;
