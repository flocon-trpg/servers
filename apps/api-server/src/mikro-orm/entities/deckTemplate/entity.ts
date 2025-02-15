import { State, deckTemplateTemplate } from '@flocon-trpg/core';
import { Entity, Index, JsonType, ManyToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core';
import { v7 } from 'uuid';
import { PermissionType } from '../../../enums/PermissionType';
import { User } from '../user/entity';

// 競合編集はRoomと比べて発生しにくいと考えられるため、DeckTemplateのOperationはDBに保存していない。

type DeckTemplateType = State<typeof deckTemplateTemplate>;

@Entity()
export class DeckTemplate {
    public constructor({
        createdBy,
        value,
        listPermission,
        updatePermission,
        deletePermission,
    }: {
        createdBy: Ref<User>;
        value: DeckTemplateType;
        listPermission: PermissionType;
        updatePermission: PermissionType;
        deletePermission: PermissionType;
    }) {
        this.createdBy = createdBy;
        this.value = value;
        this.listPermission = listPermission;
        this.updatePermission = updatePermission;
        this.deletePermission = deletePermission;
    }

    @PrimaryKey()
    public id: string = v7();

    @Property({ version: true, index: true })
    public version: number = 1;

    @Property({ type: Date, nullable: true, onCreate: () => new Date(), index: true })
    public createdAt?: Date;

    @Property({ type: Date, nullable: true, onUpdate: () => new Date(), index: true })
    public updatedAt?: Date;

    @Property({ type: JsonType })
    public value: DeckTemplateType;

    @Property({ type: 'string' })
    @Index()
    public listPermission: PermissionType;

    @Property({ type: 'string' })
    @Index()
    public updatePermission: PermissionType;

    @Property({ type: 'string' })
    @Index()
    public deletePermission: PermissionType;

    @Property()
    public revision: number = 0;

    @ManyToOne(() => User, { ref: true })
    public createdBy!: Ref<User>;
}
