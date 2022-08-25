import * as t from 'io-ts';
import { maybe } from '../../../maybe';
import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../generator';
import * as Bgm from './bgm/types';
import * as Board from './board/types';
import * as Character from './character/types';
import * as Memo from './memo/types';
import * as ParamNames from './paramName/types';
import * as Participant from './participant/types';
import * as Stats from './stats/types';

const templateBase = {
    activeBoardId: createReplaceValueTemplate(maybe(t.string)),
    bgms: createRecordValueTemplate(Bgm.template), // keyはStrIndex5
    boolParamNames: createRecordValueTemplate(ParamNames.template), //keyはStrIndex20
    boards: createRecordValueTemplate(Board.template), // keyはランダムなID
    characters: createRecordValueTemplate(Character.template), // keyはランダムなID
    characterTag1Name: createTextValueTemplate(true),
    characterTag2Name: createTextValueTemplate(true),
    characterTag3Name: createTextValueTemplate(true),
    characterTag4Name: createTextValueTemplate(true),
    characterTag5Name: createTextValueTemplate(true),
    characterTag6Name: createTextValueTemplate(true),
    characterTag7Name: createTextValueTemplate(true),
    characterTag8Name: createTextValueTemplate(true),
    characterTag9Name: createTextValueTemplate(true),
    characterTag10Name: createTextValueTemplate(true),
    memos: createRecordValueTemplate(Memo.template), // keyはランダムなID
    numParamNames: createRecordValueTemplate(ParamNames.template), //keyはStrIndex20
    publicChannel1Name: createTextValueTemplate(false),
    publicChannel2Name: createTextValueTemplate(false),
    publicChannel3Name: createTextValueTemplate(false),
    publicChannel4Name: createTextValueTemplate(false),
    publicChannel5Name: createTextValueTemplate(false),
    publicChannel6Name: createTextValueTemplate(false),
    publicChannel7Name: createTextValueTemplate(false),
    publicChannel8Name: createTextValueTemplate(false),
    publicChannel9Name: createTextValueTemplate(false),
    publicChannel10Name: createTextValueTemplate(false),
    strParamNames: createRecordValueTemplate(ParamNames.template), //keyはStrIndex20
};

export const dbTemplate = createObjectValueTemplate(templateBase, 2, 1);

// RoomのほとんどのデータはDBでJSONとして保存されるが、nameとcreatedByとparticipantsは、DBから頻繁に取得されると思われる値なので他のカラムなどで管理される。statsはdbTemplateなどから自動生成される値であるため、DBには保存されない。
export const template = createObjectValueTemplate(
    {
        ...templateBase,
        createdBy: createReplaceValueTemplate(t.string),
        name: createTextValueTemplate(false),
        participants: createRecordValueTemplate(Participant.template),
        stats: Stats.template,
    },
    2,
    1
);
