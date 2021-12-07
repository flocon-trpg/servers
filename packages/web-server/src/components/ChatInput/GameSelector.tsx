import React from 'react';
import { Button, Popover, Select } from 'antd';
import { apolloError } from '../../hooks/useRoomMessages';
import classNames from 'classnames';
import { flex, flexNone, flexRow, itemsCenter } from '../../utils/className';
import * as Icons from '@ant-design/icons';
import { NewTabLinkify } from '../NewTabLinkify';
import {
    GetAvailableGameSystemsDocument,
    GetDiceHelpMessagesDocument,
} from '@flocon-trpg/typed-document-node';
import { useQuery } from '@apollo/client';
import { ChatPalettePanelConfig } from '../../atoms/roomConfig/types/chatPalettePanelConfig';
import { MessagePanelConfig } from '../../atoms/roomConfig/types/messagePanelConfig';
import { roomNotificationsAtom } from '../../atoms/room/roomAtom';
import { Draft } from 'immer';
import { useUpdateAtom } from 'jotai/utils';

type HelpMessageProps = {
    gameSystemId: string;
};

const HelpMessage = ({ gameSystemId }: HelpMessageProps) => {
    const message = useQuery(GetDiceHelpMessagesDocument, { variables: { id: gameSystemId } });
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
        recipe: (draft: Draft<ChatPalettePanelConfig> | Draft<MessagePanelConfig>) => void
    ) => void;
    titleStyle?: React.CSSProperties;
    inputMaxWidth?: number;
};

export const GameSelector: React.FC<Props> = ({
    titleStyle,
    inputMaxWidth,
    config,
    onConfigUpdate,
}: Props) => {
    const addRoomNotification = useUpdateAtom(roomNotificationsAtom);

    const availableGameSystems = useQuery(GetAvailableGameSystemsDocument);
    React.useEffect(() => {
        if (availableGameSystems.error == null) {
            return;
        }
        addRoomNotification({
            type: apolloError,
            error: availableGameSystems.error,
            createdAt: new Date().getTime(),
        });
    }, [addRoomNotification, availableGameSystems.error]);

    return (
        <div className={classNames(flexNone, flex, flexRow, itemsCenter)}>
            <div style={titleStyle}>ダイス</div>
            <Select
                style={{ flex: 1, maxWidth: inputMaxWidth }}
                placeholder='ゲームの種類'
                showSearch
                value={config.selectedGameSystem}
                onSelect={(value, option) => {
                    onConfigUpdate(state => {
                        if (typeof option.key !== 'string') {
                            return;
                        }
                        state.selectedGameSystem = option.key;
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
                {[...(availableGameSystems.data?.result.value ?? [])]
                    .sort((x, y) => x.sortKey.localeCompare(y.sortKey))
                    .map(gs => {
                        return (
                            <Select.Option key={gs.id} value={gs.id}>
                                {gs.name}
                            </Select.Option>
                        );
                    })}
            </Select>
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
