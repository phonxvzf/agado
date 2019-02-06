exports.up = async (knex) => {
  return knex.raw(`
    ALTER TABLE "user"
    ADD CONSTRAINT _unique_username UNIQUE (username);
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    ALTER TABLE "user"
    DROP CONSTRAINT _unique_username;
  `);
};
