import {
    AstInfo,
    FBoolean,
    FFunction,
    FObject,
    FValue,
    OnGettingParams,
    ScriptError,
    beginCast,
} from '@flocon-trpg/flocon-script';
import * as RoomTypes from '../ot/flocon/room/types';
import * as BgmTypes from '../ot/flocon/room/bgm/types';
import { FBgm } from './bgm';
import { isStrIndex5 } from '../indexes';
import { State } from '../ot/generator';

export class FBgms extends FObject {
    public constructor(private readonly room: State<typeof RoomTypes.template>) {
        super();
    }

    private find(key: FValue, astInfo: AstInfo | undefined) {
        const keyAsString = beginCast(key, astInfo).addNumber().cast().toString();
        if (!isStrIndex5(keyAsString)) {
            return undefined;
        }
        return (this.room.bgms ?? {})[keyAsString];
    }

    private ensure(key: FValue, astInfo: AstInfo | undefined) {
        const keyAsString = beginCast(key, astInfo).addNumber().cast().toString();
        if (!isStrIndex5(keyAsString)) {
            return undefined;
        }
        if (this.room.bgms == null) {
            this.room.bgms = {};
        }
        const found = this.room.bgms[keyAsString];
        if (found != null) {
            return found;
        }
        const newBgm: State<typeof BgmTypes.template> = {
            $v: 1,
            $r: 1,
            files: [],
            isPaused: true,
            volume: 0.5,
        };
        this.room.bgms[keyAsString] = newBgm;
        return found;
    }

    private delete(key: FValue, astInfo: AstInfo | undefined) {
        const keyAsString = beginCast(key, astInfo).addNumber().cast().toString();
        if (!isStrIndex5(keyAsString)) {
            return false;
        }
        if (this.room.bgms == null) {
            return false;
        }
        const found = this.room.bgms[keyAsString];
        if (found == null) {
            return false;
        }
        this.room.bgms[keyAsString] = undefined;
        return true;
    }

    override getCore({ key, astInfo }: OnGettingParams): FValue {
        const keyAsString = key.toString();
        switch (keyAsString) {
            case 'find':
                return new FFunction(({ args }) => {
                    const result = this.find(args[0], astInfo);
                    if (result == null) {
                        return undefined;
                    }
                    return new FBgm(result);
                });
            case 'ensure':
                return new FFunction(({ args }) => {
                    const result = this.ensure(args[0], astInfo);
                    if (result == null) {
                        return undefined;
                    }
                    return new FBgm(result);
                });
            case 'delete':
                return new FFunction(({ args }) => {
                    return new FBoolean(this.delete(args[0], astInfo));
                });
            default:
                break;
        }
        return undefined;
    }

    override setCore(): void {
        throw new ScriptError('?????????????????????????????????????????????');
    }

    override toJObject(): unknown {
        return this.room.bgms;
    }
}
