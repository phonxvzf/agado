const fs = require('fs');

exports.up = async (knex) => {
  const sql = fs.readFileSync('sql/create_user_table.sql').toString();
  return knex.raw(sql);
};

exports.down = async (knex) => {
  await knex.raw('DROP TABLE public.user');
  await knex.raw('DROP TYPE user_types');
  await knex.raw('DROP TYPE genders');
};
