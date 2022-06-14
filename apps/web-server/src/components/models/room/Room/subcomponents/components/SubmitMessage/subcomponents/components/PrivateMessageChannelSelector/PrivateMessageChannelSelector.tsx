import React from 'react';
import { useMyUserUid } from '../../../../../../../../../../hooks/useMyUserUid';
import {
    flex,
    flexNone,
    flexRow,
    itemsCenter,
} from '../../../../../../../../../../styles/className';
import classNames from 'classnames';
import { ParticipantsSelect } from './subcomponents/components/ParticipantsSelect/ParticipantsSelect';
import { InputDescription } from '../../../../../../../../../ui/InputDescription/InputDescription';

// TODO: playerの場合、characterの情報も一緒に載せたほうがわかりやすい

type Props = {
    participantIdsOfSendTo: ReadonlySet<string>;
    onParticipantIdsOfSendToChange: (newValue: ReadonlySet<string>) => void;
    descriptionStyle?: React.CSSProperties;
};

export const PrivateMessageChannelSelector: React.FC<Props> = ({
    participantIdsOfSendTo,
    onParticipantIdsOfSendToChange,
    descriptionStyle,
}: Props) => {
    const myUserUid = useMyUserUid();

    if (myUserUid == null) {
        return null;
    }

    return (
        <div className={classNames(flexNone, flex, flexRow, itemsCenter)}>
            <InputDescription style={descriptionStyle}>宛先</InputDescription>
            <ParticipantsSelect
                placeholder='秘話の宛先（1人も指定されていない場合は独り言になります）'
                selectedParticipantIds={participantIdsOfSendTo}
                onChange={newIds => {
                    const newSet = new Set(newIds);
                    newSet.add(myUserUid);
                    onParticipantIdsOfSendToChange(newSet);
                }}
            />
        </div>
    );
};
