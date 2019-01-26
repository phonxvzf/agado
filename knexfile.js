require('dotenv').config();

const config = {
  host: '127.0.0.1',
  database: process.env.MYSQL_DB,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
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
    client: 'mysql',
    connection: config,
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  development: {
    client: 'mysql',
    connection: config,
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'mysql',
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
