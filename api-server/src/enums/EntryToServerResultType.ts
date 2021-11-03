export enum EntryToServerResultType {
    Success = 'Success',
    NotSignIn = 'NotSignIn',
    AlreadyEntried = 'AlreadyEntried',
    // TODO: 現状ではphraseよりはpasswordという名前のほうが適切なのでリネームするほうが良い
    NoPhraseRequired = 'NoPhraseRequired',
    WrongPhrase = 'WrongPhrase',
}
