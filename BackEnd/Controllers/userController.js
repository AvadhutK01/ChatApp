const userModel = require("../Models/UserModel");
const bcrypt = require('bcrypt');
const sequelize = require("../dbConnect");
const path = require('path');
const jwt = require('jsonwebtoken');
module.exports.getRegistrationPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'FrontEnd', 'Views', 'RegistrationPage.html'))
}

module.exports.getLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'FrontEnd', 'Views', 'LoginPage.html'))
}

module.exports.RegisterUser = async (req, res) => {
    const newName = req.body.nameInput;
    const newPhoneNO = req.body.phoneInput;
    const newEmail = req.body.emailInput;
    const newPasswordInput = req.body.passwordInput;
    const transaction = await sequelize.transaction();
    try {
        const hashedPassword = await bcrypt.hash(newPasswordInput, 10);
        await userModel.create({
            name: newName,
            phoneNO: newPhoneNO,
            email: newEmail,
            password: hashedPassword
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
    const phoneNO = req.body.phoneNO;
    const password = req.body.password;

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