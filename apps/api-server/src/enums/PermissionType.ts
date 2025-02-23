export enum PermissionType {
    // 自分以外アクセスできない。自分がEntryしているかどうかは考慮しない。
    Private = 'Private',

    // Entryしているユーザーならば誰でもアクセス可能。
    Entry = 'Entry',
}
