import {
    Collection,
    Entity,
    IdentifiedReference,
    Index,
    ManyToMany,
    ManyToOne,
    PrimaryKey,
    Property,
    Unique,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { File } from '../file/mikro-orm';
import { User } from '../user/mikro-orm';

@Entity()
export class FileTag {
    public constructor({ name }: { name: string }) {
        this.name = name;
    }

    @PrimaryKey()
    public id: string = v4();

    @Property()
    public name!: string;

    @ManyToOne(() => User)
    public user!: IdentifiedReference<User, 'userUid'>;

    @ManyToMany(() => File, x => x.fileTags)
    public files = new Collection<File>(this);
}
