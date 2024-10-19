/* eslint-disable */

declare type Index5 = 1 | 2 | 3 | 4 | 5;

declare type Index20 =
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20;

declare type Bgm = {
    /**
     * 再生しているかどうかを表す値の取得、もしくは変更を行います。trueならば再生を、falseならば停止を表します。
     */
    isPlaying: boolean;

    /**
     * ボリュームを表す値の取得、もしくは変更を行います。通常は、0～100の数値を指定します。
     */
    volume: number;

    /**
     * 再生する音楽ファイルを表す値の取得、もしくは変更を行います。
     */
    files: FilePath[];
};

declare type Bgms = {
    new (): Bgms;

    /**
     * key番目のBGMを返します。例えばkeyに3を渡した場合は、BGM3を返します。該当するBGMオブジェクトが存在しない場合はundefinedを返します。
     * @param key 1から5の整数である数値
     */
    find(key: Index5): Bgm | undefined;

    /**
     * key番目のBGMを返します。例えばkeyに3を渡した場合は、BGM3を返します。該当するBGMオブジェクトが存在しない場合は作成してから返します。
     * @param key 1から5の整数である数値
     */
    ensure(key: Index5): Bgm;

    /**
     * key番目のBGMがもし存在するならば削除します。
     * @param key 1から5の整数である数値
     */
    delete(key: Index5): boolean;
};

declare type BooleanParameter = {
    new (): BooleanParameter;

    /**
     * 値が非公開かどうかを表す値の取得、もしくは変更を行います。trueならば非公開、falseならば公開を表します。
     */
    isValueSecret: boolean;

    /**
     * 値の取得、もしくは変更を行います。
     */
    value: boolean | undefined;
};

declare type BooleanParameters = {
    new (): BooleanParameters;

    /**
     * パラメーター名がparamNameと一致する最初のパラメーターを探して、それを返します。見つからなかった場合はundefinedを返します。
     */
    find(paramName: string): BooleanParameter | undefined;
    /**
     * key番目のパラメーターを返します。例えばkeyに3を渡した場合は、チェックマークパラメーター3を返します。
     */
    find(key: Index20): BooleanParameter;

    /**
     * パラメーター名がparamNameと一致する最初のチェックマークパラメーターを探して、もし見つかった場合はその値を反転します。
     */
    toggleValue(paramName: string): void;
    /**
     * key番目のチェックマークパラメーターの値を反転します。
     */
    toggleValue(key: Index20): void;

    /**
     * パラメーター名がparamNameと一致する最初のチェックマークパラメーターを探して、もし見つかった場合はその値をnewValueに置き換えます。
     */
    setValue(paramName: string, newValue: boolean): void;
    /**
     * key番目のチェックマークパラメーターの値をnewValueに置き換えます。
     */
    setValue(key: Index20, newValue: boolean): void;

    /**
     * パラメーター名がparamNameと一致する最初のチェックマークパラメーターを探して、もし見つかった場合はその値の非公開状態をnewValueに置き換えます。
     */
    setIsValueSecret(paramName: string, newValue: boolean): void;
    /**
     * key番目のチェックマークパラメーターの非公開状態をnewValueに置き換えます。
     */
    setIsValueSecret(key: Index20, newValue: boolean): void;
};

declare type NumberParameter = {
    new (): NumberParameter;

    /**
     * 値が非公開かどうかを表す値の取得、もしくは変更を行います。trueならば非公開、falseならば公開を表します。
     */
    isValueSecret: boolean;

    /**
     * 値の取得、もしくは変更を行います。
     */
    value: number | undefined;
};

declare type NumberParameters = {
    new (): NumberParameters;

    /**
     * パラメーター名がparamNameと一致する最初の数値パラメーターを探して、それを返します。見つからなかった場合はundefinedを返します。
     */
    find(paramName: string): NumberParameter | undefined;
    /**
     * key番目の数値パラメーターを返します。例えばkeyに3を渡した場合は、数値パラメーター3を返します。
     */
    find(key: Index20): NumberParameter;

    /**
     * パラメーター名がparamNameと一致する最初の数値パラメーターを探して、もし見つかった場合はその値にincrementByの値を足します。
     */
    incrementValue(paramName: string, incrementBy: number): void;
    /**
     * key番目の数値パラメーターの値にincrementByの値を足します。
     */
    incrementValue(key: Index20, incrementBy: number): void;

    /**
     * パラメーター名がparamNameと一致する最初の数値パラメーターを探して、もし見つかった場合はその値からdecrementByの値を引きます。
     */
    decrementValue(paramName: string, decrementBy: number): void;
    /**
     * key番目の数値パラメーターの値からdecrementByの値を足します。
     */
    decrementValue(key: Index20, decrementBy: number): void;

    /**
     * パラメーター名がparamNameと一致する最初の数値パラメーターを探して、もし見つかった場合はその値をnewValueに置き換えます。
     */
    setValue(paramName: string, newValue: number): void;
    /**
     * key番目の数値パラメーターの値をnewValueに置き換えます。
     */
    setValue(key: Index20, newValue: number): void;

    /**
     * パラメーター名がparamNameと一致する最初の数値パラメーターを探して、もし見つかった場合はその値の非公開状態をnewValueに置き換えます。
     */
    setIsValueSecret(paramName: string, newValue: boolean): void;
    /**
     * key番目の数値パラメーターの非公開状態をnewValueに置き換えます。
     */
    setIsValueSecret(key: Index20, newValue: boolean): void;
};

