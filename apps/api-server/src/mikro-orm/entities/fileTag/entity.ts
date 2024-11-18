import {
    Collection,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryKey,
    Property,
    Ref,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { File } from '../file/entity';
import { User } from '../user/entity';

@Entity()
export class FileTag {
    public constructor({ name }: { name: string }) {
        this.name = name;
    }

    @PrimaryKey()
    public id: string = v4();

    @Property()
    public name!: string;

    @ManyToOne(() => User, { ref: true })
    public user!: Ref<User>;

    @ManyToMany(() => File, x => x.fileTags)
    public files = new Collection<File>(this);
}
