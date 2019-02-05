const fs = require('fs');

exports.up = async (knex) => {
  const sql = fs.readFileSync('sql/create_user_table.sql').toString();
  return knex.raw(sql);
};

exports.down = async (knex) => {
  return knex.raw('DROP TABLE USER');
};