declare type StringParameter = {
    new (): StringParameter;

    /**
     * 値が非公開かどうかを表す値の取得、もしくは変更を行います。trueならば非公開、falseならば公開を表します。
     */
    isValueSecret: boolean;

    /**
     * 値の取得、もしくは変更を行います。
     */
    value: string;
};

declare type StringParameters = {
    new (): StringParameters;

    /**
     * パラメーター名がparamNameと一致する最初の文字列パラメーターを探して、それを返します。見つからなかった場合はundefinedを返します。
     */
    find(paramName: string): StringParameter | undefined;
    /**
     * key番目の文字列パラメーターを返します。例えばkeyに3を渡した場合は、文字列パラメーター3を返します。
     */
    find(key: Index20): StringParameter;

    /**
     * パラメーター名がparamNameと一致する最初の文字列パラメーターを探して、もし見つかった場合はその値をnewValueに置き換えます。
     */
    setValue(paramName: string, newValue: string): void;
    /**
     * key番目の文字列パラメーターの値をnewValueに置き換えます。
     */
    setValue(key: Index20, newValue: string): void;

    /**
     * パラメーター名がparamNameと一致する最初の文字列パラメーターを探して、もし見つかった場合はその値の非公開状態をnewValueに置き換えます。
     */
    setIsValueSecret(paramName: string, newValue: boolean): void;
    /**
     * key番目の文字列パラメーターの非公開状態をnewValueに置き換えます。
     */
    setIsValueSecret(key: Index20, newValue: boolean): void;
};

declare type Character = {
    new (): Character;

    /**
     * アイコン画像のパスの取得、もしくは変更を行います。
     */
    icon: FilePath | null;

    /**
     * 立ち絵画像のパスの取得、もしくは変更を行います。
     */
    portrait: FilePath | null;

    /**
     * キャラクターの名前の取得、もしくは変更を行います。
     */
    name: string;

    /**
     * チェックマークパラメーター。
     */
    get booleanParameters(): BooleanParameters;

    /**
     * 数値パラメーター(現在値)。
     */
    get numberParameters(): NumberParameters;

    /**
     * 数値パラメーター(最大値)。
     */
    get maxNumberParameters(): NumberParameters;

    /**
     * 文字列パラメーター。
     */
    get stringParameters(): StringParameters;
};

declare type ParameterNames = {
    new (): ParameterNames;

    /**
     * パラメーター名を取得します。該当するパラメーター名が存在しない場合は、undefinedを返します。
     * @param key 1から20の整数である数値
     */
    getName(key: Index20): string | undefined;

    /**
     * パラメーター名を変更します。該当するパラメーター名が存在しない場合は、パラメーターが自動的に作成されます。
     * @param key 1から20の整数である数値
     */
    setName(key: Index20, newName: string): void;

    /**
     * パラメーターを削除します。該当するパラメーター名が存在した場合はtrueを、そうでなければfalseを返します。
     * @param key 1から20の整数である数値
     */
    delete(key: Index20): boolean;
};

declare type FilePath = {
    /**
     * sourceType に Default を指定した場合は、例えば https://example.com/image.png のようにファイルへのリンクを指定してください。sourceType に FirebaseStorage を指定した場合は、/version/1/uploader/unlisted/<ユーザーID>/<ファイル名> のような文字列を指定してください。
     */
    path: string;

    /**
     * ファイルパスの種類を表します。例えば https://example.com/image.png のような通常のリンクを表す場合は Default という文字列を指定して下さい。Firebase Storage上のファイルを表す場合は FirebaseStorage という文字列を指定して下さい。
     */
    sourceType: 'Default' | 'FirebaseStorage';
};

declare type Room = {
    new (): Character;

    /**
     * 部屋名の取得、もしくは変更を行います。
     */
    name: string;

    /**
     * チェックマークパラメーターの名前。
     */
    get booleanParameterNames(): ParameterNames;

    /**
     * 数値パラメーターの名前。
     */
    get numberParameterNames(): ParameterNames;

    /**
     * 文字列パラメーターの名前。
     */
    get stringParameterNames(): ParameterNames;
};
