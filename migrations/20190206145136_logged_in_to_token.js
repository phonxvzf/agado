exports.up = async (knex) => {
  await knex.raw(`
    ALTER TABLE "user"
    DROP COLUMN logged_in;
  `);
  return knex.raw(`
    ALTER TABLE "user"
    ADD COLUMN token VARCHAR(255) DEFAULT NULL;
  `);
};

exports.down = async (knex) => {
  await knex.raw(`
    ALTER TABLE "user"
    DROP COLUMN token;
  `);
  return knex.raw(`
    ALTER TABLE "user"
    ADD COLUMN logged_in BOOLEAN;
  `);
};
