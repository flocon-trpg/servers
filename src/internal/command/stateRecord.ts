import {
    FString,
    FValue,
    OnGettingParams,
    ScriptError,
    FRecordRef,
    FFunction,
    AstInfo,
    FRecord,
} from '@kizahasi/flocon-script';
import { simpleId } from '../simpleId';

export class FStateRecord<TSource, TRef extends FValue> extends FRecordRef<TSource | undefined> {
    private readonly createNewState?: () => TSource;
    private readonly toRef: (source: TSource) => TRef;

    public constructor({
        states,
        createNewState,
        toRef,
        unRef,
    }: {
        states: Record<string, TSource | undefined>;

        // undefinedの場合はcreateが無効化されreadonlyとなる
        createNewState?: () => TSource;

        toRef: (source: TSource) => TRef;
        unRef: (ref: FValue) => TSource;
    }) {
        super(
            states,
            state => (state === undefined ? undefined : toRef(state)),
            fValue => unRef(fValue)
        );
        this.createNewState = createNewState;
        this.toRef = toRef;
    }

    private static prepareInstanceMethod2(isNew: boolean, astInfo: AstInfo | undefined) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }

    override getCore({ key, astInfo }: OnGettingParams): FValue {
        switch (key) {
            case 'set':
                // setを有効化すると、idに''などの適当な文字を入れてエラーになることが多発しそうなため、代わりにcreateを使ってもらうようにしている。
                return undefined;
            case 'create': {
                const createNewState = this.createNewState;
                if (createNewState == null) {
                    return undefined;
                }

                /*
                createメソッドの代わりにaddメソッドを実装してユーザーが作成したStateを代入できるようにする作戦は不採用とした。理由は、下のようなコードを書かれた場合に困るため。
                
                let states; // FStatesRecordのインスタンス
                let newState; // Stateのインスタンス
                states.add(newState);
                states.add(newState);
                newState.name = 'foo';

                newStateはFRecordであり、それをFStatesRecord.statesに追加する場合はJavaScriptオブジェクトに変換するかFRecordのまま保持するしかない。だが、前者の場合はnewStateの参照の同一性が保持できず、後者はFStatesRecord.statesに2つの型が混在するためコードが複雑化するという問題がある。
                */

                return new FFunction(({ isNew, astInfo }) => {
                    FStateRecord.prepareInstanceMethod2(isNew, astInfo);
                    const newState = createNewState();
                    const record = this.toJObject();
                    const id = simpleId();
                    record[id] = newState;
                    const result = new FRecord();
                    result.set({ property: new FString('id'), newValue: new FString(id), astInfo });
                    result.set({
                        property: new FString('value'),
                        newValue: this.toRef(newState),
                        astInfo,
                    });
                    return result;
                });
            }
            default:
                return super.getCore({ key, astInfo });
        }
    }
}
