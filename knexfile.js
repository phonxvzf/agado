require('dotenv').config();

const config = {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
  socketPath: `/cloudsql/${process.env.GCLOUD_MYSQL_INSTANCE}`,
  multipleStatements: true,
};

if (process.env.GCLOUD_MYSQL_INSTANCE) {
  delete config.host;
} else {
  delete config.socketPath;
}

module.exports = {
  test: {
    client: 'pg',
    connection: config,
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  development: {
    client: 'pg',
    connection: config,
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  CI: {
    client: 'pg',
    connection: config,
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'pg',
    connection: config,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};
