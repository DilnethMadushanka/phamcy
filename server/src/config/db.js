const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
const dialect = process.env.DB_DIALECT || (databaseUrl ? 'postgres' : 'sqlite');

let sequelize;

if (databaseUrl) {
  // Cloud Database Connection via Connection String (e.g. Neon, Supabase, Render, Railway, Aiven)
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'false' ? false : {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else if (dialect === 'postgres') {
  // Cloud / External PostgreSQL Connection via parameters
  sequelize = new Sequelize(
    process.env.DB_NAME || 'pharmacy_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false,
        } : false,
      },
    }
  );
} else {
  // Local SQLite fallback
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false,
  });
}

module.exports = sequelize;
