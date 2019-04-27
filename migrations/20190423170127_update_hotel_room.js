exports.up = async (knex) => {
  return knex.raw(`
    ALTER TABLE "hotel_room"
    RENAME "hid" TO "hotel_id";
    ALTER TABLE "hotel_room"
    RENAME "rid" TO "room_id";
    ALTER TABLE "hotel_room"
    RENAME "rname" TO "name";

    ALTER TABLE "hotel_room"
    DROP COLUMN "rno";
    ALTER TABLE "hotel_room"
    DROP COLUMN "max_cap";
    ALTER TABLE "hotel_room"
    DROP COLUMN "ex_bed";
    ALTER TABLE "hotel_room"
    DROP COLUMN "ex_bed_price";
    ALTER TABLE "hotel_room"
    DROP COLUMN "reserved";
    ALTER TABLE "hotel_room"
    DROP COLUMN "rstatus";

    ALTER TABLE "hotel_room"
    ADD COLUMN "num_bed" INTEGER;
    ALTER TABLE "hotel_room"
    ADD COLUMN "max_person" INTEGER;
    ALTER TABLE "hotel_room"
    ADD COLUMN "total_room" INTEGER;

    DROP TABLE IF EXISTS "hotel_room_tag";
    DROP TYPE "room_status";
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    CREATE TYPE "room_status" AS ENUM ('avail', 'unavail');

		DELETE FROM "hotel_room";	

    ALTER TABLE "hotel_room"
    RENAME "hotel_id" TO "hid";
    ALTER TABLE "hotel_room"
    RENAME "room_id" TO "rid";
    ALTER TABLE "hotel_room"
    RENAME "name" TO "rname";

    ALTER TABLE "hotel_room"
    ADD COLUMN "rno" VARCHAR(20) NOT NULL;
    ALTER TABLE "hotel_room"
    ADD COLUMN "max_cap" INTEGER DEFAULT 1;
    ALTER TABLE "hotel_room"
    ADD COLUMN "ex_bed" INTEGER DEFAULT 0;
    ALTER TABLE "hotel_room"
    ADD COLUMN "ex_bed_price" MONEY DEFAULT 0::money check (ex_bed_price >= 0::money);
    ALTER TABLE "hotel_room"
    ADD COLUMN "reserved" BOOLEAN DEFAULT FALSE;
    ALTER TABLE "hotel_room"
    ADD COLUMN "rstatus" room_status DEFAULT 'avail';

    ALTER TABLE "hotel_room"
    DROP COLUMN "num_bed";
    ALTER TABLE "hotel_room"
    DROP COLUMN "max_person";
    ALTER TABLE "hotel_room"
    DROP COLUMN "total_room";
  `);
};
