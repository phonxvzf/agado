exports.up = async (knex) => {
  return knex.raw(`
    ALTER TABLE "user"
    DROP CONSTRAINT "_unique_username";
    ALTER TABLE "user"
    ADD CONSTRAINT "_unique_username_user_type" UNIQUE ("username", "user_type");
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    ALTER TABLE "user"
    DROP CONSTRAINT "_unique_username_user_type";
    ALTER TABLE "user"
    ADD CONSTRAINT "_unique_username" UNIQUE ("username");
  `);
};
