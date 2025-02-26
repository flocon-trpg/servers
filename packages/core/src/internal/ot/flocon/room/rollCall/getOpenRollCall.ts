import { recordToArray } from '@flocon-trpg/utils';
import { maxBy } from 'es-toolkit';
import { State } from '../../../generator/types';
import { StringKeyRecord } from '../../../record';
import { template } from './types';

const getOpenRollCalls = (source: StringKeyRecord<State<typeof template>>) => {
    return recordToArray(source).filter(({ value }) => {
        return value.closeStatus == null;
    });
};

/**
 * 現在行われている点呼があればそれを返します。
 *
 * 原則として、現在行われている点呼は最大でも 1 つまでしか存在できません。
 */
export const getOpenRollCall = (source: StringKeyRecord<State<typeof template>>) => {
    const activeRollCalls = getOpenRollCalls(source);
    return maxBy(activeRollCalls, ({ value }) => value.createdAt);
};
