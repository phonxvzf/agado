exports.up = async (knex) => {
  return knex.raw(`
    CREATE TABLE "hotel_room_img" (
      hotel_id INTEGER,
      room_id INTEGER,
      img_id SERIAL,
      img TEXT
    );

    ALTER TABLE "hotel_room_img"
    ADD PRIMARY KEY ("hotel_id", "room_id", "img_id");

    ALTER TABLE "hotel_room_img"
    ADD FOREIGN KEY ("hotel_id", "room_id")
    REFERENCES hotel_room("hotel_id", "room_id") ON UPDATE CASCADE ON DELETE CASCADE;
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    DROP TABLE "hotel_room_img";
  `);
}
