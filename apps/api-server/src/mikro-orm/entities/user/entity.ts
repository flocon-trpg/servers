import {
    Collection,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryKey,
    PrimaryKeyProp,
    Property,
} from '@mikro-orm/core';
import { BaasType } from '../../../enums/BaasType';
import { File } from '../file/entity';
import { FileTag } from '../fileTag/entity';
import { Participant } from '../participant/entity';
import { Room } from '../room/entity';
import { RoomPrvMsg, RoomPubMsg, RoomSe } from '../roomMessage/entity';

// ユーザーがアカウント登録した時点では作られず、初めてentryなどをしたときに作られる。
@Entity()
export class User {
    public constructor({ userUid, baasType }: { userUid: string; baasType: BaasType }) {
        this.userUid = userUid;
        this.baasType = baasType;
    }

    // TODO: 機会があれば 'id' 等にリネームしたい。理由は [PrimaryKeyProp] のコメントを参照。
    @PrimaryKey()
    public userUid: string;

    // mikro-orm では主キーの名前は 'id' か 'uuid' が想定されているようなので、これら以外だと Relationship における Reference を直接作成することができない。多少無理やり感があるが、PrimaryKeyProp で指定することで対処している。
    [PrimaryKeyProp]?: ['userUid'];

    @Property({ type: 'string', index: true })
    public baasType: BaasType;

    @Property({ index: true })
    public isEntry: boolean = false;

    @OneToMany(() => Participant, x => x.user, { orphanRemoval: true })
    public participants = new Collection<Participant>(this);

    @OneToMany(() => File, x => x.createdBy, { orphanRemoval: true })
    public files = new Collection<File>(this);

    @OneToMany(() => FileTag, x => x.user, { orphanRemoval: true })
    public fileTags = new Collection<FileTag>(this);

    @OneToMany(() => RoomPubMsg, x => x.createdBy, { orphanRemoval: true })
    public roomPubMsgs = new Collection<RoomPubMsg>(this);

    @OneToMany(() => RoomPrvMsg, x => x.createdBy, { orphanRemoval: true })
    public roomPrvMsgs = new Collection<RoomPrvMsg>(this);

    @OneToMany(() => RoomPrvMsg, x => x.createdBy, { orphanRemoval: true })
    public roomSEs = new Collection<RoomSe>(this);

    @ManyToMany(() => RoomPrvMsg, x => x.visibleTo, { owner: true })
    public visibleRoomPrvMsgs = new Collection<RoomPrvMsg>(this);

    @ManyToMany(() => Room, x => x.bookmarkedBy, { owner: true })
    public bookmarkedRooms = new Collection<Room>(this);
}
