import { Field, ObjectType, createUnionType } from 'type-graphql';
import { UpdateBookmarkFailureType } from '../../enums/UpdateBookmarkFailureType';

@ObjectType()
export class UpdateBookmarkSuccessResult {
    @Field()
    public prevValue!: boolean;

    @Field()
    public currentValue!: boolean;
}

@ObjectType()
export class UpdateBookmarkFailureResult {
    @Field(() => UpdateBookmarkFailureType)
    public failureType!: UpdateBookmarkFailureType;
}

export const UpdateBookmarkResult = createUnionType({
    name: 'UpdateBookmarkResult',
    types: () => [UpdateBookmarkSuccessResult, UpdateBookmarkFailureResult] as const,
    resolveType: value => {
        if ('bookmarked' in value) {
            return UpdateBookmarkSuccessResult;
        }
        if ('failureType' in value) {
            return UpdateBookmarkFailureResult;
        }
        return undefined;
    },
});
