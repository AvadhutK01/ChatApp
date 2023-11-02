const userModel = require("../Models/UserModel");
const bcrypt = require('bcrypt');
const sequelize = require("../dbConnect");
const path = require('path');
const jwt = require('jsonwebtoken');
const moment = require("moment/moment");
const crypto = require('crypto');
module.exports.getRegistrationPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'FrontEnd', 'Views', 'RegistrationPage.html'))
}

module.exports.getLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'FrontEnd', 'Views', 'LoginPage.html'))
}


module.exports.RegisterUser = async (req, res) => {
    const newName = req.body.name;
    const newPhoneNO = req.body.phoneNo;
    const newEmail = req.body.email;
    const newPasswordInput = req.body.password;
    const transaction = await sequelize.transaction();
    try {
        const hashedPassword = await bcrypt.hash(newPasswordInput, 10);
        const currentDateTime = moment().format('DD/MM/YYYY, hh:mm A');
        await userModel.create({
            id: getRandomInt(100000, 999999),
            name: newName,
            phoneNO: newPhoneNO,
            email: newEmail,
            password: hashedPassword,
            lastSeen: currentDateTime,
        }, { transaction });

        await transaction.commit();
        res.status(201).json({ message: 'success' });
    } catch (error) {
        await transaction.rollback();
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(409).json({ message: 'exist' });
        } else {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

module.exports.verifyLogin = async (req, res) => {
    const phoneNO = req.body.phoneNo;
    const password = req.body.password;
    console.log(req)
    const t = await sequelize.transaction();
    try {
        let data = await userModel.findOne({
            where: {
                phoneNO: phoneNO
            },
            transaction: t
        });

        if (data) {
            const checkLogin = await bcrypt.compare(password, data.password);
            if (checkLogin) {
                // await userModel.update({ lastSeen: currentDateTime }, { where: { id: data.id }, transaction: t });

                await t.commit();
                res.status(201).json({ message: 'success', token: generateAccessToken(data.id) });
            } else {
                await t.rollback();
                res.status(401).json({ message: 'Failed' });
            }
        } else {
            await t.rollback();
            res.status(404).json({ message: 'NotExist' });
        }
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

function generateAccessToken(id) {
    return jwt.sign({ userid: id }, process.env.SECRETKEY);
}

function getRandomInt(min, max) {
    const buffer = crypto.randomBytes(4);
    const randomNumber = buffer.readUInt32LE(0);
    return Math.floor(randomNumber / 0xFFFFFFFF * (max - min + 1) + min);
}