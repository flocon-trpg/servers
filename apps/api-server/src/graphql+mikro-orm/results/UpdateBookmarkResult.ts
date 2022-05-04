import { Field, ObjectType } from 'type-graphql';
import { UpdateBookmarkFailureType } from '../../enums/UpdateBookmarkFailureType';

@ObjectType()
export class UpdateBookmarkResult {
    @Field(() => UpdateBookmarkFailureType, { nullable: true })
    public failureType?: UpdateBookmarkFailureType;
}
