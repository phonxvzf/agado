exports.up = async (knex) => {
  return knex.raw(`
    CREATE TABLE "review" (
      review_id SERIAL PRIMARY KEY,
      user_id INTEGER,
      hotel_id INTEGER,
      title VARCHAR(255),
      comment TEXT,
      rating INTEGER,
      "date" DATE
    );

    ALTER TABLE "review"
    ADD FOREIGN KEY ("user_id")
    REFERENCES public.user("user_id") ON UPDATE CASCADE ON DELETE CASCADE;

    ALTER TABLE "review"
    ADD FOREIGN KEY ("hotel_id")
    REFERENCES hotel("hotel_id") ON UPDATE CASCADE ON DELETE CASCADE;
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    DROP TABLE "review";
  `);
}
