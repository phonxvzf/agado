exports.up = async (knex) => {
  return knex.raw(`
    CREATE TABLE "hotel_img" (
      hotel_id INTEGER,
      img_id SERIAL,
      img TEXT
    );

    ALTER TABLE "hotel_img"
    ADD PRIMARY KEY ("hotel_id", "img_id");

    ALTER TABLE "hotel_img"
    ADD FOREIGN KEY ("hotel_id")
    REFERENCES hotel("hotel_id") ON UPDATE CASCADE ON DELETE CASCADE;
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    DROP TABLE "hotel_img"
  `);
}
