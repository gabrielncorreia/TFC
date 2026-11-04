import 'dotenv/config';
import { Options } from 'sequelize';

// The fallbacks below are the local Docker defaults; production must never use them.
if (process.env.NODE_ENV === 'production') {
  const missing = ['DB_USER', 'DB_PASS', 'DB_NAME', 'DB_HOST', 'DB_PORT']
    .filter((name) => !process.env[name] || (name === 'DB_PORT' && !Number(process.env[name])));
  if (missing.length) throw new Error(`Missing or invalid database settings: ${missing.join(', ')}`);
}

const config: Options = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '123456',
  database: process.env.DB_NAME || 'TRYBE_FUTEBOL_CLUBE',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3002,
  dialect: 'mysql',
  // Sequelize loads its driver by a computed name, which Vercel's bundler cannot trace; pass it in.
  dialectModule: require('mysql2'),
  dialectOptions: {
    timezone: 'Z',
    // TiDB Cloud requires TLS; Node's built-in CA store already trusts its certificate.
    ...(process.env.DB_SSL === 'true' && { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } }),
  },
  logging: false,
}

module.exports = config;
