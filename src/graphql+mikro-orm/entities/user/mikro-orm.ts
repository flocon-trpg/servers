import {
    Collection,
    Entity,
    Enum,
    ManyToMany,
    OneToMany,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { BaasType } from '../../../enums/BaasType';
import { File } from '../file/mikro-orm';
import { Participant } from '../participant/mikro-orm';
import { RoomPrvMsg, RoomPubMsg, RoomSe } from '../roomMessage/mikro-orm';

// ユーザーがアカウント登録した時点では作られず、初めてentryなどをしたときに作られる。
@Entity()
export class User {
    public constructor({ userUid, baasType }: { userUid: string; baasType: BaasType }) {
        this.userUid = userUid;
        this.baasType = baasType;
    }

    @PrimaryKey()
    public userUid: string;

    @Enum({ items: () => BaasType, index: true })
    public baasType: BaasType;

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ index: true })
    public isEntry: boolean = false;

    @OneToMany(() => Participant, x => x.user, { orphanRemoval: true })
    public participants = new Collection<Participant>(this);

    @OneToMany(() => File, x => x.createdBy, { orphanRemoval: true })
    public files = new Collection<File>(this);

    @OneToMany(() => RoomPubMsg, x => x.createdBy, { orphanRemoval: true })
    public roomPubMsgs = new Collection<RoomPubMsg>(this);

    @OneToMany(() => RoomPrvMsg, x => x.createdBy, { orphanRemoval: true })
    public roomPrvMsgs = new Collection<RoomPrvMsg>(this);

    @OneToMany(() => RoomPrvMsg, x => x.createdBy, { orphanRemoval: true })
    public roomSEs = new Collection<RoomSe>(this);

    @ManyToMany(() => RoomPrvMsg, x => x.visibleTo, { owner: true })
    public visibleRoomPrvMsgs = new Collection<RoomPrvMsg>(this);
}
