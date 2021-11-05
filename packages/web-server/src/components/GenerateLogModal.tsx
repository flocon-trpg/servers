import fileDownload from 'js-file-download';
import React from 'react';
import { ConfigContext } from '../contexts/ConfigContext';
import { FirebaseAuthenticationIdTokenContext } from '../contexts/FirebaseAuthenticationIdTokenContext';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import {
    GetLogDocument,
    GetLogQuery,
    GetLogQueryVariables,
    GetRoomLogFailureType,
} from '@flocon-trpg/typed-document-node';
import { useParticipants } from '../hooks/state/useParticipants';
import { usePublicChannelNames } from '../hooks/state/usePublicChannelNames';
import { useReadonlyRef } from '../hooks/useReadonlyRef';
import { ChannelsFilter, ChannelsFilterOptions } from './ChannelsFilter';
import { generateAsRichLog, generateAsStaticHtml } from '../utils/roomLogGenerator';
import moment from 'moment';
import { Button, Modal, Progress, Radio } from 'antd';
import classNames from 'classnames';
import { flex, flexColumn } from '../utils/className';
import { useApolloClient } from '@apollo/client';

const simple = 'simple';
const rich = 'rich';
type LogMode = typeof simple | typeof rich;

type Props = {
    roomId: string;
    visible: boolean;
    onClose: () => void;
};

