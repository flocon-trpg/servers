import { Field, ObjectType } from 'type-graphql';
import { EntryToServerResultType } from '../../enums/EntryToServerResultType';

@ObjectType()
export class EntryToServerResult {
    @Field(() => EntryToServerResultType)
    public type!: EntryToServerResultType;
}