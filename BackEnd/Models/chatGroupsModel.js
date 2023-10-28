const { Sequelize } = require("sequelize");
const sequelize = require("../dbConnect");
const GroupNameData = sequelize.define('GroupNameData', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    GroupName: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
module.exports = GroupNameData;