import React from 'react';
import { Button, Popover, Select } from 'antd';
import { ChatPalettePanelConfig } from '../../states/ChatPalettePanelConfig';
import { MessagePanelConfig } from '../../states/MessagePanelConfig';
import { useDispatch } from 'react-redux';
import { apolloError } from '../../hooks/useRoomMessages';
import { roomModule } from '../../modules/roomModule';
import {
    UpdateChatPalettePanelAction,
    UpdateMessagePanelAction,
} from '../../modules/roomConfigModule';
import classNames from 'classnames';
import { flex, flexNone, flexRow, itemsCenter } from '../../utils/className';
import * as Icons from '@ant-design/icons';
import { NewTabLinkify } from '../NewTabLinkify';
import {
    GetAvailableGameSystemsDocument,
    GetDiceHelpMessagesDocument,
} from '@flocon-trpg/typed-document-node';
import { useQuery } from '@apollo/client';

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
        newValue: UpdateChatPalettePanelAction['panel'] & UpdateMessagePanelAction['panel']
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
    const dispatch = useDispatch();

    const availableGameSystems = useQuery(GetAvailableGameSystemsDocument);
    React.useEffect(() => {
        if (availableGameSystems.error == null) {
            return;
        }
        dispatch(
            roomModule.actions.addNotification({
                type: apolloError,
                error: availableGameSystems.error,
                createdAt: new Date().getTime(),
            })
        );
    }, [availableGameSystems.error, dispatch]);

    return (
        <div className={classNames(flexNone, flex, flexRow, itemsCenter)}>
            <div style={titleStyle}>ダイス</div>
            <Select
                style={{ flex: 1, maxWidth: inputMaxWidth }}
                placeholder='ゲームの種類'
                showSearch
                value={config.selectedGameSystem}
                onSelect={(value, option) => {
                    if (typeof option.key !== 'string') {
                        return;
                    }
                    onConfigUpdate({ selectedGameSystem: option.key });
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
