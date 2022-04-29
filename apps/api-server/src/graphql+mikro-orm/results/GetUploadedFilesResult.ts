import { Field, ObjectType, createUnionType } from 'type-graphql';
import { GetFileItemsFailureType } from '../../enums/GetFileItemsFailureType';
import { FileItem } from '../entities/file/graphql';

@ObjectType()
export class GetUploadedFilesSuccessResult {
    @Field(() => [FileItem])
    public files!: FileItem[];
}

@ObjectType()
export class GetUploadedFilesFailureResult {
    @Field(() => GetFileItemsFailureType)
    public failureType!: GetFileItemsFailureType;
}

export const GetUploadedFilesResult = createUnionType({
    name: 'GetUploadedFilesResult',
    types: () => [GetUploadedFilesSuccessResult, GetUploadedFilesFailureResult] as const,
    resolveType: value => {
        if ('files' in value) {
            return GetUploadedFilesSuccessResult;
        }
        if ('failureType' in value) {
            return GetUploadedFilesFailureResult;
        }
        return undefined;
    },
});
