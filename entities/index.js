const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const LauncherInformation = require('./launcher.info.entity');
const LauncherRole = require('./launcher.role.entity');

const db = {};
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.LauncherInformation = LauncherInformation;
db.LauncherRole = LauncherRole;

LauncherInformation.init(sequelize);
LauncherRole.init(sequelize);

module.exports = db;
