exports.up = async (knex) => {
  return knex.raw(`
    ALTER TABLE "hotel"
    RENAME COLUMN "prov" TO "city";
    ALTER TABLE "hotel"
    RENAME COLUMN "addr" TO "address";
    ALTER TABLE "hotel"
    DROP COLUMN "lat";
    ALTER TABLE "hotel"
    DROP COLUMN "long";
    ALTER TABLE "hotel"
    DROP COLUMN "rating";
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    ALTER TABLE "hotel"
    RENAME COLUMN "city" TO "prov";
    ALTER TABLE "hotel"
    RENAME COLUMN "address" TO "addr";
    ALTER TABLE "hotel"
    ADD COLUMN "lat" REAL;
    ALTER TABLE "hotel"
    ADD COLUMN "long" REAL;
    ALTER TABLE "hotel"
    ADD COLUMN "rating" REAL;
  `);
};
