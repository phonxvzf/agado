exports.up = async (knex) => {
  return knex.raw(`
    ALTER TABLE "user"
    RENAME COLUMN "id" to "user_id"
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    ALTER TABLE "user"
    RENAME COLUMN "user_id" to "id"
  `);
};
