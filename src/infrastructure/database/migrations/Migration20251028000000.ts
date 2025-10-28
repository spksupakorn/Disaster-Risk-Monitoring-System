import { Migration } from '@mikro-orm/migrations';

export class Migration20251028000000 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "region" ("id" serial primary key, "name" varchar(255) not null, "latitude" numeric(10,7) not null, "longitude" numeric(10,7) not null, "disaster_types" jsonb not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null);');

    this.addSql('create table "alert_setting" ("id" serial primary key, "region_id" int not null, "disaster_type" text check ("disaster_type" in (\'flood\', \'earthquake\', \'wildfire\')) not null, "threshold_score" int not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null);');

    this.addSql('create table "alert" ("id" serial primary key, "region_id" int not null, "disaster_type" text check ("disaster_type" in (\'flood\', \'earthquake\', \'wildfire\')) not null, "risk_level" text check ("risk_level" in (\'low\', \'medium\', \'high\')) not null, "risk_score" int not null, "message" text not null, "channel" text check ("channel" in (\'sms\', \'email\')) not null, "recipient" text null, "sent_at" timestamptz(0) not null, "created_at" timestamptz(0) not null);');

    this.addSql('alter table "alert_setting" add constraint "alert_setting_region_id_foreign" foreign key ("region_id") references "region" ("id") on update cascade;');

    this.addSql('alter table "alert" add constraint "alert_region_id_foreign" foreign key ("region_id") references "region" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "alert_setting" drop constraint "alert_setting_region_id_foreign";');

    this.addSql('alter table "alert" drop constraint "alert_region_id_foreign";');

    this.addSql('drop table if exists "region" cascade;');

    this.addSql('drop table if exists "alert_setting" cascade;');

    this.addSql('drop table if exists "alert" cascade;');
  }

}
