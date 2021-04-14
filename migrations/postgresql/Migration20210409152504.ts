import { Migration } from '@mikro-orm/migrations';

export class Migration20210409152504 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "room" add column "public_channel1name" varchar(255) not null default \'\', add column "public_channel2name" varchar(255) not null default \'\', add column "public_channel3name" varchar(255) not null default \'\', add column "public_channel4name" varchar(255) not null default \'\', add column "public_channel5name" varchar(255) not null default \'\', add column "public_channel6name" varchar(255) not null default \'\', add column "public_channel7name" varchar(255) not null default \'\', add column "public_channel8name" varchar(255) not null default \'\', add column "public_channel9name" varchar(255) not null default \'\', add column "public_channel10name" varchar(255) not null default \'\';');

    this.addSql('alter table "room_op" add column "public_channel1name" varchar(255) null, add column "public_channel2name" varchar(255) null, add column "public_channel3name" varchar(255) null, add column "public_channel4name" varchar(255) null, add column "public_channel5name" varchar(255) null, add column "public_channel6name" varchar(255) null, add column "public_channel7name" varchar(255) null, add column "public_channel8name" varchar(255) null, add column "public_channel9name" varchar(255) null, add column "public_channel10name" varchar(255) null;');
  }

}
