exports.up = async (knex) => {
  return knex.raw('CREATE TABLE test (code INTEGER PRIMARY KEY)');
};

exports.down = function(knex, Promise) {
  return knex.raw('DROP TABLE test');
};
