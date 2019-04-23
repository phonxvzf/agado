exports.up = async (knex) => {
  return knex.raw(`
    ALTER TABLE "hotel_manager"
    RENAME COLUMN "uid" TO "user_id";

    ALTER TABLE "hotel_manager"
    RENAME COLUMN "hid" TO "hotel_id";
    
    ALTER TABLE "hotel_manager"

    DROP COLUMN "permitted";
    DROP TYPE "permission_status";
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    ALTER TABLE "hotel_manager"
    RENAME COLUMN "user_id" TO "uid";

    ALTER TABLE "hotel_manager"
    RENAME COLUMN "hotel_id" TO "hid";

    CREATE TYPE permission_status AS ENUM ('no','req','pmt');

    ALTER TABLE "hotel_manager"
    ADD COLUMN "permitted" permission_status;
  `);
}
