import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const config = {
  // General
  SERVICE_PORT: process.env.PORT || 8080,

  // Database-related
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,

  // Authentication-related
  JWT_SUBJECT: process.env.JWT_SUBJECT || 'agado-jwt',
  JWT_SECRET: process.env.JWT_SECRET || crypto.randomBytes(20).toString('base64'),
  JWT_ISSUER: process.env.JWT_ISSUER || 'agado',
  JWT_TTL: process.env.JWT_TTL || '15m',
};

export default config;
