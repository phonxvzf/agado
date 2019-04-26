exports.up = async (knex) => {
  return knex.raw(`
    ALTER TABLE "reservation"
    ALTER COLUMN "checkin" TYPE timestamptz;

    ALTER TABLE "reservation"
    ALTER COLUMN "checkout" TYPE timestamptz;

    ALTER TABLE "review"
    ALTER COLUMN "date" TYPE timestamptz;
  `);
};

exports.down = async (knex) => {
  return knex.raw(`
    ALTER TABLE "reservation"
    ALTER COLUMN "checkin" TYPE DATE;

    ALTER TABLE "reservation"
    ALTER COLUMN "checkout" TYPE DATE;

    ALTER TABLE "review"
    ALTER COLUMN "date" TYPE DATE;
  `);
}
