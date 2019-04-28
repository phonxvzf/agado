exports.up = async (knex) => {
  return knex.raw(`
    ALTER TABLE "user"
    ALTER COLUMN "img" TYPE TEXT
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    ALTER TABLE "user"
    ALTER COLUMN "img" TYPE VARCHAR(2048)
  `);
};
