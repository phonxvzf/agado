import dotenv from 'dotenv';

dotenv.config();

const config = {
  SERVICE_PORT: process.env.PORT || 8080,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
};

export default config;
