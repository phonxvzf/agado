exports.up = async (knex) => {
  return knex.raw(`
    CREATE TABLE "request" (
      request_id SERIAL PRIMARY KEY,
      user_id INTEGER,
      hotel_id INTEGER
    );

    ALTER TABLE "request"
    ADD FOREIGN KEY ("user_id")
    REFERENCES "user"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;

    ALTER TABLE "request"
    ADD FOREIGN KEY ("hotel_id")
    REFERENCES hotel("hotel_id") ON UPDATE CASCADE ON DELETE CASCADE;
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    DROP TABLE "request";
  `);
}
