import * as t from 'io-ts';
import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
} from '../../../generator';
import * as RollCallParticipant from './rollCallParticipant/types';

export const template = createObjectValueTemplate(
    {
        createdAt: createReplaceValueTemplate(t.number),
        createdBy: createReplaceValueTemplate(t.string), // Participant ID

        // keyはParticipantのID
        // 一般に、roll-callが作られたときにいたなおかつ作成者以外のParticipantのみが入る
        participants: createRecordValueTemplate(RollCallParticipant.template),
    },
    1,
    1
);
