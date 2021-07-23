import { createUnionType, Field, ObjectType } from 'type-graphql';
import { RequiresPhraseFailureType } from '../../enums/RequiresPhraseFailureType';

@ObjectType()
export class RequiresPhraseSuccessResult {
    @Field()
    public value!: boolean;
}

@ObjectType()
export class RequiresPhraseFailureResult {
    @Field(() => RequiresPhraseFailureType)
    public failureType!: RequiresPhraseFailureType;
}

export const RequiresPhraseResult = createUnionType({
    name: 'RequiresPhraseResult',
    types: () => [RequiresPhraseSuccessResult, RequiresPhraseFailureResult] as const,
    resolveType: value => {
        if ('value' in value) {
            return RequiresPhraseSuccessResult;
        }
        if ('failureType' in value) {
            return RequiresPhraseFailureResult;
        }
        return undefined;
    },
});
