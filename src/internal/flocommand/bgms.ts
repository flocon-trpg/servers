import {
    AstInfo,
    beginCast,
    FBoolean,
    FFunction,
    FObject,
    FValue,
    OnGettingParams,
    ScriptError,
} from '@kizahasi/flocon-script';
import { isStrIndex5 } from '@kizahasi/util';
import * as Room from '../ot/room/v1';
import * as Bgm from '../ot/room/bgm/v1';
import { FBgm } from './bgm';

export class FBgms extends FObject {
    public constructor(private readonly room: Room.State) {
        super();
    }

    private find(key: FValue, astInfo: AstInfo | undefined) {
        const keyAsString = beginCast(key).addNumber().cast(astInfo?.range).toString();
        if (!isStrIndex5(keyAsString)) {
            return undefined;
        }
        return this.room.bgms[keyAsString];
    }

    private ensure(key: FValue, astInfo: AstInfo | undefined) {
        const keyAsString = beginCast(key).addNumber().cast(astInfo?.range).toString();
        if (!isStrIndex5(keyAsString)) {
            return undefined;
        }
        const found = this.room.bgms[keyAsString];
        if (found != null) {
            return found;
        }
        const newBgm: Bgm.State = {
            $version: 1,
            files: [],
            isPaused: true,
            volume: 0.5,
        };
        this.room.bgms[keyAsString] = newBgm;
        return found;
    }

    private delete(key: FValue, astInfo: AstInfo | undefined) {
        const keyAsString = beginCast(key).addNumber().cast(astInfo?.range).toString();
        if (!isStrIndex5(keyAsString)) {
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
                return new FFunction(
                    ({ args }) => {
                        const result = this.find(args[0], astInfo);
                        if (result == null) {
                            return undefined;
                        }
                        return new FBgm(result);
                    },
                    this,
                    false
                );
            case 'ensure':
                return new FFunction(
                    ({ args }) => {
                        const result = this.ensure(args[0], astInfo);
                        if (result == null) {
                            return undefined;
                        }
                        return new FBgm(result);
                    },
                    this,
                    false
                );
            case 'delete':
                return new FFunction(
                    ({ args }) => {
                        return new FBoolean(this.delete(args[0], astInfo));
                    },
                    this,
                    false
                );
            default:
                break;
        }
        return undefined;
    }

    override setCore(): void {
        throw new ScriptError('値のセットは制限されています。');
    }

    override toJObject(): unknown {
        return this.room.bgms;
    }
}
