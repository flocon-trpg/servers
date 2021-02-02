export const characterNotCreatedByMe = '自分が作成したキャラクターではないため、切り替えることができません。';
export const makeParameterNotPrivate = (isCharacterPrivate: boolean) => `現在このパラメーターは非公開です。自分以外が見ることはできません。${isCharacterPrivate ? '' : 'クリックすることで公開できます。'}`;
export const makeParameterPrivate = (isCharacterPrivate: boolean) => isCharacterPrivate ? '(現在このパラメーターの設定は公開になっていますが、キャラクター全体が非公開であるためこのパラメーターの値は公開されていません。)' : '現在このパラメーターは公開されています。クリックすることで非公開にできます。';
export const makeCharacterNotPrivate = '現在このキャラクターは非公開です。自分以外はこのキャラクターは存在しないように扱われ、パラメーターの読み書きもできません。クリックすることで公開できます。';
export const makeCharacterPrivate = '現在このキャラクターは公開されています。クリックすることで非公開にできます。キャラクターを非公開にすると、自分以外からはこのキャラクターは存在しないように扱われ、パラメーターの読み書きも防ぐことができます。';
export const deleteParameter = 'パラメーターを削除';
export const addParameter = 'パラメーターを追加';