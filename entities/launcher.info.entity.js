const Sequelize = require('sequelize');

module.exports = class LauncherInformation extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            ansibleEnable: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            projectName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            cloudVendor: {
                type: Sequelize.STRING,
                allowNull: false
            },
            terraformInfo: {
                type: Sequelize.STRING(1000)
            },
            ansibleInfo: {
                type: Sequelize.STRING(1000)
            },
            type: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.STRING
            },
            result: {
                type: Sequelize.STRING
            },
            errorMsg: {
                type: Sequelize.STRING(1000)
            },
            createDate: {
                type: Sequelize.DATE
            },
            updateDate: {
                type: Sequelize.DATE
            },
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'LauncherInformation',
            tableName: 'cmkp_launcher_info',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        });
    }
};