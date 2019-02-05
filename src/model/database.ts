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
    afterCreate: (con, done) => {
      con.query('SET timezone TO \'UTC\';', (err) => {
        done(err, con);
      });
    },
  },
});

export default db;
