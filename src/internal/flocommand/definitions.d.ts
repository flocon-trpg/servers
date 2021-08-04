declare type NumberParameter = {
    new (): NumberParameter;

    isValueSecret: boolean;
    value: number | undefined;
};

declare type NumberParameters = {
    new (): NumberParameters;

    find(paramName: string): NumberParameter | undefined;
    incrementValue(paramName: string, incrementBy: number): void;
    decrementValue(paramName: string, decrementBy: number): void;
    setValue(paramName: string, newValue: number): void;

    readonly 1: NumberParameter;
    readonly 2: NumberParameter;
    readonly 3: NumberParameter;
    readonly 4: NumberParameter;
    readonly 5: NumberParameter;
    readonly 6: NumberParameter;
    readonly 7: NumberParameter;
    readonly 8: NumberParameter;
    readonly 9: NumberParameter;
    readonly 10: NumberParameter;
};

declare type Character = {
    new (): Character;

    /**
     * アイコン画像の取得、設定を行えます。
     */
    icon: FilePath | null;

    portrait: FilePath | null;

    /**
     * 名前の取得、設定を行えます。
     */
    name: string;

    get numberParameters(): NumberParameters;
    get maxNumberParameters(): NumberParameters;
};

declare type FilePath = {
    path: string;

    sourceType: 'Default' | 'FirebaseStorage';
};

declare type Room = {
    new (): Character;

    name: string;
};
