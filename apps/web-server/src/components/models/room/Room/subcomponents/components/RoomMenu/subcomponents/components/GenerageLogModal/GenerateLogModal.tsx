import fileDownload from 'js-file-download';
import React from 'react';
import {
    GetLogDocument,
    GetLogQuery,
    GetLogQueryVariables,
    GetRoomLogFailureType,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { useParticipants } from '../../../../../hooks/useParticipants';
import { usePublicChannelNames } from '../../../../../hooks/usePublicChannelNames';
import {
    ChannelsFilter,
    ChannelsFilterOptions,
} from './subcomponents/components/ChannelsFilter/ChannelsFilter';
import { generateAsRichLog, generateAsStaticHtml } from '../../../../../utils/roomLogGenerator';
import moment from 'moment';
import { Button, Checkbox, Modal, Progress, Radio } from 'antd';
import classNames from 'classnames';
import { flex, flexColumn } from '@/styles/className';
import { useClient } from 'urql';
import { useWebConfig } from '@/hooks/useWebConfig';
import { useAtomValue } from 'jotai/utils';
import { firebaseStorageAtom } from '@/pages/_app';
import { useLatest } from 'react-use';
import { useGetIdToken } from '@/hooks/useGetIdToken';

const simple = 'simple';
const rich = 'rich';
type LogMode = typeof simple | typeof rich;

type Props = {
    roomId: string;
    visible: boolean;
    onClose: () => void;
};

export const GenerateLogModal: React.FC<Props> = ({ roomId, visible, onClose }: Props) => {
    const roomIdRef = useLatest(roomId);

    const client = useClient();
    const clientRef = useLatest(client);
    const config = useWebConfig();
    const configRef = useLatest(config);
    const firebaseStorage = useAtomValue(firebaseStorageAtom);
    const firebaseStorageRef = useLatest(firebaseStorage);
    const { getIdToken } = useGetIdToken();
    const publicChannelNames = usePublicChannelNames();
    const publicChannelNamesRef = useLatest(publicChannelNames);
    const participants = useParticipants();
    const participantsRef = useLatest(participants);

    // これがfalseからtrueになったときのみダウンロードが開始される
    const [isDownloading, setIsDownloading] = React.useState(false);

    const [logMode, setLogMode] = React.useState<LogMode>(rich);
    const logModeRef = useLatest(logMode);
    const [channelsFilterOptions, setChannelsFilterOptions] = React.useState(
        ChannelsFilterOptions.defaultValue
    );
    const channelsFilterOptionsRef = useLatest(channelsFilterOptions);

    const [showCreatedAt, setShowCreatedAt] = React.useState(true);
    const showCreatedAtRef = useLatest(showCreatedAt);
    const [showUsernameAlways, setShowUsernameAlways] = React.useState(true);
    const showUsernameAlwaysRef = useLatest(showUsernameAlways);

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
                configRef.current?.value == null ||
                firebaseStorageRef.current == null
            ) {
                return;
            }

            setProgress(0);
            const logData = await clientRef.current
                .query<GetLogQuery, GetLogQueryVariables>(
                    GetLogDocument,
                    {
                        roomId: roomIdRef.current,
                    },
                    {
                        fetchPolicy: 'network-only',
                    }
                )
                .toPromise();
            if (logData?.data?.result.__typename !== 'RoomMessages') {
                if (logData?.data?.result.__typename === 'GetRoomLogFailureResult') {
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
                        showCreatedAt: showCreatedAtRef.current,
                        showUsernameAlways: showUsernameAlwaysRef.current,
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
                config: configRef.current.value,
                storage: firebaseStorageRef.current,
                getIdToken,
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
        clientRef,
        publicChannelNamesRef,
        participantsRef,
        getIdToken,
        roomIdRef,
        logModeRef,
        channelsFilterOptionsRef,
        configRef,
        firebaseStorageRef,
        showCreatedAtRef,
        showUsernameAlwaysRef,
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
                {logMode === simple && (
                    <>
                        <div style={{ marginTop: 4 }}>ログに含める情報</div>
                        <div>
                            <Checkbox
                                checked={showUsernameAlways}
                                disabled={isDownloading}
                                onChange={e => setShowUsernameAlways(e.target.checked)}
                            >
                                常にユーザー名を含める
                            </Checkbox>
                            <br />
                            <Checkbox
                                checked={showCreatedAt}
                                disabled={isDownloading}
                                onChange={e => setShowCreatedAt(e.target.checked)}
                            >
                                書き込み日時
                            </Checkbox>
                        </div>
                    </>
                )}
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
                        {`${
                            logMode === rich ? 'zip' : 'HTML'
                        }ファイルの生成が完了しました。間もなく${
                            logMode === rich ? 'zip' : 'HTML'
                        }ファイルのダウンロードが開始されます。`}
                    </div>
                )}
                {errorMessage != null && <div>{errorMessage}</div>}
            </div>
        </Modal>
    );
};
