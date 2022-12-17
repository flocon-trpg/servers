import { template } from './types';
import { State } from '@/ot/generator';
import { StringKeyRecord } from '@/ot/record';
/**
 * 現在行われている点呼があればそれを返します。
 *
 * 原則として、現在行われている点呼は最大でも 1 つまでしか存在できません。
 */
export declare const getOpenRollCall: (source: StringKeyRecord<State<typeof template>>) => {
    key: string;
    value: {
        $v: 1;
        $r: 1;
    } & {
        createdAt: number;
        createdBy: string;
        closeStatus: {
            closedBy: string;
            reason: "Closed";
        } | undefined;
        participants: {
            [x: string]: ({
                $v: 1;
                $r: 1;
            } & {
                answeredAt: number | undefined;
            }) | undefined;
        } | undefined;
        soundEffect: {
            volume: number;
            file: {
                path: string;
                $v: 1;
                $r: 1;
                sourceType: "Default" | "Uploader" | "FirebaseStorage";
            };
        } | undefined;
    };
} | undefined;
//# sourceMappingURL=getOpenRollCall.d.ts.map