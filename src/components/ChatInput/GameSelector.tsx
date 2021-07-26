import React from 'react';

import * as Icon from '@ant-design/icons';
import { Select } from 'antd';
import { ChatPalettePanelConfig } from '../../states/ChatPalettePanelConfig';
import { MessagePanelConfig } from '../../states/MessagePanelConfig';
import { useListAvailableGameSystemsQuery } from '../../generated/graphql';
import { useDispatch } from 'react-redux';
import { apolloError } from '../../hooks/useRoomMessages';
import { roomModule } from '../../modules/roomModule';
import {
    UpdateChatPalettePanelAction,
    UpdateMessagePanelAction,
} from '../../modules/roomConfigModule';

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

    const availableGameSystems = useListAvailableGameSystemsQuery();
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
        <div
            style={{
                flex: '0 0 auto',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <div style={titleStyle}>ダイス</div>
            <Select
                style={{ flex: 1, maxWidth: inputMaxWidth }}
                placeholder="ゲームの種類"
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
            <div style={{ flex: 1 }} />
        </div>
    );
};
