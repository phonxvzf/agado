import config from '../common/config';
import knex from 'knex';

const db = knex({
  client: 'pg',
  connection: {
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
  },
  pool: {
    min: 2,
    max: 10,
  },
});

export default db;
