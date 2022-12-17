export enum JoinRoomFailureType {
    NotFound = 'NotFound',
    WrongPassword = 'WrongPassword',
    AlreadyParticipant = 'AlreadyParticipant',
    /** @deprecated 他の Mutation などと整合性をとるため、Transform でエラーが発生したときは、これを返す代わりに Error を throw するようになる可能性があります。 */
    TransformError = 'TransformError',
}
