exports.up = async (knex) => {
  return knex.raw(`
    ALTER TABLE "hotel"
    RENAME COLUMN "id" TO "hotel_id"
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    ALTER TABLE "hotel"
    RENAME COLUMN "hotel_id" TO "id"
  `);
};
