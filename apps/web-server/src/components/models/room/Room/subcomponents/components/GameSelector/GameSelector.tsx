import * as Icons from '@ant-design/icons';
import {
    GetAvailableGameSystemsDocument,
    GetDiceHelpMessagesDocument,
} from '@flocon-trpg/typed-document-node';
import { Button, Popover, Select } from 'antd';
import classNames from 'classnames';
import { Draft } from 'immer';
import React from 'react';
import { useQuery } from 'urql';
import { ChatPalettePanelConfig } from '@/atoms/roomConfigAtom/types/chatPalettePanelConfig';
import { MessagePanelConfig } from '@/atoms/roomConfigAtom/types/messagePanelConfig';
import { InputDescription } from '@/components/ui/InputDescription/InputDescription';
import { NewTabLinkify } from '@/components/ui/NewTabLinkify/NewTabLinkify';
import { useAddNotification } from '@/hooks/useAddNotification';
import { flex, flexNone, flexRow, itemsCenter } from '@/styles/className';

type HelpMessageProps = {
    gameSystemId: string;
};

const HelpMessage = ({ gameSystemId }: HelpMessageProps) => {
    const [message] = useQuery({
        query: GetDiceHelpMessagesDocument,
        variables: { id: gameSystemId },
    });
    if (message.error != null) {
        return <div>取得中にエラーが発生しました。</div>;
    }
    if (message.data == null) {
        return (
            <div>
                <Icons.LoadingOutlined />
                取得中…
            </div>
        );
    }
    if (message.data.result == null) {
        return <div>指定されたゲームのヘルプメッセージが見つかりませんでした。</div>;
    }
    return (
        <div style={{ whiteSpace: 'pre' }}>
            <NewTabLinkify>{message.data.result}</NewTabLinkify>
        </div>
    );
};

type Props = {
    config: ChatPalettePanelConfig | MessagePanelConfig;
    onConfigUpdate: (
        recipe: (draft: Draft<ChatPalettePanelConfig> | Draft<MessagePanelConfig>) => void,
    ) => void;
    inputMaxWidth?: number;
    descriptionStyle?: React.CSSProperties;
};

export const GameSelector: React.FC<Props> = ({
    inputMaxWidth,
    config,
    onConfigUpdate,
    descriptionStyle,
}: Props) => {
    const addRoomNotification = useAddNotification();

    const [availableGameSystems] = useQuery({ query: GetAvailableGameSystemsDocument });
    const sortedAvailableGameSystems = React.useMemo(
        () =>
            [...(availableGameSystems.data?.result.value ?? [])]
                .sort((x, y) => x.sortKey.localeCompare(y.sortKey))
                .map(gs => {
                    return (
                        <Select.Option key={gs.id} value={gs.id}>
                            {gs.name}
                        </Select.Option>
                    );
                }),
        [availableGameSystems.data?.result.value],
    );
    React.useEffect(() => {
        if (availableGameSystems.error == null) {
            return;
        }
        addRoomNotification({
            type: 'error',
            error: availableGameSystems.error,
            message: 'GetAvailableGameSystems Query でエラーが発生しました。',
        });
    }, [addRoomNotification, availableGameSystems.error]);

    // React Developer ToolsのProfilerで計測したところ、このTableはrerenderがそれなりに時間がかかるうえにほぼ毎回rerenderされていたので、useMemoでrerenderの頻度を減らしている。
    const select = React.useMemo(
        () => (
            <Select
                style={{ flex: 1, maxWidth: inputMaxWidth }}
                placeholder="ゲームの種類"
                showSearch
                value={config.selectedGameSystem}
                onChange={value => {
                    if (value == null) {
                        return;
                    }
                    onConfigUpdate(state => {
                        state.selectedGameSystem = value;
                    });
                }}
                filterOption={(input, option) => {
                    const value: unknown = option?.value;
                    if (typeof value !== 'string') {
                        return false;
                    }
                    return value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }}
            >
                {sortedAvailableGameSystems}
            </Select>
        ),
        [config.selectedGameSystem, inputMaxWidth, onConfigUpdate, sortedAvailableGameSystems],
    );

    return (
        <div className={classNames(flexNone, flex, flexRow, itemsCenter)}>
            <InputDescription style={descriptionStyle}>ダイス</InputDescription>
            {select}
            <Popover
                content={() =>
                    config.selectedGameSystem == null ? null : (
                        <HelpMessage gameSystemId={config.selectedGameSystem} />
                    )
                }
            >
                <Button disabled={config.selectedGameSystem == null}>
                    <Icons.QuestionCircleOutlined />
                </Button>
            </Popover>
            <div style={{ flex: 1 }} />
        </div>
    );
};
