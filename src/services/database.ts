const { Sequelize } = require("@sequelize");

// Récupération des informations de connexion à partir de variables d'environnement
const { DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_HOST } =
  process.env;

// Création de la connexion à la base de données PostgreSQL
export const database = new Sequelize(
  DATABASE_NAME,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  {
    host: DATABASE_HOST,
    dialect: "postgres",
  }
);
