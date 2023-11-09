const { Sequelize } = require("sequelize");
const sequelize = require("../dbConnect");
const GroupNameData = sequelize.define('GroupNameData', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    profiePicture: {
        type: Sequelize.STRING,
        defaultValue: 'https://chatfilebucket.s3.eu-north-1.amazonaws.com/dpdefault.jpg'
    },
    GroupName: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
module.exports = GroupNameData;