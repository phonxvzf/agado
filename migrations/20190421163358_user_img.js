exports.up = async (knex) => {
  return knex.raw(`
    ALTER TABLE "user" 
    ADD COLUMN "img" VARCHAR(2048) DEFAULT NULL
  `)
};

exports.down = async (knex) => {
  return knex.raw(`
    ALTER TABLE "user" 
    DROP COLUMN "img"
  `)
};
