exports.up = async (knex) => {
  return knex.raw(`
    DELETE FROM "hotel_img";

    ALTER TABLE "hotel_img"
    DROP COLUMN "img_id";

    ALTER TABLE "hotel_img"
    ADD PRIMARY KEY ("hotel_id");

    DELETE FROM "hotel_room_img";

    ALTER TABLE "hotel_room_img"
    DROP COLUMN "img_id";

    ALTER TABLE "hotel_room_img"
    ADD PRIMARY KEY ("hotel_id", "room_id");
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    ALTER TABLE "hotel_img"
    ADD COLUMN "img_id" SERIAL;

    ALTER TABLE "hotel_room_img"
    ADD COLUMN "img_id" SERIAL;
  `);
};
