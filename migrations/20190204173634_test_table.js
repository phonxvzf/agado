exports.up = async (knex) => {
  return knex.raw('CREATE TABLE test (code INTEGER PRIMARY KEY)');
};

exports.down = async (knex) => {
  return knex.raw('DROP TABLE test');
};
