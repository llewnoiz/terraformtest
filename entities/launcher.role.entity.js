const Sequelize = require('sequelize');

module.exports = class LauncherRole extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            id : {
                type: Sequelize.INTEGER
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false
            },
            role: {
                type: Sequelize.STRING,
                allowNull: false
            },
            rolePath: {
                type: Sequelize.STRING,
                allowNull: false
            },
            roleDesc: {
                type: Sequelize.STRING,
            },
            sorting: {
                type: Sequelize.INTEGER,
                allowNull:  false
            },
            useYn: {
                type: Sequelize.STRING,
                allowNull:  false
            },
            version: {
                type: Sequelize.STRING,
            },
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'LauncherRole',
            tableName: 'cmkp_launcher_roles',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        });
    }
};