const { Sequelize } = require("sequelize");
const sequelize = require("../dbConnect");
const user = sequelize.define('userData', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    profiePicture: {
        type: Sequelize.STRING,
        defaultValue: 'https://chatfilebucket.s3.eu-north-1.amazonaws.com/dpdefault.jpg'
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    phoneNO: {
        type: Sequelize.BIGINT,
        unique: true,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
module.exports = user;