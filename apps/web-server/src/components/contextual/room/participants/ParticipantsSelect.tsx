import { Select } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { useParticipants } from '../../../../hooks/state/useParticipants';
import { useMyUserUid } from '../../../../hooks/useMyUserUid';
import { flex, itemsCenter } from '../../../../utils/className';
import { Jdenticon } from '../../../ui/Jdenticon';

type Props = {
    selectedParticipantIds: ReadonlySet<string>;
    onSelect: (participantId: string) => void;
    onDeselect: (participantId: string) => void;
    placeholder?: string;
};

export const ParticipantsSelect: React.FC<Props> = ({
    selectedParticipantIds,
    onSelect,
    onDeselect,
    placeholder,
}: Props) => {
    const myUserUid = useMyUserUid();
    const participants = useParticipants({
        Master: true,
        Player: true,
        Spectator: true,
    });

    if (myUserUid == null) {
        return null;
    }

    const children: React.ReactNode[] = [];
    participants?.forEach((participant, participantId) => {
        if (participantId === myUserUid) {
            return;
        }

        children.push(
            <Select.Option key={participantId} value={participantId}>
                <div className={classNames(flex, itemsCenter)}>
                    <Jdenticon
                        hashOrValue={participantId}
                        size={18}
                        // tooltipはプルダウンメニューの下に隠れることがあるため非表示にしている。
                        tooltipMode={{ type: 'none' }}
                    />
                    <div style={{ paddingLeft: 4 }}>{participant.name}</div>
                </div>
            </Select.Option>
        );
    });

    return (
        <Select
            placeholder={placeholder}
            mode='multiple'
            style={{ width: '100%' }}
            value={[...selectedParticipantIds].filter(participantId => participantId !== myUserUid)}
            onSelect={value => {
                if (typeof value !== 'string') {
                    return;
                }
                onSelect(value);
            }}
            onDeselect={(value, option) => {
                if (typeof option.key !== 'string') {
                    return;
                }
                onDeselect(option.key);
            }}
        >
            {children}
        </Select>
    );
};
