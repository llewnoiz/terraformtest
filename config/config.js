require('dotenv').config();
module.exports = {
  "development": {
    "username": process.env.SEQUELIZE_USER,
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": process.env.SEQUELIZE_DATABASE,
    "host": process.env.SEQUELIZE_PASSWORD,
    "dialect": "mysql"
  },
  "stage": {
    "username": process.env.SEQUELIZE_USER,
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": process.env.SEQUELIZE_DATABASE,
    "host": process.env.SEQUELIZE_HOST,
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.SEQUELIZE_USER,
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": process.env.SEQUELIZE_DATABASE,
    "host": process.env.SEQUELIZE_HOST,
    "dialect": "mysql"
  }
}
