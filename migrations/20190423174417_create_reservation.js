exports.up = async (knex) => {
  return knex.raw(`
    CREATE TABLE "reservation" (
      reservation_id SERIAL PRIMARY KEY,
      user_id INTEGER,
      hotel_id INTEGER,
      room_id INTEGER,
      num INTEGER,
      checkin DATE,
      checkout DATE
    );

    ALTER TABLE "reservation"
    ADD FOREIGN KEY ("user_id")
    REFERENCES "user"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;

    ALTER TABLE "reservation"
    ADD FOREIGN KEY ("hotel_id", "room_id")
    REFERENCES hotel_room("hotel_id", "room_id") ON UPDATE CASCADE ON DELETE CASCADE;
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    DROP TABLE "reservation";
  `);
}