export const GenerateLogModal: React.FC<Props> = ({ roomId, visible, onClose }: Props) => {
    const roomIdRef = useReadonlyRef(roomId);

    const apolloClient = useApolloClient();
    const apolloClientRef = useReadonlyRef(apolloClient);
    const config = React.useContext(ConfigContext);
    const configRef = useReadonlyRef(config);
    const firebaseStorageUrlCacheContext = React.useContext(FirebaseStorageUrlCacheContext);
    const firebaseStorageUrlCacheContextRef = useReadonlyRef(firebaseStorageUrlCacheContext);
    const getIdToken = React.useContext(FirebaseAuthenticationIdTokenContext);
    const getIdTokenRef = useReadonlyRef(getIdToken);
    const publicChannelNames = usePublicChannelNames();
    const publicChannelNamesRef = useReadonlyRef(publicChannelNames);
    const participants = useParticipants();
    const participantsRef = useReadonlyRef(participants);

    // これがfalseからtrueになったときのみダウンロードが開始される
    const [isDownloading, setIsDownloading] = React.useState(false);

    const [logMode, setLogMode] = React.useState<LogMode>(rich);
    const logModeRef = useReadonlyRef(logMode);
    const [channelsFilterOptions, setChannelsFilterOptions] = React.useState(
        ChannelsFilterOptions.defaultValue
    );
    const channelsFilterOptionsRef = useReadonlyRef(channelsFilterOptions);

    const [progress, setProgress] = React.useState<number>();
    const [errorMessage, setErrorMessage] = React.useState<string>();
    React.useEffect(() => {
        setProgress(undefined);
        setErrorMessage(undefined);
    }, [visible]);

    React.useEffect(() => {
        if (!isDownloading) {
            return;
        }

        const main = async () => {
            setProgress(undefined);
            setErrorMessage(undefined);

            if (
                publicChannelNamesRef.current == null ||
                participantsRef.current == null ||
                firebaseStorageUrlCacheContextRef.current == null ||
                getIdTokenRef.current == null
            ) {
                return;
            }

            const idToken = await getIdTokenRef.current();
            if (idToken == null) {
                return;
            }

            setProgress(0);
            const logData = await apolloClientRef.current.query<GetLogQuery, GetLogQueryVariables>({
                query: GetLogDocument,
                fetchPolicy: 'network-only',
                variables: {
                    roomId: roomIdRef.current,
                },
            });
            if (logData.data.result.__typename !== 'RoomMessages') {
                if (logData.data.result.__typename === 'GetRoomLogFailureResult') {
                    switch (logData.data.result.failureType) {
                        case GetRoomLogFailureType.NotAuthorized: {
                            setErrorMessage('観戦者はログをダウンロードすることはできません。');
                            break;
                        }
                        default:
                            setErrorMessage(
                                `エラーが発生しました: ${logData.data.result.failureType}`
                            );
                            break;
                    }
                } else {
                    setErrorMessage('APIサーバーからログをダウンロードできませんでした。');
                }
                setIsDownloading(false);
                return;
            }

            if (logModeRef.current === simple) {
                setProgress(100);
                fileDownload(
                    generateAsStaticHtml({
                        ...publicChannelNamesRef.current,
                        messages: logData.data.result,
                        participants: participantsRef.current,
                        filter: ChannelsFilterOptions.toFilter(channelsFilterOptionsRef.current),
                    }),
                    `log_simple_${moment(new Date()).format('YYYY-MM-DD-HH-mm-ss')}.html`
                );
                setIsDownloading(false);
                return;
            }

            const zipBlob = await generateAsRichLog({
                params: {
                    ...publicChannelNamesRef.current,
                    messages: logData.data.result,
                    participants: participantsRef.current,
                    filter: ChannelsFilterOptions.toFilter(channelsFilterOptionsRef.current),
                },
                config: configRef.current,
                idToken,
                firebaseStorageUrlCache: firebaseStorageUrlCacheContextRef.current,
                onProgressChange: p => setProgress(p.percent),
            }).catch(err => {
                setErrorMessage(err.message);
                return null;
            });
            if (zipBlob == null) {
                return;
            }
            setProgress(100);
            fileDownload(
                zipBlob,
                `log_rich_${moment(new Date()).format('YYYY-MM-DD-HH-mm-ss')}.zip`
            );
            setIsDownloading(false);
        };
        main();
    }, [
        isDownloading,
        apolloClientRef,
        publicChannelNamesRef,
        participantsRef,
        firebaseStorageUrlCacheContextRef,
        getIdTokenRef,
        roomIdRef,
        logModeRef,
        channelsFilterOptionsRef,
        configRef,
    ]);

    return (
        <Modal
            visible={visible}
            width={700}
            closable={false}
            maskClosable={!isDownloading}
            title='ログのダウンロード'
            okButtonProps={{ style: { display: 'none' } }}
            cancelText='閉じる'
            cancelButtonProps={{ disabled: isDownloading }}
            onCancel={() => onClose()}
        >
            <div className={classNames(flex, flexColumn)}>
                <p>
                    <div>ログ生成モード</div>
                    <Radio.Group value={logMode} onChange={e => setLogMode(e.target.value)}>
                        <Radio value={rich}>リッチ</Radio>
                        <Radio value={simple}>シンプル</Radio>
                    </Radio.Group>
                </p>
                <div>
                    <p>
                        ログには、秘話などの非公開情報も含めることが可能です。また、ログをダウンロードすると、システムメッセージによって全員に通知されます。
                    </p>
                    {logMode === rich && (
                        <p>
                            キャラクターの画像もあわせてダウンロードするため、zipファイル生成までに数十秒程度の時間がかかることがあります。
                        </p>
                    )}
                </div>
                <ChannelsFilter
                    value={channelsFilterOptions}
                    onChange={setChannelsFilterOptions}
                    disabled={isDownloading}
                />
                <Button
                    style={{ alignSelf: 'start', marginTop: 8 }}
                    type='primary'
                    disabled={isDownloading}
                    onClick={() => setIsDownloading(true)}
                >
                    ログ生成を開始
                </Button>
                {progress != null && (
                    <Progress
                        percent={progress}
                        status={
                            progress === 100
                                ? 'success'
                                : errorMessage == null
                                ? 'normal'
                                : 'exception'
                        }
                    />
                )}
                {progress === 100 && (
                    <div>
                        zipファイル生成が完了しました。間もなくzipファイルのダウンロードが開始されます。
                    </div>
                )}
                {errorMessage != null && <div>{errorMessage}</div>}
            </div>
        </Modal>
    );
};
