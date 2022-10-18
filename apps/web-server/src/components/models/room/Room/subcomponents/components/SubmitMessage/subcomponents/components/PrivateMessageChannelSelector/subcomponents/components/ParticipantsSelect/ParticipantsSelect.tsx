import { Select } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { useMyUserUid } from '../../../../../../../../../../../../../hooks/useMyUserUid';
import { flex, itemsCenter } from '../../../../../../../../../../../../../styles/className';
import { Jdenticon } from '../../../../../../../../../../../../ui/Jdenticon/Jdenticon';
import { useParticipants } from '../../../../../../../../hooks/useParticipants';

type Props = {
    selectedParticipantIds: ReadonlySet<string>;
    onChange: (participantIds: string[]) => void;
    placeholder?: string;
};

export const ParticipantsSelect: React.FC<Props> = ({
    selectedParticipantIds,
    onChange,
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
            onChange={value => onChange(value)}
        >
            {children}
        </Select>
    );
};
