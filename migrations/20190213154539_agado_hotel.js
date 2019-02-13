const fs = require('fs');

exports.up = async (knex) => {
  const sql = fs.readFileSync('sql/agado_hotel.sql').toString();
  return knex.raw(sql);
};

exports.down = async (knex) => {
  await knex.raw('DROP TABLE hotel_room_tag');
  await knex.raw('DROP TABLE hotel_room');
  await knex.raw('DROP TABLE hotel_manager');
  await knex.raw('DROP TABLE hotel');
  // await knex.raw('ALTER TYPE user_types RENAME ATTRIBUTE hotel_manager TO hotel CASCADE')
  await knex.raw('DROP TYPE permission_status');
  await knex.raw('DROP TYPE room_property');
  await knex.raw('DROP TYPE room_status');
};
