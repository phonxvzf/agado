exports.up = async (knex) => {
  return knex.raw(`
    CREATE TABLE "hotel_room_amenity" (
      hotel_id INTEGER,
      room_id INTEGER,
      amenity_id INTEGER
    );

    ALTER TABLE "hotel_room_amenity"
    ADD PRIMARY KEY ("hotel_id", "room_id", "amenity_id");

    ALTER TABLE "hotel_room_amenity"
    ADD FOREIGN KEY ("hotel_id", "room_id")
    REFERENCES hotel_room("hotel_id", "room_id") ON UPDATE CASCADE ON DELETE CASCADE;
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    DROP TABLE "hotel_room_amenity";
  `);
};
