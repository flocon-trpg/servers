export const all = 'all';

export type SendTo = {
    // このイベントを送信するユーザーのUserUid。allの場合は制限しない（全員に送る）。
    sendTo: typeof all | ReadonlySet<string>;
};
