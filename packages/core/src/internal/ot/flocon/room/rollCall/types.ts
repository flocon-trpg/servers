import { z } from 'zod';
import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
} from '../../../generator';
import * as RollCallParticipant from './rollCallParticipant/types';

export const template = createObjectValueTemplate(
    {
        createdAt: createReplaceValueTemplate(z.number()),
        createdBy: createReplaceValueTemplate(z.string()), // Participant ID

        // keyはParticipantのID
        // 一般に、roll-callが作られたときにいたなおかつ作成者以外のParticipantのみが入る
        participants: createRecordValueTemplate(RollCallParticipant.template),
    },
    1,
    1
);
