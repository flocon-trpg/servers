export const characterIsNotPrivateAndNotCreatedByMe = '現在このキャラクターは全体が公開されています。自分が作成したキャラクターではないため、非公開に切り替えることはできません。';
export const parameterIsNotPrivateAndNotCreatedByMe = '現在このパラメーターは公開されています。自分が作成したキャラクターではないため、非公開に切り替えることはできません。';
export const parameterIsPrivateAndNotCreatedByMe = 'キャラクターの作成者によって、このパラメーターは非公開にされています。';
export const parameterIsPrivate = ({ isCharacterPrivate, isCreate }: { isCharacterPrivate: boolean; isCreate: boolean }) => {
    if (isCreate) {
        if (isCharacterPrivate) {
            return '(キャラクター全体が非公開であるため、このパラメーターの公開設定に関わらず非公開になります。)';
        }
        return 'このパラメーターは非公開になります。自分以外が読み書きすることはできません。';
    }
    if (isCharacterPrivate) {
        return '(キャラクター全体が非公開であるため、このパラメーターは公開設定に関わらず非公開になっています。)';
    }
    return '現在このパラメーターは非公開です。自分以外が読み書きすることはできません。';
};
export const parameterIsNotPrivate = ({ isCharacterPrivate, isCreate }: { isCharacterPrivate: boolean; isCreate: boolean }) => {
    if (isCreate) {
        if (isCharacterPrivate) {
            return '(キャラクター全体が非公開であるため、このパラメーターの公開設定に関わらず非公開になります。)';
        }

        return 'このパラメーターは公開されます。自分以外も読み書きができます。';
    }
    if (isCharacterPrivate) {
        return '(キャラクター全体が非公開であるため、このパラメーターは公開設定に関わらず非公開になっています。)';
    }

    return '現在このパラメーターは公開されています。自分以外も読み書きができます。';
};
export const characterIsPrivate = ({ isCreate }: { isCreate: boolean }) => isCreate ? 'このキャラクターは全体が非公開になります。自分以外はこのキャラクターは存在しないように扱われ、パラメーターの読み書きもできません。' : '現在このキャラクターは全体が非公開です。自分以外はこのキャラクターは存在しないように扱われ、パラメーターの読み書きもできません。';
export const characterIsNotPrivate = ({ isCreate }: { isCreate: boolean }) => isCreate ? 'このキャラクターは全体が公開されます。' : '現在このキャラクターは全体が公開されています。';
export const deleteParameter = '削除';
export const addParameter = '追加';