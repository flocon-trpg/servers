import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PermissionType } from '../../enums/PermissionType';
import { OperatedBy } from './operatedBy';

@ObjectType()
export class CustomDeckTemplate {
    @Field(() => ID, {
        description: 'サーバーで管理されているID。ソートすると作成した時系列順になる。',
    })
    public id!: string;

    @Field({
        description:
            'DeckTemplateのState。@flocon-trpg/coreのstate(deckTemplateTemplate).parse(...)でdecodeできる。',
    })
    public valueJson!: string;

    @Field({ nullable: true })
    public createdAt?: number;

    @Field(() => PermissionType)
    public listPermission!: PermissionType;

    @Field(() => PermissionType)
    public updatePermission!: PermissionType;

    @Field(() => PermissionType)
    public deletePermission!: PermissionType;
}

@ObjectType()
export class CustomDeckTemplateAsListItem {
    @Field(() => ID, {
        description: 'サーバーで管理されているID。ソートすると作成した時系列順になる。',
    })
    public id!: string;

    @Field({ nullable: true })
    public createdAt?: number;

    @Field(() => PermissionType)
    public listPermission!: PermissionType;

    @Field(() => PermissionType)
    public updatePermission!: PermissionType;

    @Field(() => PermissionType)
    public deletePermission!: PermissionType;
}

@ObjectType()
export class CustomDeckTemplateOperation {
    @Field()
    public revisionTo!: number;

    @Field(() => OperatedBy, {
        nullable: true,
        description: 'operateDeckOperationを実行した人物。promoteなどの結果の場合はnullishになる。',
    })
    public operatedBy?: OperatedBy;

    @Field({ description: 'DeckTemplateのUpOperationをJSONにした値。' })
    public valueJson!: string;
}
