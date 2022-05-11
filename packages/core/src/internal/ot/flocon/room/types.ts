import * as t from 'io-ts';
import * as Bgm from './bgm/types';
import * as Memo from './memo/types';
import * as ParamNames from './paramName/types';
import * as Participant from './participant/types';
import { maybe } from '../../../maybe';
import * as Board from './board/types';
import * as Character from './character/types';
import {
    createObjectValueTemplate,
    createOtValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
} from '../../generator';

const templateBase = {
    activeBoardId: createReplaceValueTemplate(maybe(t.string)),
    bgms: createRecordValueTemplate(Bgm.template), // keyはStrIndex5
    boolParamNames: createRecordValueTemplate(ParamNames.template), //keyはStrIndex20
    boards: createRecordValueTemplate(Board.template), // keyはランダムなID
    characters: createRecordValueTemplate(Character.template), // keyはランダムなID
    characterTag1Name: createOtValueTemplate(true),
    characterTag2Name: createOtValueTemplate(true),
    characterTag3Name: createOtValueTemplate(true),
    characterTag4Name: createOtValueTemplate(true),
    characterTag5Name: createOtValueTemplate(true),
    characterTag6Name: createOtValueTemplate(true),
    characterTag7Name: createOtValueTemplate(true),
    characterTag8Name: createOtValueTemplate(true),
    characterTag9Name: createOtValueTemplate(true),
    characterTag10Name: createOtValueTemplate(true),
    memos: createRecordValueTemplate(Memo.template), // keyはランダムなID
    numParamNames: createRecordValueTemplate(ParamNames.template), //keyはStrIndex20
    publicChannel1Name: createOtValueTemplate(false),
    publicChannel2Name: createOtValueTemplate(false),
    publicChannel3Name: createOtValueTemplate(false),
    publicChannel4Name: createOtValueTemplate(false),
    publicChannel5Name: createOtValueTemplate(false),
    publicChannel6Name: createOtValueTemplate(false),
    publicChannel7Name: createOtValueTemplate(false),
    publicChannel8Name: createOtValueTemplate(false),
    publicChannel9Name: createOtValueTemplate(false),
    publicChannel10Name: createOtValueTemplate(false),
    strParamNames: createRecordValueTemplate(ParamNames.template), //keyはStrIndex20
};

export const dbTemplate = createObjectValueTemplate(templateBase, 2, 1);

// nameとcreatedByはDBから頻繁に取得されると思われる値なので独立させている。
export const template = createObjectValueTemplate(
    {
        ...templateBase,
        createdBy: createReplaceValueTemplate(t.string),
        name: createOtValueTemplate(false),
        participants: createRecordValueTemplate(Participant.template),
    },
    2,
    1
);
